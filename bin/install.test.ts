import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir, homedir } from "os";

import {
  getConfigDirFromHome,
  expandTilde,
  getGlobalDir,
  copyWithPathReplacement,
  buildHookCommand,
} from "./install";

// ─── getConfigDirFromHome ────────────────────────────────────────────────────

describe("getConfigDirFromHome", () => {
  test("returns '.claude' for local installs", () => {
    expect(getConfigDirFromHome(false)).toBe(".claude");
  });

  test("returns backtick-wrapped '.claude' for global installs", () => {
    expect(getConfigDirFromHome(true)).toBe("`.claude`");
  });
});

// ─── expandTilde ─────────────────────────────────────────────────────────────

describe("expandTilde", () => {
  test("expands leading ~/ to home directory", () => {
    const result = expandTilde("~/foo/bar");
    expect(result).toBe(join(homedir(), "foo/bar"));
  });

  test("leaves paths without ~/ unchanged", () => {
    expect(expandTilde("/absolute/path")).toBe("/absolute/path");
    expect(expandTilde("relative/path")).toBe("relative/path");
  });

  test("leaves a bare ~ unchanged (no trailing slash)", () => {
    expect(expandTilde("~")).toBe("~");
  });

  test("handles empty string", () => {
    expect(expandTilde("")).toBe("");
  });
});

// ─── getGlobalDir ────────────────────────────────────────────────────────────

describe("getGlobalDir", () => {
  test("defaults to ~/.claude when no dir is given", () => {
    expect(getGlobalDir()).toBe(join(homedir(), ".claude"));
  });

  test("returns the explicit dir when provided", () => {
    expect(getGlobalDir("/custom/dir" as any)).toBe("/custom/dir");
  });

  test("expands tilde in explicit dir", () => {
    expect(getGlobalDir("~/custom" as any)).toBe(join(homedir(), "custom"));
  });
});

// ─── buildHookCommand ────────────────────────────────────────────────────────

describe("buildHookCommand", () => {
  test("builds a node command with the hook path", () => {
    const result = buildHookCommand("/home/user/.claude", "pre-commit.js");
    expect(result).toBe('node "/home/user/.claude/hooks/pre-commit.js"');
  });

  test("normalises Windows-style backslashes to forward slashes", () => {
    const result = buildHookCommand("C:\\Users\\user\\.claude", "hook.js");
    expect(result).toBe('node "C:/Users/user/.claude/hooks/hook.js"');
  });

  test("handles hook names with spaces", () => {
    const result = buildHookCommand("/home/user/.claude", "my hook.js");
    expect(result).toBe('node "/home/user/.claude/hooks/my hook.js"');
  });
});

// ─── copyWithPathReplacement ─────────────────────────────────────────────────

describe("copyWithPathReplacement", () => {
  let src: string;
  let dest: string;

  beforeEach(() => {
    src = mkdtempSync(join(tmpdir(), "agentsmith-src-"));
    dest = mkdtempSync(join(tmpdir(), "agentsmith-dest-"));
  });

  afterEach(() => {
    if (existsSync(src)) rmSync(src, { recursive: true });
    if (existsSync(dest)) rmSync(dest, { recursive: true });
  });

  test("copies markdown files with path replacement", () => {
    writeFileSync(join(src, "CLAUDE.md"), "See ~/\.claude/hooks for details");

    copyWithPathReplacement(src, dest, "/custom/prefix/", "claude");

    const result = readFileSync(join(dest, "CLAUDE.md"), "utf8");
    expect(result).toBe("See /custom/prefix/hooks for details");
  });

  test("replaces all occurrences of ~/\.claude/ in markdown", () => {
    writeFileSync(
      join(src, "README.md"),
      "Path 1: ~/\.claude/a\nPath 2: ~/\.claude/b"
    );

    copyWithPathReplacement(src, dest, "/prefix/", "claude");

    const result = readFileSync(join(dest, "README.md"), "utf8");
    expect(result).toBe("Path 1: /prefix/a\nPath 2: /prefix/b");
  });

  test("copies non-markdown files verbatim without replacement", () => {
    writeFileSync(join(src, "hook.js"), 'const p = "~/.claude/hooks"');

    copyWithPathReplacement(src, dest, "/prefix/", "claude");

    const result = readFileSync(join(dest, "hook.js"), "utf8");
    expect(result).toBe('const p = "~/.claude/hooks"');
  });

  test("recreates destDir if it already exists", () => {
    const existingFile = join(dest, "stale.md");
    writeFileSync(existingFile, "stale content");
    writeFileSync(join(src, "new.md"), "new content");

    copyWithPathReplacement(src, dest, "/prefix/", "claude");

    expect(existsSync(existingFile)).toBe(false);
    expect(existsSync(join(dest, "new.md"))).toBe(true);
  });

  test("handles an empty source directory", () => {
    copyWithPathReplacement(src, dest, "/prefix/", "claude");
    // dest exists and is empty — no error thrown
    expect(existsSync(dest)).toBe(true);
  });

  test("copies multiple files in one pass", () => {
    writeFileSync(join(src, "a.md"), "~/\.claude/a");
    writeFileSync(join(src, "b.md"), "~/\.claude/b");
    writeFileSync(join(src, "c.js"), "unchanged");

    copyWithPathReplacement(src, dest, "/p/", "claude");

    expect(readFileSync(join(dest, "a.md"), "utf8")).toBe("/p/a");
    expect(readFileSync(join(dest, "b.md"), "utf8")).toBe("/p/b");
    expect(readFileSync(join(dest, "c.js"), "utf8")).toBe("unchanged");
  });
});
