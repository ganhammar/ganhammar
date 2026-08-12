# Publishing a post

Posts are markdown in [ganhammar/ganhammar-posts](https://github.com/ganhammar/ganhammar-posts).
The site reads them once, at build time, and prerenders every page to a static
file. Nothing here reads the posts repo at request time.

So a push to the posts repo has to rebuild this one. That is wired up: a
workflow there fires a `repository_dispatch` at `ganhammar/ganhammar`, which
the `CI-CD` workflow listens for as `posts-updated`.

```
push to posts/**  ──►  publish.yml (posts repo)  ──►  repository_dispatch
                                                          │
                       CI-CD (this repo): build, test, deploy, smoke  ◄┘
```

The dispatch is authenticated with `GANHAMMAR_CONTENTS_TOKEN`, a secret in the
**posts** repo holding a fine-grained PAT with **Contents: read and write** on
`ganhammar/ganhammar` only. Both halves are easy to get backwards: the token is
scoped to the repo being triggered, and the secret lives in the repo doing the
triggering.

## Publishing

Set `status: published` in the frontmatter and push. The site rebuilds and the
post appears.

A post with `status: draft` is prerendered too, so it can be opened directly at
`/posts/<id>`, but it is left out of the index, the sitemap and the feed, it is
skipped by the prev/next links, and it carries `noindex, nofollow`. It takes no
entry number until it is published.

## If nothing happens

1. Check the Publish run in the posts repo. A red run means the token expired
   or lost access.
2. Run `CI-CD` manually from this repo's Actions tab, or Publish from the posts
   repo, which does the same thing without a content change.
3. Failing both, the site rebuilds on a schedule at 05:17 UTC daily.

## Checking a draft before pushing

```bash
POSTS_DIR=../ganhammar-posts npm run dev
```

Reads the posts from disk instead of the API, so unpushed edits render as they
will in production. See [margin-notes.md](margin-notes.md) for the aside
syntax.
