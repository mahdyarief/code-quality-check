# Design Document: Clean Root & Unused Detector

## Overview
This document outlines the architectural refactoring of the `code-quality-check` tool to establish a "Clean Root" structure and introduce a new 4th Pillar: Unused Detection. The goal is to flatten the deeply nested `no_ai_slop` directory, elevate the semantic categories, and cleanly integrate advanced dependency-graph analysis without blurring boundaries.

## Goals
- **Flatten Architecture**: Remove `src/no_ai_slop/src/` nesting.
- **Unify Core Modules**: Create a shared `src/core/` for Context, Reporter, and Utility logic.
- **Introduce Pillar 4**: Implement `src/detectors/unused.js` to scan for dead code, unused files, and unused exports using a unified approach (e.g., integrating `knip` or building a custom AST crawler).

## Architecture

The new source tree will be organized as follows:

```
src/
├── categories/             # The 25+ semantic pattern checks (formerly in no_ai_slop/src/categories)
│   ├── category-1-scope.js
│   └── ...
├── detectors/              # Specialized, heavy-duty analysis engines
│   └── unused.js           # Pillar 4: Graph-based unused detection
├── core/                   # Shared system utilities
│   ├── context.js          # File parsing and git-diff logic
│   ├── reporter.js         # Unified console output and formatting
│   └── runner.js           # Orchestrates categories and detectors
└── engine.js               # Main entry point invoked by bin/code-quality.js
```

### Component Breakdown
1. **`src/categories/`**: Contains fast, line-by-line regex and pattern matching modules to detect AI slop, naming banalities, and formatting noise.
2. **`src/detectors/unused.js`**: A specialized module that performs a deep structural analysis to find code that is completely orphaned from the application's execution path.
3. **`src/core/`**: Provides the shared `Reporter` so that both the fast categories and the slow detectors output in the exact same `[Code Quality]` branded format.

## Data Flow
1. `bin/code-quality.js` initializes the environment and calls `src/engine.js`.
2. `engine.js` creates a `Context` and a `Reporter`.
3. It passes these to `Runner`, which:
   - Executes all 25 semantic `categories/` on the diff.
   - Executes `detectors/unused.js` for the structural dead code check.
4. The `Reporter` aggregates the findings and prints the final summary.

## Error Handling
- Each category and detector must catch its own exceptions and log a localized error via the `Reporter` without crashing the entire suite.
- If the Unused Detector requires an external tool (like `knip`) that isn't installed, it should gracefully skip or prompt the user.

## Testing & Verification
The refactor must ensure that running `node bin/code-quality.js` still successfully executes all 25 original semantic checks exactly as before, with the new Unused Detection seamlessly integrated into the output.