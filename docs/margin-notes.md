# Margin notes

Posts can push short asides into the right-hand margin of the article, beside
the paragraph they belong to. Notes are written in the post markdown, in the
posts repository, not here.

## Writing one

The syntax is [GitHub alerts](https://docs.github.com/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts), which is ordinary
markdown that GitHub already understands:

```markdown
> [!NOTE]
> Billing follows the session, not the request. The microVM stays alive until
> the idle timeout expires.
```

Nothing about this is specific to the site. GitHub renders it as a styled
callout in the posts repo, and anywhere that has never heard of the syntax
(dev.to and other cross-posting targets) falls back to a plain blockquote. The
note is still readable in every one of those places.

## Where each kind ends up

| Kind | Placement | Use it for |
| --- | --- | --- |
| `NOTE` | Right margin | Context, a caveat, the thing you found out the hard way |
| `TIP` | Right margin | A shortcut, a faster way to check something |
| `IMPORTANT` | In the text | Something the reader has to act on |
| `WARNING` | In the text, accented | Something that will break if ignored |
| `CAUTION` | In the text, accented | Data loss, cost, anything expensive to get wrong |

The split is deliberate: a margin note is skippable by design, so anything a
reader must not miss stays in the flow where it interrupts them.

## Placement

A margin note aligns with the block that **follows** it, so write it directly
above the paragraph it should sit beside:

```markdown
> [!NOTE]
> This appears beside the next paragraph.

The paragraph the note is about.
```

Below 1080px there is no margin to put anything in, so notes fold back into the
text as bordered blocks in the position they were written.

## Optional label

A note is labelled with its kind by default. Text on the marker line replaces
that label:

```markdown
> [!NOTE] Sharp edge
> ...
```

This is a local extension. GitHub only recognises `> [!NOTE]` alone on the
line, so adding a label means GitHub shows a plain blockquote instead of its
alert styling. Use it when the label earns the trade.

## Previewing before publishing

Point the build at a local checkout of the posts repo rather than the API:

```bash
POSTS_DIR=../ganhammar-posts npm run build && npm run preview:static
```

The same variable works for `npm run dev`.

## Proposed notes for the existing posts

Seven notes drawn from the current archive, each saying something the post does
not already say. They are anchored to a line of existing text; the note goes
immediately after it unless stated otherwise.

**dotnet-8-aot-aws-lambda.mdx**

1. After "…we're going to target `linux-x64`…" — that x64 is a consequence of
   the runner, and an ARM64 runner would let you target `linux-arm64` with
   `Architecture.ARM_64` for cheaper invocations.
2. Before "3. **Reflection and Dynamic Loading**" (a `TIP`) — publishing with
   `-p:PublishAot=true` and reading the trim warnings is the fastest way to
   find out whether AOT is realistic for an existing project.

**api-routing-using-cloudfront-function.mdx**

3. After "The function must use the JavaScript runtime 2.0." — the `cloudfront`
   module that exposes `updateRequestOrigin` does not exist in the 1.0 runtime,
   which is why the version matters.

**lambda-at-edge-authorizer.mdx**

4. After the two-templates paragraph — deleting an edge function is also a
   two-step affair, because CloudFront replicates the removal to every location
   before the stack will come down.

**fine-grained-authorization-with-amazon-cognito.mdx**

5. After the note about missing Pre Token Generation V2 types — once they land
   in `@types/aws-lambda` the local declarations become a conflicting
   duplicate, so it is worth re-checking.

**building-a-centaur-chess-app-…mdx**

6. After "Sessions can persist for up to 8 hours…" — billing follows the
   session rather than the request, so a game with long pauses pays for idle
   time.

**blazingly-fast-serverless-note-app-part-2.mdx**

7. After the `wasm-tools` instruction — the workload is tied to the SDK feature
   band and has to be reinstalled after an SDK upgrade.

These live in the posts repository, so they are not applied by anything in this
repo. `margin-notes.patch` (handed over alongside this change) applies all
seven with `git apply`.
