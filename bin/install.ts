const fs = require("fs");
const path = require("path");
const os = require("os");
const readline = require("readline");
const crypto = require("crypto");

const pkg = require("../package.json");

const args = process.argv.slice(2);
const hasGlobal = args.includes("--global");
const hasLocal = args.includes("--local");
const hasUninstall = args.includes("--uninstall");

//runtime for now is claude only
const runtime = "claude";
const dirName = ".claude";

export function getConfigDirFromHome(isGlobal: boolean) {
  if (!isGlobal) {
    return dirName;
  }
  return "`.claude`";
}

export function expandTilde(filePath: string) {
  if (filePath && filePath.startsWith("~/")) {
    return path.join(os.homedir(), filePath.slice(2));
  }
  return filePath;
}

export function getGlobalDir(explicitDir = null) {
  if (explicitDir) {
    return expandTilde(explicitDir);
  }
  return path.join(os.homedir(), dirName);
}

export function copyWithPathReplacement(
  srcDir: string,
  destDir: string,
  pathPrefix: string,
  runtime: string,
) {
  if (fs.existsSync(destDir)) fs.rmSync(destDir, { recursive: true });
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (entry.name.endsWith(".md")) {
      let content = fs.readFileSync(path.join(srcDir, entry.name), "utf8");
      content = content.replace(/~\/\.claude\//g, pathPrefix);
      // Runtime transforms here
      fs.writeFileSync(path.join(destDir, entry.name), content);
    } else {
      fs.copyFileSync(
        path.join(srcDir, entry.name),
        path.join(destDir, entry.name),
      );
    }
  }
}

export function buildHookCommand(configDir: string, hookName: string) {
  const hooksPath = configDir.replace(/\\/g, "/") + "/hooks/" + hookName;
  return `node "${hooksPath}"`;
}
