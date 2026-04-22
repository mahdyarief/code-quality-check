const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function detectPackageManager(rootDir) {
  if (fs.existsSync(path.join(rootDir, "bun.lockb"))) return { cmd: "bunx", args: ["--bun"] };
  if (fs.existsSync(path.join(rootDir, "pnpm-lock.yaml"))) return { cmd: "pnpm", args: ["dlx"] };
  if (fs.existsSync(path.join(rootDir, "yarn.lock"))) return { cmd: "yarn", args: ["dlx"] };
  return { cmd: "npx", args: [] };
}

function runKnip(rootDir) {
  const pm = detectPackageManager(rootDir);
  const isWin = process.platform === "win32";
  const finalCmd = isWin ? `${pm.cmd}.cmd` : pm.cmd;
  const args = [...pm.args, "--yes", "knip"];

  let result = spawnSync(finalCmd, args, {
    cwd: rootDir,
    encoding: "utf8",
    stdio: "pipe",
  });

  if (result.error && result.error.code === "ENOENT" && isWin) {
    result = spawnSync(pm.cmd, args, {
      cwd: rootDir,
      encoding: "utf8",
      stdio: "pipe",
      shell: true,
    });
  }

  return result;
}

module.exports = {
  name: "🔵 Pillar 4: Unused Detection (knip)",
  run(context, reporter) {
    reporter.note("Running comprehensive unused scan via knip...");

    const rootDir = context.projectRoot || process.cwd();
    const result = runKnip(rootDir);

    if (result && result.status === 0) {
      reporter.pass("No unused files, dependencies, or exports found.");
      return;
    }

    const output = [result && result.stdout, result && result.stderr].filter(Boolean).join("\n").trim();
    if (output) {
      reporter.warn("Knip found dead code or unused files. Check output:");
      reporter.note(output);
    } else {
      reporter.warn("Could not execute Unused Detector (knip failed to run).");
    }
  },
};
