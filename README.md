# IFEELVOID — a Claude theme

Near-black void. Purple used like a blade, not a paint roller. Cold contrast, no pastel, no generic dark mode.

Four dark looks for the Claude desktop and mobile apps, switching by the clock (America/New_York). The terminal keeps its own colors.

| Look | When | What it is |
| --- | --- | --- |
| **Release Mode** | 8am–6pm | Pure black and white, one purple, stronger borders. Built to be read tired. |
| **Signal Bleed** | 6pm–midnight | The void, alive: scanlines drifting down the edges, a slow roll bar, purple glitch tears in the margins. |
| **Studio Night** | midnight–8am | Same black, lit by VU-meter amber. |
| **IFEELVOID** | on demand | The still original: purple-tinted black and a black-to-deep-purple ground. |

## Switching by hand

```
/void signal-bleed
/void studio-night
/void release
/void void
/void auto
```

A pick holds until `/void auto` puts it back on the schedule. Signal Bleed stays still when the system asks for reduced motion.

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

Colors and the schedule live in `hooks/looks.ts`; the Signal Bleed scene in `hooks/scene.ts`.
