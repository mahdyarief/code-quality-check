# code-quality-check

A comprehensive codebase verification tool that executes four critical pillars of quality control. It enforces strict standards to ensure semantic correctness, structural integrity, syntactic consistency, and codebase hygiene across your projects.

## The 4 Pillars of Quality

1. **Semantic (No AI Slop)**: Detects low-effort AI generated code, generic naming conventions (like `data` or `handleClick`), empty catch blocks, leftover debug artifacts (`console.log`), and unjustified type bypasses.
2. **Structural (TypeScript)**: Enforces robust type safety by running full TypeScript compilation checks. It identifies type errors, missing definitions, and unsafe casts.
3. **Syntactic (Biome/Prettier)**: Ensures your codebase adheres to strict formatting rules. It checks code style, proper import ordering, and consistent line endings using either Biome or Prettier depending on your project configuration.
4. **Hygiene (Unused Detection)**: Integrates `knip` to perform comprehensive graph analysis, finding unused dependencies, unreferenced files, and dead exports.

## Installation

You can install this tool globally to use it across any repository, or run it directly within a specific project.

```bash
# Install globally via npm
npm install -g code-quality-check

# Alternatively, run without installation using npx
npx code-quality-check
```

## Usage

Navigate to your project's root directory and run the command:

```bash
code-quality-check
```

The tool will automatically:
1. Detect changed files relative to the main branch.
2. Run the semantic category engine on modified files.
3. Attempt to run your local `typecheck` npm script (or scan `client`/`server` workspaces).
4. Run `biome check` or `prettier --check` on modified files if a configuration is found.
5. Run `knip` to detect unused files, exports, and dependencies.

## Integrating as an OpenCode Skill

This package is fully compatible as an OpenCode skill. When installed, OpenCode agents will automatically utilize this tool to verify their code modifications before completing tasks or creating pull requests, guaranteeing a high baseline of code quality.
