# Publishing a post

Posts are markdown in [ganhammar/ganhammar-posts](https://github.com/ganhammar/ganhammar-posts).
The site reads them once, at build time, and prerenders every page to a static
file. Nothing here reads the posts repo at request time.

That means **pushing a post does not publish it**. The site has to rebuild.

## Making the posts repo trigger a rebuild

Add this workflow to the **posts** repository as
`.github/workflows/publish.yml`:

```yaml
name: Publish

on:
  push:
    branches: [main]
    paths:
      - 'posts/**'

jobs:
  rebuild-site:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger site rebuild
        env:
          GH_TOKEN: ${{ secrets.SITE_DISPATCH_TOKEN }}
        run: |
          gh api repos/ganhammar/ganhammar/dispatches \
            --field event_type=posts-updated
```

`SITE_DISPATCH_TOKEN` is a fine-grained personal access token with **Contents:
read and write** on `ganhammar/ganhammar` only. That is the permission
`repository_dispatch` requires; it does not need access to anything else.

The site workflow already listens for `posts-updated`.

## If the trigger is not set up

Three fallbacks, in order of convenience:

1. The site rebuilds on a daily schedule (05:17 UTC), so a new post appears
   within a day on its own.
2. Run the `CI-CD` workflow manually from the Actions tab.
3. Push anything to the site repo.

## Checking a draft first

`status: draft` in the frontmatter keeps a post out of the build entirely. To
see how a finished post will look before pushing it:

```bash
POSTS_DIR=../ganhammar-posts npm run dev
```

That reads the posts from disk instead of the API, so drafts and unpushed edits
render exactly as they will in production. See
[margin-notes.md](margin-notes.md) for the aside syntax.
