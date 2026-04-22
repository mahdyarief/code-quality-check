# `code-quality-check` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand the codebase to `code-quality-check` and structure it as an installable O‍penCode skill.

**Architecture:** Transform scripts to standard npm bin + src layout, and update O‍penCode metadata in SKILL.md.

**Tech Stack:** Node.js, Markdown

---

### Task 1: Package Initialization

**Files:**
- Create: `package.json`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "code-quality-check",
  "version": "1.0.0",
  "description": "Unified code quality skill - semantic, structural, and syntactic checks.",
  "type": "commonjs",
  "bin": {
    "code-quality-check": "bin/code-quality.js"
  },
  "scripts": {
    "start": "node bin/code-quality.js"
  },
  "keywords": [
    "opencode",
    "skill",
    "quality",
    "lint"
  ],
  "author": "mahdyarief",
  "license": "MIT"
}
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "chore: initialize package.json for code-quality-check"
```

### Task 2: Directory Restructuring and CLI Entry Point

**Files:**
- Move: `scripts/run_3_pillars.cjs` to `bin/code-quality.js`
- Move: `scripts/no_ai_slop` to `src/no_ai_slop`
- Modify: `bin/code-quality.js`

- [ ] **Step 1: Create directories**

```bash
mkdir -p bin src
```

- [ ] **Step 2: Move files**

```bash
mv scripts/run_3_pillars.cjs bin/code-quality.js
mv scripts/no_ai_slop src/no_ai_slop
rmdir scripts
```

- [ ] **Step 3: Modify `bin/code-quality.js`**

Add shebang and update the path to `noAiSlopPath`.

Edit `bin/code-quality.js` content replacing the first few lines and the path:

```javascript
#!/usr/bin/env node
/**
 * code-quality-check skill - 3 Pillars Runner
 *
 * This skill unifies code quality into 3 pillars:
 * - Pillar 1: no_ai_slop (semantic) - in no_ai_slop/ folder
 * - Pillar 2: TypeScript (structure)
 * - Pillar 3: Biome/Prettier (syntax)
 *
 * Run from project root: code-quality-check
 */

const execSync = require("child_process").execSync;
const fs = require("fs");
const path = require("path");

const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const BLUE = "\x1b[36m";
const RESET = "\x1b[0m";

function log(msg) {
  console.log("[Code Quality] " + msg);
}
function section(msg) {
  console.log("\n" + BLUE + "=== " + msg + " ===" + RESET);
}
function error(msg) {
  console.error(RED + "[Code Quality] " + msg + RESET);
}
function success(msg) {
  console.log(GREEN + "[Code Quality] " + msg + RESET);
}

function run(cmd, cwd) {
  try {
    return execSync(cmd, { stdio: ["pipe", "pipe", "pipe"], cwd: cwd })
      .toString()
      .trim();
  } catch (e) {
    return e.stdout ? e.stdout.toString().trim() : "";
  }
}

// Find project root - walk up from current working directory
let projectRoot = process.cwd();
const sep = path.sep;
while (projectRoot) {
  if (fs.existsSync(projectRoot + sep + "package.json")) break;
  const parts = projectRoot.split(sep);
  if (parts.length <= 1) break;
  projectRoot = parts.slice(0, -1).join(sep);
}

const isBun =
  fs.existsSync(projectRoot + sep + "bun.lockb") || fs.existsSync(projectRoot + sep + "bun.lock");

const upstreamRef = run("git rev-parse --verify upstream/main", projectRoot)
  ? "upstream/main"
  : "main";
const touchedFiles = run("git diff " + upstreamRef + " --name-only --diff-filter=ACMR", projectRoot)
  .split("\n")
  .filter(function (f) {
    return (f.endsWith(".ts") || f.endsWith(".tsx")) && fs.existsSync(f);
  });

section("3 Pillars Verification");

// UPDATED PATH: pointing to src/no_ai_slop
const noAiSlopPath = path.resolve(__dirname, '..', 'src', 'no_ai_slop', 'detect_slop.cjs');

log("Pillar 1/3: no_ai_slop...");
try {
  const args = touchedFiles
    .map(function (f) {
      return '"' + f + '"';
    })
    .join(" ");
  execSync('node "' + noAiSlopPath + '" ' + args, { stdio: "inherit", cwd: projectRoot });
  success("Pillar 1/3: no_ai_slop passed.");
} catch (e) {
  error("Pillar 1/3 failed.");
  process.exit(1);
}

