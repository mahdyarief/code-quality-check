#!/usr/bin/env node
/**
 * code-quality-check skill - 3 Pillars Runner
 *
 * This skill unifies code quality into 3 pillars:
 * - Pillar 1: no_ai_slop (semantic) - in src/no_ai_slop/ folder
 * - Pillar 2: TypeScript (structure)
 * - Pillar 3: Biome/Prettier (syntax)
 *
 * Run from project root: code-quality
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
