# claude-skill-github-pages-deployer

[![npm version](https://img.shields.io/npm/v/claude-skill-github-pages-deployer)](https://www.npmjs.com/package/claude-skill-github-pages-deployer)
[![npm downloads](https://img.shields.io/npm/dm/claude-skill-github-pages-deployer)](https://www.npmjs.com/package/claude-skill-github-pages-deployer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-blue)](https://claude.ai/claude-code)
[![GitHub Pages](https://img.shields.io/badge/Deploys%20to-GitHub%20Pages-222?logo=github)](https://pages.github.com/)

> A **Claude Code skill** that automates end-to-end deployment of frontend projects to GitHub Pages — from `git init` to a live URL — without asking you to run a single command.

---

## What It Does

When you tell Claude to "deploy to GitHub Pages", this skill takes over and handles the entire pipeline:

| Step | What happens automatically |
|------|---------------------------|
| **1. Config** | Injects `base: '/<repo>/'` into `vite.config.js` so assets load correctly |
| **2. Git** | Runs `git init`, creates commits, and creates the GitHub repo via `gh` CLI |
| **3. Workflow** | Writes a battle-tested `.github/workflows/deploy.yml` (single-job, no cache issues) |
| **4. Pages** | Enables GitHub Pages via API in Actions mode |
| **5. Monitor** | Watches the Actions run in real-time and auto-fixes failures |

No manual steps. No "please check the Actions tab." It watches until the site is live.

---

## Trigger Phrases

Claude will activate this skill when you say things like:

- *"Deploy this project to GitHub Pages"*
- *"Push to GitHub and set up Pages"*
- *"Host this Vite app on GitHub Pages"*
- *"Create a GitHub repo and deploy it"*

---

## Installation

### Option 1 — npx (recommended, no install needed)

```bash
npx claude-skill-github-pages-deployer
```

### Option 2 — npm global install (installs automatically on `npm install -g`)

```bash
npm install -g claude-skill-github-pages-deployer
```

> The skill is copied to `~/.claude/skills/github-pages-deployer/SKILL.md` automatically.
> Restart Claude Code after installation.

### Option 3 — curl (one-liner)

```bash
mkdir -p ~/.claude/skills/github-pages-deployer && \
  curl -o ~/.claude/skills/github-pages-deployer/SKILL.md \
  https://raw.githubusercontent.com/hoyoboy0726123/claude-skill-github-pages-deployer/main/SKILL.md
```

### Option 4 — Clone

```bash
git clone https://github.com/hoyoboy0726123/claude-skill-github-pages-deployer.git \
  ~/.claude/skills/github-pages-deployer
```

After any installation method, **restart Claude Code** for the skill to load.

---

## Requirements

| Tool | Purpose | Install |
|------|---------|---------|
| `git` | Version control | [git-scm.com](https://git-scm.com) |
| `gh` (GitHub CLI) | Repo creation & API calls | [cli.github.com](https://cli.github.com) |
| `node` ≥ 18 | Build environment (CI) | Handled by the workflow |

Your `gh` CLI must be authenticated:

```bash
gh auth status   # should show: ✓ Logged in to github.com
```

---

## Compatibility

| Framework | Supported | Notes |
|-----------|-----------|-------|
| **Vite** (React, Vue, Svelte…) | ✅ | Auto-injects `base` path |
| **Create React App** | ✅ | Add `"homepage"` to `package.json` manually |
| **Next.js (static export)** | ✅ | Requires `output: 'export'` in `next.config.js` |
| **Plain HTML/CSS/JS** | ✅ | No build step needed |
| **Angular** | ✅ | Update `outputPath` in `angular.json` |

---

## The Verified Workflow

This skill uses a **single-job workflow** (not the common split build/deploy pattern) that has been tested and confirmed working:

```yaml
name: Deploy static content to Pages

on:
  push:
    branches: ["master", "main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install --legacy-peer-deps
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - id: deployment
        uses: actions/deploy-pages@v4
```

**Why `--legacy-peer-deps`?**
Peer dependency conflicts are extremely common in frontend projects. Using `npm ci` will fail if `package-lock.json` is missing or if peer deps conflict. `npm install --legacy-peer-deps` is more permissive and works reliably across projects.

**Why a single `deploy` job?**
The split build/deploy pattern requires careful artifact passing between jobs and is harder to debug. A single job is simpler, faster, and just as correct.

---

## Known Issues & Fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| White screen / 404 on assets | Vite uses absolute paths by default | Skill auto-adds `base: '/<repo>/'` to vite config |
| `PermissionError` on Windows path | Git Bash rewrites `/repos/...` as a filesystem path | Skill uses `repos/...` (no leading slash) in `gh api` calls |
| `npm ci` fails in CI | Missing `package-lock.json` | Skill uses `npm install --legacy-peer-deps` |
| Pages stuck at old build | Browser cache | Hard-refresh with `Ctrl+Shift+R` |

---

## Example Session

```
You:    Deploy my V3 Vite app to GitHub Pages under my account hoyoboy0726123

Claude: ✓ Added base: '/my-app/' to vite.config.js
        ✓ Initialized git repo and committed 23 files
        ✓ Created GitHub repo: hoyoboy0726123/my-app
        ✓ Created .github/workflows/deploy.yml
        ✓ Enabled GitHub Pages (Actions mode)
        ✓ Pushed to main — deployment triggered (run #12345678)

        Monitoring...
        ✓ Checkout          (2s)
        ✓ Set up Node       (8s)
        ✓ Install deps      (15s)
        ✓ Build             (12s)
        ✓ Deploy to Pages   (5s)

        Live at: https://hoyoboy0726123.github.io/my-app/
```

---

## License

[MIT](LICENSE) — free to use, modify, and distribute.

---

## Contributing

Found a bug or want to add support for another framework?

1. Fork this repo
2. Update `SKILL.md` with the fix or new pattern
3. Open a PR with a clear description of what changed and why

---

*Built for [Claude Code](https://claude.ai/claude-code) by [@hoyoboy0726123](https://github.com/hoyoboy0726123)*
