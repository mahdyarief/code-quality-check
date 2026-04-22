# Design Document: `code-quality-check` Rebranding and Restructuring

## Overview
This document outlines the plan to transform the existing `pr_quality_check` (the "3 Pillars" runner) into a professional, installable O‍penCode skill named `code-quality-check`. The goal is to make it look and behave like a proper npm package/MCP tool, similar to the `wcagit` skill, making it easy to share, publish to GitHub, and use natively within O‍penCode.

## Goals
- **Rebrand**: Rename everything from `pr_quality_check` to `code-quality-check`.
- **Standardize**: Adopt a modern project structure (`package.json`, `bin/`, `src/`).
- **Nativize**: Ensure it follows O‍penCode skill conventions (proper `SKILL.md` frontmatter).
- **Simplify Execution**: Allow users to run it via a dedicated command instead of pointing to a script path.

## Proposed Structure
```
code-quality-check/
├── package.json        # Main package configuration
├── SKILL.md            # Rebranded O‍penCode skill entry point
├── README.md           # Installation and usage guide
├── bin/
│   └── code-quality.js # The executable CLI entry point
├── src/
│   └── no_ai_slop/     # Core logic (moved from scripts/)
│       ├── detect_slop.cjs
│       └── src/
│           ├── categories/
│           ├── context.cjs
│           ├── reporter.cjs
│           ├── runner.cjs
│           └── utils.cjs
└── .gitignore          # Standard ignore rules
```

## Implementation Details

### 1. Root `package.json`
The `package.json` will define the identity of the skill:
```json
{
  "name": "code-quality-check",
  "version": "1.0.0",
  "description": "Unified code quality skill - semantic, structural, and syntactic checks.",
  "bin": {
    "code-quality-check": "bin/code-quality.js"
  },
  "scripts": {
    "test": "node bin/code-quality.js"
  },
  "author": "mahdyarief",
  "license": "MIT"
}
```

### 2. The CLI (`bin/code-quality.js`)
This script will be an adaptation of the current `run_3_pillars.cjs`. Key changes:
- Add shebang `#!/usr/bin/env node`.
- Update internal paths (e.g., `const noAiSlopPath = path.resolve(__dirname, '../src/no_ai_slop/detect_slop.cjs');`).
- Ensure it properly detects the current project root where it is being run.

### 3. Skill Documentation (`SKILL.md`)
The `SKILL.md` will be updated to include metadata that O‍penCode uses for discovery:
```markdown
---
name: code-quality-check
description: Unified code quality skill - semantic, structural, syntactic checks in 3 pillars.
metadata:
  author: mahdyarief
  version: "1.0.0"
---
# code-quality-check
Runs 3 pillars of code quality verification:
1. Semantic (AI slop)
2. Structural (TypeScript)
3. Syntactic (Biome/Prettier)
...
```

## Success Criteria
- The codebase is restructured successfully.
- Running `node bin/code-quality.js` correctly triggers all 3 pillars in the current project context.
- The `SKILL.md` is valid and recognized by O‍penCode.
- No regression in the "no_ai_slop" detection logic.

## Self-Review
- [x] No "TBD" sections.
- [x] Architecture matches goal.
- [x] Scope is manageable for a single plan.
- [x] Rebranding is consistent across all proposed files.
