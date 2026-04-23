# code-quality-check

**Owner**: [mahdyarief](https://github.com/mahdyarief)
**License**: MIT

A codebase verification skill and CLI that runs four pillars of quality control:

## Agent workflow checklist

- Run `code-quality-check` before saying the task is done.
- Fix red issues immediately.
- Report yellow issues and ask the human if they are acceptable.
- Use Superpowers workflow skills when the repository has them.

## Default OpenCode trigger phrases

OpenCode (default pattern, no custom commands) will usually choose this skill if the user asks things like:

- "run code quality check"
- "verify before commit" / "verify before PR" / "verify before completion"
- "check for AI slop"
- "typecheck"
- "run prettier" / "run biome" / "lint this"
- "find unused code" / "unused exports" / "unused dependencies"

1. **Semantic** — catches AI slop, generic naming, debug artifacts, and low-signal code patterns.
2. **Structural** — checks TypeScript/type safety and workspace-level typecheck scripts.
3. **Syntactic** — checks formatting and import hygiene with Biome or Prettier.
4. **Hygiene** — uses `knip` to find unused files, exports, and dependencies.

## For humans

Install globally or run in place:

```bash
npm install -g code-quality-check
npx code-quality-check
code-quality-check
```

If you are using it as an OpenCode skill, keep the repository available under your skill directory so the agent can invoke it as part of its workflow.

## For OpenCode agents

Use this skill when you have changed code and need to verify the work before declaring completion.

Recommended times to run it:

- before saying the task is done
- before committing changes
- before creating a pull request
- after large refactors or multi-file edits

How to interpret results:

- **Red issues**: fix them before continuing.
- **Yellow issues**: report them and decide with the human whether they are acceptable.
- **Architectural debt**: note it clearly; do not refactor blindly just to make the report quieter.

## Working with Superpowers

If the repository also uses Superpowers skills, use them together:

- `verification-before-completion` — run `code-quality-check` before claiming the work is finished.
- `requesting-code-review` — use when the change is significant and needs review.
- `finishing-a-development-branch` — use when the work is ready to be merged or turned into a PR.

`code-quality-check` is the concrete verification step; Superpowers is the workflow discipline around it.

## Example agent instruction

> Before responding that the task is complete, run `code-quality-check`. If it reports red issues, fix them. If it reports yellow issues, explain them and ask for guidance.

## What it runs

- semantic category checks from `src/categories/`
- typecheck discovery for root and workspace packages
- Biome or Prettier checks when configuration exists
- `knip` for unused code detection

## Troubleshooting

- If `knip` cannot run, the tool warns and continues.
- If no typecheck script exists, workspace detection is used.
- If no formatter config exists, pillar 3 is skipped.
- Package manager detection is automatic (`npm`, `pnpm`, `yarn`, or `bun`).
