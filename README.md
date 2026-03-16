# Lucid Architecture for VS Code

<p align="center"><img src="https://github.com/lucidarch/vscode-lucid/blob/main/preview-1.png?raw=true" alt="Lucid Architecture VSCode Extension Referencing"></p>
<p align="center"><img src="https://github.com/lucidarch/vscode-lucid/blob/main/preview-2.png?raw=true" alt="Lucid Architecture VSCode Extension Go To Job"></p>

[![Version](https://img.shields.io/visual-studio-marketplace/v/lucidarch.vscode-lucid)](https://marketplace.visualstudio.com/items?itemName=lucidarch.vscode-lucid)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/lucidarch.vscode-lucid)](https://marketplace.visualstudio.com/items?itemName=lucidarch.vscode-lucid)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

VS Code extension for [Lucid Architecture](https://lucidarch.site) — bring the CLI into the command palette, navigate your Features/Jobs/Operations from a sidebar tree view, and jump to any unit inline from `->run()` calls.

Works with both **Micro** and **Monolith** Lucid projects. Automatically activates when `vendor/lucidarch/lucid` is detected in the workspace.

---

## Features

### Make Commands

Run any `lucid make:*` command directly from the command palette without leaving the editor. The extension collects arguments interactively — offering existing domains and services as quick picks — then opens the generated file automatically.

**Cmd+Shift+P** (or Ctrl+Shift+P) → type `Lucid:`:

| Command | Description |
|---------|-------------|
| `Lucid: Make Feature` | Creates a new Feature class |
| `Lucid: Make Job` | Creates a new Job; prompts for domain and queueable option |
| `Lucid: Make Operation` | Creates a new Operation |
| `Lucid: Make Service` | Creates a new Service (Monolith only) |
| `Lucid: Make Controller` | Creates a new Controller |
| `Lucid: Make Model` | Creates a new Model |
| `Lucid: Make Request` | Creates a new Form Request |
| `Lucid: Make Policy` | Creates a new Policy |
| `Lucid: Make Migration` | Creates a new Migration |
| `Lucid: Initialize Micro` | Scaffolds a new Micro project |
| `Lucid: Initialize Monolith` | Scaffolds a new Monolith project |
| `Lucid: Delete Feature/Job/Operation` | Removes a unit with confirmation |
| `Lucid: Show Unused Units` | Lists all Jobs/Operations not used by any Feature or Operation |

Generated files use the Lucid package's own stubs — template updates in the package are reflected automatically.

### Explorer Tree View

The **Lucid Architecture** panel in the Explorer sidebar shows your project structure at a glance:

- **Micro** — Features / Domains (with Jobs) / Operations
- **Monolith** — Services (with Features and Operations) / Domains (with Jobs)

Click any node to open the file. Right-click a Domain node to **Make Job in this context** (domain pre-filled), or right-click a Service node to **Make Feature in this context**.

The tree refreshes automatically when files are added or deleted.

### CodeLens on `->run()` Calls

Every `->run()` call in a Feature or Operation file gets an inline **→ Go to ClassName** link. Clicking it navigates directly to that Job or Operation file.

Handles all three call styles:

```php
$this->run(FindProductJob::class);
$this->run(new FindProductJob($id));
$this->run('FindProductJob');
```

Every Job and Operation class declaration also shows a **Used by N units** link. Clicking it opens a quick-pick list of every Feature or Operation that calls `->run()` with that class, each entry navigating to the exact line.

### Go to Definition (Ctrl+Click / F12)

Ctrl+Click (or F12) on any class name inside a `->run()` or `->serve()` call jumps directly to that unit's file — no PHP language server required. Works with all call styles including multi-line instantiations:

```php
$this->run(new AttachProductImagesJob(
    productId: $product->id,
    images: $request->file('images'),
));
```

### Find All References (Shift+F12)

Place the cursor on a Job or Operation class name and press Shift+F12 (or right-click → Find All References) to see every `->run()` call site across the project listed in the References panel.

### Hover Tooltips

Hover over a class name inside `->run()` or `->serve()` for an inline summary — no navigation needed.

**Jobs and Operations** show the constructor signature (with visibility/`readonly` modifiers stripped for readability) and the `handle()` return type, plus a usage count:

```
FindProductJob
──────────────
FindProductJob(string $id, bool $withVariants = false)
handle(): Product
Used by 2 units: GetProductFeature, UpdateProductFeature
```

**Features** show the ordered sequence of `->run()` calls — effectively an inline `lucid feature:describe`:

```
ListProductsFeature
───────────────────
1. ParseProductFiltersJob
2. GetProductsJob
3. TrackProductListingViewJob
```

### Unused Units Diagnostic

Jobs and Operations that are not called by any Feature or Operation receive a **hint diagnostic** (dotted underline) on their class declaration. They also appear in the Problems panel (`Cmd+Shift+M`) under the Lucid source.

Run **`Lucid: Show Unused Units`** from the command palette for a full quick-pick list of every unreferenced unit, each clickable to navigate.

Diagnostics update automatically 5 seconds after any PHP file is saved. Disable entirely via the `lucid.diagnostics.unusedUnits` setting.

### Snippets

Type a prefix in any PHP file and press Tab:

| Prefix | Expands to |
|--------|-----------|
| `lucid-job` | Job class with constructor promotion |
| `lucid-qjob` | Queueable Job class (`implements ShouldQueue`) |
| `lucid-feature` | Feature class with `handle(Request $request)` |
| `lucid-operation` | Operation class with constructor promotion |
| `lucid-run` | `$this->run(new JobName(...))` call |

### Status Bar

Shows the detected project mode in the bottom-right corner:

```
⊞ Lucid: Micro    or    ⊞ Lucid: Monolith
```

---

## Requirements

- VS Code `^1.85.0`
- A Laravel project with `lucidarch/lucid` installed via Composer (`vendor/lucidarch/lucid` must exist)

The make/delete/init commands require a working `vendor/bin/lucid` binary. The tree view and CodeLens work without it.

---

## Extension Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `lucid.binaryPath` | `""` | Custom path to the Lucid CLI binary. Leave empty to use `./vendor/bin/lucid`. |
| `lucid.mode` | `"auto"` | Override mode detection: `"auto"`, `"micro"`, or `"monolith"`. |
| `lucid.showCodeLens` | `true` | Show inline `->run()` navigation links. |
| `lucid.treeView.showTestFiles` | `false` | Show test file nodes in the tree view. |
| `lucid.diagnostics.unusedUnits` | `true` | Show a hint diagnostic on Job/Operation class declarations that are not used by any Feature or Operation. |

---

## Project Structure Support

The extension mirrors the directory conventions from [`Finder.php`](https://github.com/lucidarch/lucid/blob/main/src/Finder.php) exactly:

| Unit | Micro | Monolith |
|------|-------|----------|
| Features | `app/Features/` | `app/Services/*/Features/` |
| Jobs | `app/Domains/*/Jobs/` | `app/Domains/*/Jobs/` |
| Operations | `app/Operations/` | `app/Services/*/Operations/` |
| Services | — | `app/Services/*/` |
| Domains | `app/Domains/*/` | `app/Domains/*/` |

---

## Contributing

```bash
git clone https://github.com/lucidarch/vscode-lucid
cd vscode-lucid
npm install

# Open in VS Code and press F5 to launch the Extension Development Host
code .
```

Bug reports and pull requests are welcome at [github.com/lucidarch/vscode-lucid](https://github.com/lucidarch/vscode-lucid/issues).

---

## License

MIT © [Lucid Architecture](https://lucidarch.site)