log("Pillar 2/3: typecheck...");
const pkg = JSON.parse(fs.readFileSync(projectRoot + sep + "package.json", "utf8"));
const scripts = pkg.scripts || {};
if (scripts.typecheck) {
  try {
    execSync("bun run typecheck", { stdio: "inherit", cwd: projectRoot });
    success("Pillar 2/3: typecheck passed.");
  } catch (e) {
    error("Pillar 2/3 failed.");
    process.exit(1);
  }
} else {
  log("No typecheck script in root - checking workspace...");
  let typecheckFailed = false;

  if (fs.existsSync(projectRoot + sep + "client")) {
    if (fs.existsSync(projectRoot + sep + "client" + sep + "package.json")) {
      const clientPkg = JSON.parse(
        fs.readFileSync(projectRoot + sep + "client" + sep + "package.json", "utf8")
      );
      if (clientPkg.scripts && clientPkg.scripts.typecheck) {
        log("Running client typecheck...");
        try {
          execSync("bun run typecheck", { stdio: "inherit", cwd: projectRoot + sep + "client" });
        } catch (e) {
          typecheckFailed = true;
        }
      }
    }
  }
  if (fs.existsSync(projectRoot + sep + "server")) {
    if (fs.existsSync(projectRoot + sep + "server" + sep + "package.json")) {
      const serverPkg = JSON.parse(
        fs.readFileSync(projectRoot + sep + "server" + sep + "package.json", "utf8")
      );
      if (serverPkg.scripts && serverPkg.scripts.typecheck) {
        log("Running server typecheck...");
        try {
          execSync("bun run typecheck", { stdio: "inherit", cwd: projectRoot + sep + "server" });
        } catch (e) {
          typecheckFailed = true;
        }
      }
    }
  }
  if (typecheckFailed) {
    error("Pillar 2/3 failed.");
    process.exit(1);
  }
  success("Pillar 2/3: typecheck passed.");
}

const hasBiome = fs.existsSync(projectRoot + sep + "biome.json");
const hasPrettier =
  fs.existsSync(projectRoot + sep + ".prettierrc") ||
  fs.existsSync(projectRoot + sep + "prettier.config.js");

if ((hasBiome || hasPrettier) && touchedFiles.length > 0) {
  log("Pillar 3/3: linter...");
  try {
    const args = touchedFiles
      .map(function (f) {
        return '"' + f + '"';
      })
      .join(" ");
    if (hasBiome) {
      execSync("bunx --bun biome check " + args, { stdio: "inherit", cwd: projectRoot });
    } else if (hasPrettier) {
      execSync("bunx --bun prettier --check " + args, { stdio: "inherit", cwd: projectRoot });
    }
    success("Pillar 3/3: linter passed.");
  } catch (e) {
    error("Pillar 3/3 failed: lint/format errors.");
    process.exit(1);
  }
} else if (!hasBiome && !hasPrettier) {
  log("No linter (biome/prettier) config found - skipping pillar 3.");
} else if (touchedFiles.length === 0) {
  log("No touched files - skipping linter.");
}

success("All 3 pillars passed!");
log("Code Quality Verification finished.");
```

- [ ] **Step 4: Make executable**

```bash
chmod +x bin/code-quality.js
```

- [ ] **Step 5: Test Execution**

Run: `node bin/code-quality.js`
Expected: Outputs `[Code Quality] ...`

- [ ] **Step 6: Commit**

```bash
git add bin/ src/ package.json
git add -u
git commit -m "refactor: restructure folders and update CLI entry point"
```

### Task 3: Update Documentation (SKILL.md and README.md)

**Files:**
- Modify: `SKILL.md`
- Modify: `README.md`

- [ ] **Step 1: Rewrite `SKILL.md`**

Replace contents with:

```markdown
---
name: code-quality-check
description: Unified code quality skill - semantic, structural, syntactic checks in 3 pillars.
metadata:
  author: mahdyarief
  version: "1.0.0"
---

# code-quality-check

**Single skill for all code quality.** Runs 3 pillars:

| Pillar | Check | Tool |
|--------|-------|------|
| 1 | Semantic (AI slop) | no_ai_slop |
| 2 | Structure | TypeScript |
| 3 | Syntax | Biome/Prettier |

## Run

Execute the tool via the CLI (from within your project root):

```bash
npx code-quality-check
# Or if installed globally/linked:
code-quality-check
```

## 3 Pillars

### Pillar 1: no_ai_slop
- Generic names (`data`, `handleClick`)
- Empty catches
- Debug artifacts
- Type bypasses (`any` without reason)

### Pillar 2: TypeScript
- Type errors
- Unsafe casts
- Missing types

### Pillar 3: Biome/Prettier
- Formatting
- Import order
- Line endings

## 3rd-Party Library Exceptions

| Library | Fix |
|---------|-----|
| react-i18next | Callable interface pattern |
| react-hook-form | Double-cast via unknown + biome-ignore |

## Common Fixes

```
Level 1: handleClick → submitForm
Level 2: : any → specific type
Level 3: bun biome check --write <files>
```

## Files

```
code-quality-check/
├── SKILL.md
├── package.json
├── bin/
│   └── code-quality.js     ← CLI Entry point
└── src/
    └── no_ai_slop/
        ├── detect_slop.cjs
        └── src/            ← Categories
```
```

- [ ] **Step 2: Rewrite `README.md`**

Replace contents with:

```markdown
# code-quality-check

A unified code quality tool that runs 3 pillars of checks:

1. **Semantic**: Catches AI slop, generic naming, debug artifacts (`no_ai_slop`).
2. **Structural**: Validates types (`TypeScript`).
3. **Syntactic**: Checks formatting and syntax (`Biome` or `Prettier`).

## Installation

This is intended to be used as an O‍penCode skill or a global package.

```bash
npm install -g code-quality-check
```

## Usage

```bash
code-quality-check
```
```

- [ ] **Step 3: Commit**

```bash
git add SKILL.md README.md
git commit -m "docs: update SKILL.md and README.md with new branding and usage instructions"
```
