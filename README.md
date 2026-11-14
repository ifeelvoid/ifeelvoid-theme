# IFEELVOID — a Claude theme

Near-black void. Purple used like a blade, not a paint roller. Cold contrast, no pastel, no generic dark mode.

A dark-only look for the Claude desktop and mobile apps: purple-tinted black surfaces a few steps apart, a `#9D4EDD` accent for focus and action, `#7B2CBF` for literals, cool off-white text, and a still black-to-deep-purple ground that glows faintly under the message box. The terminal keeps its own colors.

## Install

At the prompt of a terminal session:

```
/plugin install ifeelvoid --marketplace ifeelvoid/ifeelvoid-theme
```

Answer `y` to add the marketplace, then pick a scope.

From a shell:

```bash
claude plugin install ifeelvoid --marketplace ifeelvoid/ifeelvoid-theme
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `ifeelvoid/ifeelvoid-theme`, then Add plugin.

## Palette

| Role | Hex |
| --- | --- |
| Void (page) | `#060408` |
| Cards / panels / menus | `#0c0910` / `#110d16` / `#16111c` |
| Accent | `#9D4EDD` |
| Deep purple | `#7B2CBF` |
| Text | `#efecf3` |
| Ground | `#000000` → `#1A0D26` |

Colors live in `hooks/register.ts`.
