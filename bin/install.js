#!/usr/bin/env node

'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const SKILL_NAME  = 'github-pages-deployer';
const SKILL_SRC   = path.join(__dirname, '..', 'SKILL.md');
const TARGET_DIR  = path.join(os.homedir(), '.claude', 'skills', SKILL_NAME);
const TARGET_FILE = path.join(TARGET_DIR, 'SKILL.md');

const isUpdate = fs.existsSync(TARGET_FILE);

try {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
  fs.copyFileSync(SKILL_SRC, TARGET_FILE);

  console.log('');
  console.log('  ✅ ' + (isUpdate ? 'Updated' : 'Installed') + ': ' + SKILL_NAME);
  console.log('  📁 ' + TARGET_DIR);
  console.log('');
  console.log('  Restart Claude Code to activate the skill.');
  console.log('  Then say: "Deploy this project to GitHub Pages"');
  console.log('');
} catch (err) {
  console.error('');
  console.error('  ❌ Installation failed: ' + err.message);
  console.error('  Manual install:');
  console.error('  https://github.com/hoyoboy0726123/claude-skill-github-pages-deployer');
  console.error('');
  process.exit(1);
}
