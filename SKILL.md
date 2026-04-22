---
name: code-quality-check
description: 3-pillar codebase verification skill - semantic, structural, and syntactic checks.
metadata:
  author: mahdyarief
  version: "1.0.0"
---

# code-quality-check

**Single skill for all code quality.** Runs 4 pillars:

| Pillar | Check | Tool |
|--------|-------|------|
| 1 | Semantic (AI slop) | no_ai_slop |
| 2 | Structure | TypeScript |
| 3 | Syntax | Biome/Prettier |
| 4 | Hygiene | knip |

## Run

Execute the tool via the CLI (from within your project root):

```bash
npx code-quality-check
# Or if installed globally/linked:
code-quality-check
```

## 4 Pillars

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

### Pillar 4: Unused Detection
- Unused files
- Unused dependencies
- Unused exports

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
