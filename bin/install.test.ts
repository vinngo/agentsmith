import { test, expect, describe } from "bun:test";
import { join } from "path";
import { homedir } from "os";

import {
  getDirName,
  getSkillsDir,
  getGlobalDir,
  convertToOpencode,
  convertToGeminiAgent,
  convertToGeminiToml,
} from "./install";

// ─── getDirName ──────────────────────────────────────────────────────────────

describe("getDirName", () => {
  test("returns .opencode for opencode", () => {
    expect(getDirName("opencode")).toBe(".opencode");
  });

  test("returns .gemini for gemini", () => {
    expect(getDirName("gemini")).toBe(".gemini");
  });

  test("returns .claude for claude", () => {
    expect(getDirName("claude")).toBe(".claude");
  });

  test("returns .claude for unknown runtimes", () => {
    expect(getDirName("unknown")).toBe(".claude");
  });
});

// ─── getGlobalDir ────────────────────────────────────────────────────────────

describe("getGlobalDir", () => {
  test("returns ~/.claude for claude", () => {
    expect(getGlobalDir("claude")).toBe(join(homedir(), ".claude"));
  });

  test("returns ~/.config/opencode for opencode", () => {
    expect(getGlobalDir("opencode")).toBe(join(homedir(), ".config", "opencode"));
  });

  test("returns ~/.gemini for gemini", () => {
    expect(getGlobalDir("gemini")).toBe(join(homedir(), ".gemini"));
  });
});

// ─── getSkillsDir ────────────────────────────────────────────────────────────

describe("getSkillsDir", () => {
  test("opencode uses singular flat 'command/' dir", () => {
    expect(getSkillsDir("/base", "opencode")).toBe("/base/command");
  });

  test("claude uses nested 'commands/agentmancy/'", () => {
    expect(getSkillsDir("/base", "claude")).toBe("/base/commands/agentmancy");
  });

  test("gemini uses nested 'commands/agentmancy/'", () => {
    expect(getSkillsDir("/base", "gemini")).toBe("/base/commands/agentmancy");
  });
});

// ─── convertToOpencode ───────────────────────────────────────────────────────

describe("convertToOpencode", () => {
  test("replaces AskUserQuestion, SlashCommand, TodoWrite in body", () => {
    const input = `---\ndescription: test\n---\nUse AskUserQuestion, SlashCommand, TodoWrite here`;
    const result = convertToOpencode(input);
    expect(result).toContain("question");
    expect(result).toContain("skill");
    expect(result).toContain("todowrite");
    expect(result).not.toContain("AskUserQuestion");
    expect(result).not.toContain("SlashCommand");
    expect(result).not.toContain("TodoWrite");
  });

  test("replaces ~/.claude path references", () => {
    const input = `---\ndescription: test\n---\nSee ~/.claude for config`;
    const result = convertToOpencode(input);
    expect(result).toContain("~/.config/opencode");
    expect(result).not.toContain("~/.claude");
  });

  test("converts tools list to opencode object format", () => {
    const input = `---\ntools: Read, Write, AskUserQuestion\n---\nbody`;
    const result = convertToOpencode(input);
    expect(result).toContain("read: true");
    expect(result).toContain("write: true");
    expect(result).toContain("question: true");
  });

  test("strips the 'name:' field from frontmatter", () => {
    const input = `---\nname: my-agent\ndescription: test\n---\nbody`;
    const result = convertToOpencode(input);
    expect(result).not.toContain("name: my-agent");
    expect(result).toContain("description: test");
  });

  test("converts named color to hex", () => {
    const input = `---\ncolor: cyan\n---\nbody`;
    const result = convertToOpencode(input);
    expect(result).toContain(`color: "#00FFFF"`);
  });

  test("preserves hex color as-is", () => {
    const input = `---\ncolor: #1a2b3c\n---\nbody`;
    const result = convertToOpencode(input);
    expect(result).toContain("#1a2b3c");
  });

  test("passes through content with no frontmatter unchanged (except substitutions)", () => {
    const input = "just a plain body with no frontmatter";
    expect(convertToOpencode(input)).toBe(input);
  });

  test("passes mcp__ tool names through unchanged", () => {
    const input = `---\ntools: mcp__supabase__query\n---\nbody`;
    const result = convertToOpencode(input);
    expect(result).toContain("mcp__supabase__query: true");
  });
});

// ─── convertToGeminiAgent ────────────────────────────────────────────────────

describe("convertToGeminiAgent", () => {
  test("converts tools to YAML list format", () => {
    const input = `---\ntools: Read, Write, Bash\n---\nbody`;
    const result = convertToGeminiAgent(input);
    expect(result).toContain("  - read_file");
    expect(result).toContain("  - write_file");
    expect(result).toContain("  - run_shell_command");
  });

  test("drops the Task tool (no Gemini equivalent)", () => {
    const input = `---\ntools: Read, Task\n---\nbody`;
    const result = convertToGeminiAgent(input);
    expect(result).not.toContain("task");
    expect(result).toContain("  - read_file");
  });

  test("drops mcp__ tools", () => {
    const input = `---\ntools: Read, mcp__supabase__query\n---\nbody`;
    const result = convertToGeminiAgent(input);
    expect(result).not.toContain("mcp__");
  });

  test("strips color field from frontmatter", () => {
    const input = `---\nname: agent\ncolor: cyan\n---\nbody`;
    const result = convertToGeminiAgent(input);
    expect(result).not.toContain("color:");
    expect(result).toContain("name: agent");
  });

  test("converts ${var} expressions to $var in body", () => {
    const input = "---\nname: agent\n---\nHello ${name}!";
    const result = convertToGeminiAgent(input);
    // JS replacement '$$$1' produces a literal $ + capture group (i.e. $name, not $$name)
    expect(result).toContain("$name");
    expect(result).not.toContain("${name}");
  });

  test("converts <sub> tags to italic parens in body", () => {
    const input = `---\nname: agent\n---\nSee <sub>note</sub>`;
    const result = convertToGeminiAgent(input);
    expect(result).toContain("*(note)*");
    expect(result).not.toContain("<sub>");
  });

  test("returns content unchanged when no frontmatter", () => {
    const input = "plain body";
    expect(convertToGeminiAgent(input)).toBe("plain body");
  });
});

// ─── convertToGeminiToml ─────────────────────────────────────────────────────

describe("convertToGeminiToml", () => {
  test("produces a prompt = ... TOML entry from body", () => {
    const input = `---\ndescription: Do a thing\n---\nThis is the prompt body`;
    const result = convertToGeminiToml(input);
    expect(result).toContain('description = "Do a thing"');
    expect(result).toContain('prompt = "This is the prompt body"');
  });

  test("omits description key when not present in frontmatter", () => {
    const input = `---\nname: my-skill\n---\nPrompt text`;
    const result = convertToGeminiToml(input);
    expect(result).not.toContain("description");
    expect(result).toContain('prompt = "Prompt text"');
  });

  test("wraps bare content (no frontmatter) as prompt value", () => {
    const input = "no frontmatter here";
    const result = convertToGeminiToml(input);
    expect(result).toContain('prompt =');
    expect(result).toContain("no frontmatter here");
  });

  test("handles multiline prompt body", () => {
    const input = `---\ndescription: test\n---\nLine 1\nLine 2`;
    const result = convertToGeminiToml(input);
    expect(result).toContain("Line 1");
    expect(result).toContain("Line 2");
  });
});
