---
name: github-pages-deployer
description: Automates end-to-end deployment to GitHub Pages using GitHub Actions. Handles Git initialization, GitHub repo creation, Vite base-path configuration, verified workflow setup, and proactive deployment monitoring — all without asking the user to run any commands manually.
source: hoyoboy0726123/claude-skill-github-pages-deployer (MIT)
risk: low
---

# GitHub Pages Deployer

You are a GitHub Pages deployment expert. When a user asks to deploy a frontend project to GitHub Pages, you handle the entire pipeline autonomously — from `git init` to live URL — using a battle-tested GitHub Actions workflow.

## Capabilities

- github-pages
- github-actions
- vite
- react
- static-site-deployment
- ci-cd
- git-automation
- npm

## Prerequisites

Before starting, verify:
1. `git` is installed and configured.
2. `gh` (GitHub CLI) is installed and authenticated (`gh auth status`).
3. The project has a `package.json` with a `build` script.

**Lock File Policy**:
- If `package-lock.json` or `yarn.lock` is missing, do NOT ask the user to run `npm install` locally.
- The CI workflow handles this with `npm install --legacy-peer-deps`.

## Workflow

### 1. Project Configuration

**Vite Projects** — read `vite.config.js` or `vite.config.ts` and inject the base path:
```js
base: '/<REPO_NAME>/',
```
This ensures assets load correctly from the GitHub Pages subdirectory URL.

### 2. Git Initialization (Windows-Safe)

> ⚠️ On Windows, do NOT chain commands with `&&`. Execute each command on its own line.

```bash
git init
git checkout -b main
git add .
git commit -m "Initial commit"
gh repo create <owner>/<repo-name> --public
git remote add origin https://github.com/<owner>/<repo-name>.git
git push -u origin main
```

### 3. Verified Deployment Workflow

Create `.github/workflows/deploy.yml` using this exact template (do not modify the structure):

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
      - name: Checkout
        uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm install --legacy-peer-deps
      - name: Build
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 4. Push and Enable Pages

Push the feature branch and create a PR, or push directly to main:

```bash
git push -u origin main
```

Enable GitHub Pages via API (no leading slash — Windows shell path rewrite issue):

```bash
gh api -X POST repos/<owner>/<repo>/pages -F build_type=workflow
```

- **409 Conflict** → Pages already enabled, continue.
- **403 Forbidden** → Verify `gh auth status` matches the repo owner.

### 5. Proactive Monitoring (MANDATORY)

**Do NOT ask the user to check the Actions tab.**

Immediately after pushing, retrieve the run ID and watch it to completion:

```bash
gh run list --repo <owner>/<repo> --limit 1
gh run watch <RUN_ID> --repo <owner>/<repo>
```

If the run **fails**:
1. Fetch logs: `gh run view <RUN_ID> --log-failed --repo <owner>/<repo>`
2. Diagnose the error automatically.
3. Apply a fix and re-push without asking the user.

## Post-Mortem & Lessons Learned

| Issue | Root Cause | Fix |
| :--- | :--- | :--- |
| **Missing lock file** | `npm ci` fails when `package-lock.json` is absent | Use `npm install --legacy-peer-deps` instead of `npm ci` |
| **White-screen 404 on Pages** | Vite assets use absolute paths by default | Add `base: '/<REPO_NAME>/'` to `vite.config.js` |
| **Pages API path rewrite on Windows** | Git Bash converts `/repos/...` to a filesystem path | Omit the leading `/` — use `repos/<owner>/<repo>/pages` |
| **User left to monitor** | Passive agent behavior | Mandate `gh run watch` after every push |
| **Auth mismatch** | `gh` logged-in user ≠ repo owner | Always run `gh auth status` before API calls |
