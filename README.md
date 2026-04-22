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