---
name: pr_quality_check
description: Unified code quality skill - semantic, structural, syntactic checks in 3 pillars.
---

# pr_quality_check

**Single skill for all code quality.** Runs 3 pillars:

| Pillar | Check | Tool |
|--------|-------|------|
| 1 | Semantic (AI slop) | no_ai_slop |
| 2 | Structure | TypeScript |
| 3 | Syntax | Biome/Prettier |

## Run

```bash
node ~/.agents/skills/pr_quality_check/scripts/run_3_pillars.cjs
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
pr_quality_check/
├── SKILL.md
└── scripts/
    ├── run_3_pillars.cjs   ← Entry point
    └── no_ai_slop/
        ├── detect_slop.cjs
        └── src/            ← Categories
```