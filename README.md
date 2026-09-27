> **📌 This repository hosts code for RF Swift Documentation for RF Swift project.
> If you were looking for RF Swift, go to [its main repo](https://github.com/PentHertz/RF-Swift/)**
___

# RF Swift Documentation v2

This repository hosts the files deployed on https://rfswift.io.

The site is a plain Hugo site with its own theme (no Hugo modules, no Go toolchain needed).

## Run it locally

Requires [Hugo extended](https://gohugo.io/installation/) 0.147 or newer.

```bash
hugo server          # http://localhost:1313, rebuilds on save
hugo --gc -d public  # production build (what CI runs)
```

## Where things live

| What | Where |
|---|---|
| Home page copy (hero, Workbench, benefits, install tabs, learning paths, FAQ) | `data/home.yaml` — edit text there, not in the templates |
| Docs sidebar: groups, order, labels | `data/docsnav.yaml` — also drives the Previous / Next links |
| Icon names used in content → Phosphor icons | `data/icons.yaml` |
| Colours, spacing, all styles | `assets/css/main.css` (colour tokens at the top) |
| Tabs, copy buttons, search, menus | `assets/js/main.js` |
| Page templates | `layouts/` (`index.html` home, `docs/` documentation, `partials/`, `shortcodes/`) |
| Site settings (videos, links, logo colour) | `hugo.yaml` → `params` |
| Docs pages | `content/docs/` |

Search is built at compile time into `/search-index.json` (one record per page section) and runs in the browser: press <kbd>Ctrl</kbd> <kbd>K</kbd> or <kbd>/</kbd> on any page.

## Writing a docs page

Front matter:

```yaml
---
title: Quick start
linkTitle: Quick start          # optional, shorter sidebar label
description: One sentence shown under the title and as the meta description.
level: beginner                 # beginner | intermediate | advanced | reference (shows a badge)
weight: 6
---
```

- Don't start the body with a `# Title`: the layout prints the title.
- To show a page in the sidebar, add it to `data/docsnav.yaml`. Pages in a listed section (for example every command under `/docs/commands`) appear automatically, ordered by `weight`, grouped by their `navGroup`.
- Keep beginner pages beginner-first: the steps first, then an **Advanced** section or a collapsible `details` block for flags and edge cases.

### Shortcodes

```markdown
{{< callout type="info" title="Optional title" >}}Text{{< /callout >}}
<!-- types: tip, info, warning, error, important, beginner -->

{{< tabs items="Linux,macOS,Windows" >}}
  {{< tab >}}Linux content{{< /tab >}}
  {{< tab >}}macOS content{{< /tab >}}
  {{< tab >}}Windows content{{< /tab >}}
{{< /tabs >}}
<!-- A tab named after an OS opens for readers on that OS; picking a tab picks the same one everywhere on the page. -->

{{% steps %}}
### First step
...
### Second step
...
{{% /steps %}}

{{% details title="All the options" level="advanced" %}}
Hidden until the reader opens it.
{{% /details %}}

{{< cards >}}
  {{< card link="/docs/quick-start/" title="Quick start" icon="rocket-launch" subtitle="Your first lab" tag="Beginner" >}}
{{< /cards >}}

{{< youtube id="LBUJcKiZVgM" title="RF Swift Workbench tour" >}}
{{< csv-table "content/docs/guide/precompimages.csv" >}}
```

Mermaid diagrams work in fenced ```` ```mermaid ```` blocks. Icons are [Phosphor](https://phosphoricons.com) names.
