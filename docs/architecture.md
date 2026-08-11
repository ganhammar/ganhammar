# Architecture

SvelteKit, prerendered to static files, served from S3 behind CloudFront.

## How a page is served

Posts are markdown in a separate repository,
[ganhammar/ganhammar-posts](https://github.com/ganhammar/ganhammar-posts). They
are read **once, at build time**. Every route is prerendered to HTML, and the
result is uploaded to S3.

There is no server in the request path. A page view is an edge cache hit, or on
a miss one read from S3. Nothing parses markdown, calls the GitHub API, or
boots a runtime while somebody is waiting.

```
posts repo ──► build (fetch, parse, highlight, prerender) ──► S3 ──► CloudFront ──► visitor
                        once per deploy                              cached at edge
```

The only code that runs per request is a CloudFront Function that maps `/about`
onto the `about.html` key in the bucket. It lives in
[`infra/edge/rewrite.js`](../infra/edge/rewrite.js) and is imported directly by
the local server and the tests, so the rule is verified rather than duplicated.

A page carries no framework JavaScript. `csr: false` means nothing hydrates,
and the stylesheet is inlined, so a cold visit is a single request. The one
script on the site is a few lines in `app.html` that highlight the current
section in the contents rail.

## Reading from the posts repo

Content is fetched from URLs pinned to a commit SHA, not to `main`.
`raw.githubusercontent.com` serves a branch path through a cache that can lag a
push by minutes and ignores `no-store`, so a build triggered by publishing
would otherwise stand a good chance of baking in the previous version of the
post that triggered it. A commit-addressed URL is immutable, so its cache can
only ever be right.

One recursive tree read lists every post and asset; each post is then fetched
once and memoised for the whole build.

## Layout

| Path | What |
| --- | --- |
| `src/lib/github.ts` | Reads posts from the API, or from disk via `POSTS_DIR` |
| `src/lib/markdown.ts` | Frontmatter, highlighting, margin notes, headings |
| `src/lib/components/Figure.svelte` | The exploded drawing, geometry computed at build time |
| `src/routes/` | Index, post, about, 404, plus `sitemap.xml` and `rss.xml` |
| `src/app.css` | The whole design system, including the syntax theme |
| `infra/` | CDK stack and the edge rewrite function |
| `e2e/` | Static server mirroring CloudFront, and the test suite |

## Commands

```bash
npm run dev              # dev server, posts from the API
npm run build            # prerender everything into build/
npm run preview:static   # serve build/ with the production URL rules
npm run test:e2e         # assert the prerendered output is correct
npm run check            # svelte-check
npm run deploy           # cdk deploy
```

Reading posts needs a GitHub token. `npm run dev` falls back to `gh auth token`;
CI passes `API_TOKEN`. To work against a local checkout of the posts instead:

```bash
POSTS_DIR=../ganhammar-posts npm run dev
```

## Related

- [Publishing a post](publishing.md)
- [Margin notes](margin-notes.md)
