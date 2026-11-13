# Contributing to Keyboard Cheat Codes ⌨️

Welcome! Thank you for helping make **Keyboard Cheat Codes** ([keyboardcheat.codes](https://www.keyboardcheatcodes.com)) the best open-source interactive 3D mechanical keyboard playground, switch sound synthesizer, and developer shortcut trainer.

We actively welcome **first-time open-source contributors**! Whether you are adding a custom keycap colorway, a new application shortcut pack, or a mechanical switch sound profile, most issues can be completed in **5–10 minutes**.

---

## 🎯 Rules for `good first issue` Tasks

To give as many developers as possible a chance to contribute:
1. **One `good first issue` per contributor:** Please only claim **1** `good first issue` ticket so at least 20+ community members can get a merged PR.
2. **Comment before starting:** Comment `"I'd like to work on this!"` on the issue so others know it's taken.
3. **Keep PRs focused:** Only modify the files needed for your colorway or shortcut pack.

---

## 🚀 Quickstart (5 Minutes)

1. **Fork** this repository using the **Fork** button at the top right of this page.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/keyboard-cheat-codes.git
   cd keyboard-cheat-codes
   ```
3. **Create a new branch** for your contribution:
   ```bash
   git checkout -b feat/add-your-feature-name
   ```
4. **Preview locally:** Open `index.html` in your browser (or run `npx serve .`) to test your changes live.

---

## 🎨 How to Add a New Keycap Colorway

Each colorway defines the palette for the board case, alpha keys, modifier keys, accent keys (Esc / Enter / Space), and key legends:

```js
{
  id: "dracula",
  name: "Dracula",
  caseColor: "#1e1f29",
  alphaBg: "#282a36",
  alphaText: "#f8f8f2",
  modBg: "#44475a",
  modText: "#bd93f9",
  accentBg: "#ff79c6",
  accentText: "#282a36"
}
```

### Checklist for Colorway PRs:
- [ ] All hex color codes are valid 6-character hex strings (`#RRGGBB`).
- [ ] Legend text (`alphaText`, `modText`, `accentText`) has clear contrast against its keycap background.
- [ ] The colorway appears in the UI selector and renders cleanly on the keyboard.

---

## ⚡ How to Add a New Shortcut Cheat-Sheet Pack

Each shortcut pack provides interactive practice bindings so developers can train muscle memory without triggering browser defaults:

```js
{
  id: "vscode",
  name: "VS Code Essentials",
  category: "IDE & Editors",
  shortcuts: [
    {
      keys: ["Control", "Shift", "P"],
      macKeys: ["Meta", "Shift", "P"],
      label: "Open Command Palette",
      description: "Access all commands and settings by name"
    },
    {
      keys: ["Control", "P"],
      macKeys: ["Meta", "P"],
      label: "Quick Open File",
      description: "Jump to any file in the workspace by name"
    },
    {
      keys: ["Control", "`"],
      macKeys: ["Control", "`"],
      label: "Toggle Integrated Terminal",
      description: "Show or hide the built-in terminal panel"
    }
  ]
}
```

### Checklist for Shortcut Pack PRs:
- [ ] Includes **6 to 10** essential, accurate keyboard shortcuts for the target application.
- [ ] Uses standard `KeyboardEvent.key` / modifier names (`Control`, `Shift`, `Alt`, `Meta`).
- [ ] Tested in the browser shortcut trainer view.

---

## 📬 Submitting Your Pull Request

1. Stage and commit your changes:
   ```bash
   git add .
   git commit -m "feat: add [Name] colorway / shortcut pack (closes #ISSUE_NUMBER)"
   ```
2. Push your branch to your fork:
   ```bash
   git push origin feat/add-your-feature-name
   ```
3. Open a **Pull Request** against `techkayacodes/keyboard-cheat-codes` (`main` branch) and reference the issue number (`Closes #...`).
