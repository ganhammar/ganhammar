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

Write the note **after** the paragraph it comments on, which is the order it
has to be read in on a phone:

```markdown
The paragraph the note is about.

> [!NOTE]
> This appears beside the paragraph above it.
```

At parse time the paragraph and the note are grouped, and on a wide screen the
note is positioned against that pair, so it lines up with the top of its
paragraph rather than drifting down to whatever comes next.

Only paragraphs are paired. A note written after a list or a code block is left
to float, which puts it level with the block after it, because aligning to the
top of a long listing would drag it well above where it was written. Put the
note after a paragraph if you want it beside one.

Below 1080px there is no margin to put anything in, so notes fold back into the
text as bordered blocks, still after their paragraph.

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
