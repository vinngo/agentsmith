#!/usr/bin/env bun

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, readdirSync, copyFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { createInterface } from 'readline';

// Colors
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const dim = '\x1b[2m';
const reset = '\x1b[0m';

// Get version from package.json
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

// Parse args
const args = process.argv.slice(2);
const hasGlobal = args.includes('--global') || args.includes('-g');
const hasLocal = args.includes('--local') || args.includes('-l');
const hasClaude = args.includes('--claude');
const hasOpencode = args.includes('--opencode');
const hasGemini = args.includes('--gemini');
const hasAll = args.includes('--all');
const hasUninstall = args.includes('--uninstall') || args.includes('-u');
const hasHelp = args.includes('--help') || args.includes('-h');

// Runtime selection
let selectedRuntimes: string[] = [];
if (hasAll) {
  selectedRuntimes = ['claude', 'opencode', 'gemini'];
} else {
  if (hasClaude) selectedRuntimes.push('claude');
  if (hasOpencode) selectedRuntimes.push('opencode');
  if (hasGemini) selectedRuntimes.push('gemini');
}

const banner = '\n' +
  cyan + '   █████╗  ██████╗ ███████╗███╗   ██╗████████╗\n' +
  '  ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝\n' +
  '  ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║\n' +
  '  ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║\n' +
  '  ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║\n' +
  '  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝' + reset + '\n' +
  '   ███████╗███╗   ███╗██╗████████╗██╗  ██╗\n' +
  '   ██╔════╝████╗ ████║██║╚══██╔══╝██║  ██║\n' +
  '   ███████╗██╔████╔██║██║   ██║   ███████║\n' +
  '   ╚════██║██║╚██╔╝██║██║   ██║   ██╔══██║\n' +
  '   ███████║██║ ╚═╝ ██║██║   ██║   ██║  ██║\n' +
  '   ╚══════╝╚═╝     ╚═╝╚═╝   ╚═╝   ╚═╝  ╚═╝\n' +
  '\n' +
  '  AI Agent & Skill Builder ' + dim + 'v' + pkg.version + reset + '\n' +
  '  Build custom agents and skills for Claude Code, OpenCode, and Gemini.\n';

console.log(banner);

if (hasHelp) {
  console.log(`  ${yellow}Usage:${reset} bun bin/install.ts [options]\n\n  ${yellow}Options:${reset}
    ${cyan}-g, --global${reset}        Install globally (to config directory)
    ${cyan}-l, --local${reset}         Install locally (to current directory)
    ${cyan}--claude${reset}            Install for Claude Code only
    ${cyan}--opencode${reset}          Install for OpenCode only
    ${cyan}--gemini${reset}            Install for Gemini only
    ${cyan}--all${reset}               Install for all runtimes
    ${cyan}-u, --uninstall${reset}     Uninstall AgentSmith (remove all files)
    ${cyan}-h, --help${reset}          Show this help message

  ${yellow}Examples:${reset}
    ${dim}# Interactive install (prompts for runtime and location)${reset}
    bun bin/install.ts

    ${dim}# Install for Claude Code globally${reset}
    bun bin/install.ts --claude --global

    ${dim}# Install for all runtimes globally${reset}
    bun bin/install.ts --all --global

    ${dim}# Install to current project only${reset}
    bun bin/install.ts --claude --local

    ${dim}# Uninstall AgentSmith from Claude Code globally${reset}
    bun bin/install.ts --claude --global --uninstall
`);
  process.exit(0);
}

/**
 * Get directory name for a runtime
 */
function getDirName(runtime: string): string {
  if (runtime === 'opencode') return '.opencode';
  if (runtime === 'gemini') return '.gemini';
  return '.claude';
}

/**
 * Get global config directory for a runtime
 */
function getGlobalDir(runtime: string): string {
  if (runtime === 'opencode') {
    return join(homedir(), '.config', 'opencode');
  }
  if (runtime === 'gemini') {
    return join(homedir(), '.gemini');
  }
  return join(homedir(), '.claude');
}

// Color name to hex mapping for opencode
const colorNameToHex: Record<string, string> = {
  cyan: '#00FFFF',
  red: '#FF0000',
  green: '#00FF00',
  blue: '#0000FF',
  yellow: '#FFFF00',
  magenta: '#FF00FF',
  orange: '#FFA500',
  purple: '#800080',
  pink: '#FFC0CB',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#808080',
  grey: '#808080',
};

// Tool name mappings
const claudeToOpencodeTools: Record<string, string> = {
  AskUserQuestion: 'question',
  SlashCommand: 'skill',
  TodoWrite: 'todowrite',
  WebFetch: 'webfetch',
  WebSearch: 'websearch',
};

const claudeToGeminiTools: Record<string, string> = {
  Read: 'read_file',
  Write: 'write_file',
  Edit: 'replace',
  Bash: 'run_shell_command',
  Glob: 'glob',
  Grep: 'search_file_content',
  WebSearch: 'google_web_search',
  WebFetch: 'web_fetch',
  TodoWrite: 'write_todos',
  AskUserQuestion: 'ask_user',
};

function convertToolName(claudeTool: string): string {
  if (claudeToOpencodeTools[claudeTool]) return claudeToOpencodeTools[claudeTool];
  if (claudeTool.startsWith('mcp__')) return claudeTool;
  return claudeTool.toLowerCase();
}

function convertGeminiToolName(claudeTool: string): string | null {
  if (claudeTool.startsWith('mcp__')) return null;
  if (claudeTool === 'Task') return null;
  if (claudeToGeminiTools[claudeTool]) return claudeToGeminiTools[claudeTool];
  return claudeTool.toLowerCase();
}

function stripSubTags(content: string): string {
  return content.replace(/<sub>(.*?)<\/sub>/g, '*($1)*');
}

/**
 * Convert Claude Code frontmatter to OpenCode format
 */
function convertToOpencode(content: string): string {
  let out = content;
  out = out.replace(/\bAskUserQuestion\b/g, 'question');
  out = out.replace(/\bSlashCommand\b/g, 'skill');
  out = out.replace(/\bTodoWrite\b/g, 'todowrite');
  out = out.replace(/~\/\.claude\b/g, '~/.config/opencode');

  if (!out.startsWith('---')) return out;

  const endIndex = out.indexOf('---', 3);
  if (endIndex === -1) return out;

  const frontmatter = out.substring(3, endIndex).trim();
  const body = out.substring(endIndex + 3);
  const lines = frontmatter.split('\n');
  const newLines: string[] = [];
  const tools: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('tools:')) {
      const val = trimmed.substring(6).trim();
      if (val) tools.push(...val.split(',').map(t => t.trim()).filter(Boolean));
      continue;
    }
    if (trimmed.startsWith('name:')) continue;
    if (trimmed.startsWith('color:')) {
      const colorVal = trimmed.substring(6).trim().toLowerCase();
      const hex = colorNameToHex[colorVal];
      if (hex) newLines.push(`color: "${hex}"`);
      else if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(colorVal)) newLines.push(line);
      continue;
    }
    newLines.push(line);
  }

  if (tools.length > 0) {
    newLines.push('tools:');
    for (const tool of tools) newLines.push(`  ${convertToolName(tool)}: true`);
  }

  return `---\n${newLines.join('\n').trim()}\n---${body}`;
}

/**
 * Convert Claude Code agent frontmatter to Gemini CLI format
 */
function convertToGeminiAgent(content: string): string {
  if (!content.startsWith('---')) return content;

  const endIndex = content.indexOf('---', 3);
  if (endIndex === -1) return content;

  const frontmatter = content.substring(3, endIndex).trim();
  const body = content.substring(endIndex + 3);
  const lines = frontmatter.split('\n');
  const newLines: string[] = [];
  const tools: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('tools:')) {
      const val = trimmed.substring(6).trim();
      if (val) {
        for (const t of val.split(',').map(t => t.trim()).filter(Boolean)) {
          const mapped = convertGeminiToolName(t);
          if (mapped) tools.push(mapped);
        }
      }
      continue;
    }
    if (trimmed.startsWith('color:')) continue;
    newLines.push(line);
  }

  if (tools.length > 0) {
    newLines.push('tools:');
    for (const tool of tools) newLines.push(`  - ${tool}`);
  }

  const escapedBody = body.replace(/\$\{(\w+)\}/g, '$$$1');
  return `---\n${newLines.join('\n').trim()}\n---${stripSubTags(escapedBody)}`;
}

/**
 * Convert Claude Code skill to Gemini TOML format
 */
function convertToGeminiToml(content: string): string {
  if (!content.startsWith('---')) return `prompt = ${JSON.stringify(content)}\n`;

  const endIndex = content.indexOf('---', 3);
  if (endIndex === -1) return `prompt = ${JSON.stringify(content)}\n`;

  const frontmatter = content.substring(3, endIndex).trim();
  const body = content.substring(endIndex + 3).trim();

  let description = '';
  for (const line of frontmatter.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('description:')) {
      description = trimmed.substring(12).trim();
      break;
    }
  }

  let toml = '';
  if (description) toml += `description = ${JSON.stringify(description)}\n`;
  toml += `prompt = ${JSON.stringify(body)}\n`;
  return toml;
}

/**
 * Apply runtime-specific transformations to file content
 */
function transformContent(content: string, runtime: string, isSkill: boolean): string {
  if (runtime === 'opencode') return convertToOpencode(content);
  if (runtime === 'gemini') return isSkill ? convertToGeminiToml(content) : convertToGeminiAgent(content);
  return content;
}

/**
 * Recursively copy a directory, transforming .md files per runtime
 */
function copyDir(
  srcDir: string,
  destDir: string,
  pathPrefix: string,
  runtime: string,
  isSkill = false
): void {
  const dirName = getDirName(runtime);

  if (existsSync(destDir)) rmSync(destDir, { recursive: true });
  mkdirSync(destDir, { recursive: true });
  if (!existsSync(srcDir)) return;

  for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = join(srcDir, entry.name);
    const destPath = join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, pathPrefix, runtime, isSkill);
    } else if (entry.name.endsWith('.md')) {
      let content = readFileSync(srcPath, 'utf8');
      content = content.replace(/~\/\.claude\//g, pathPrefix);
      content = content.replace(/\.\/\.claude\//g, `./${dirName}/`);
      content = transformContent(content, runtime, isSkill);

      // Gemini skills become .toml files
      if (runtime === 'gemini' && isSkill) {
        writeFileSync(destPath.replace(/\.md$/, '.toml'), content);
      } else {
        writeFileSync(destPath, content);
      }
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Uninstall AgentSmith files for a given runtime and location
 */
function uninstall(isGlobal: boolean, runtime: string): void {
  const dirName = getDirName(runtime);
  const targetDir = isGlobal ? getGlobalDir(runtime) : join(process.cwd(), dirName);
  const locationLabel = isGlobal ? targetDir.replace(homedir(), '~') : targetDir.replace(process.cwd(), '.');
  const runtimeLabel = runtime === 'opencode' ? 'OpenCode' : runtime === 'gemini' ? 'Gemini' : 'Claude Code';

  console.log(`  Uninstalling AgentSmith from ${cyan}${runtimeLabel}${reset} at ${cyan}${locationLabel}${reset}\n`);

  if (!existsSync(targetDir)) {
    console.log(`  ${yellow}⚠${reset} Directory does not exist: ${locationLabel}\n  Nothing to uninstall.\n`);
    return;
  }

  let removedCount = 0;

  const commandsDir = join(targetDir, 'commands', 'agentsmith');
  if (existsSync(commandsDir)) {
    rmSync(commandsDir, { recursive: true });
    removedCount++;
    console.log(`  ${green}✓${reset} Removed commands/agentsmith/`);
  }

  const agentsDir = join(targetDir, 'agents');
  if (existsSync(agentsDir)) {
    let count = 0;
    for (const file of readdirSync(agentsDir)) {
      if (file.startsWith('agentsmith-') && file.endsWith('.md')) {
        unlinkSync(join(agentsDir, file));
        count++;
      }
    }
    if (count > 0) {
      removedCount++;
      console.log(`  ${green}✓${reset} Removed ${count} AgentSmith agents`);
    }
  }

  if (removedCount === 0) console.log(`  ${yellow}⚠${reset} No AgentSmith files found to remove.`);
  console.log(`\n  ${green}Done!${reset} AgentSmith has been uninstalled from ${runtimeLabel}.\n`);
}

/**
 * Install AgentSmith agents and skills for a given runtime and location
 */
function install(isGlobal: boolean, runtime: string): void {
  const dirName = getDirName(runtime);
  const src = new URL('..', import.meta.url).pathname;
  const targetDir = isGlobal ? getGlobalDir(runtime) : join(process.cwd(), dirName);
  const locationLabel = isGlobal ? targetDir.replace(homedir(), '~') : targetDir.replace(process.cwd(), '.');
  const pathPrefix = isGlobal ? `${targetDir.replace(/\\/g, '/')}/` : `./${dirName}/`;
  const runtimeLabel = runtime === 'opencode' ? 'OpenCode' : runtime === 'gemini' ? 'Gemini' : 'Claude Code';

  console.log(`  Installing for ${cyan}${runtimeLabel}${reset} to ${cyan}${locationLabel}${reset}\n`);

  const failures: string[] = [];

  // Install agents
  const agentsSrc = join(src, 'agents');
  if (existsSync(agentsSrc)) {
    const agentsDest = join(targetDir, 'agents');
    mkdirSync(agentsDest, { recursive: true });

    // Remove old agentsmith agents before copying
    for (const file of readdirSync(agentsDest)) {
      if (file.startsWith('agentsmith-') && file.endsWith('.md')) {
        unlinkSync(join(agentsDest, file));
      }
    }

    for (const entry of readdirSync(agentsSrc, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        let content = readFileSync(join(agentsSrc, entry.name), 'utf8');
        content = content.replace(/~\/\.claude\//g, pathPrefix);
        content = transformContent(content, runtime, false);
        writeFileSync(join(agentsDest, entry.name), content);
      }
    }

    if (existsSync(agentsDest)) {
      console.log(`  ${green}✓${reset} Installed agents`);
    } else {
      console.error(`  ${yellow}✗${reset} Failed to install agents`);
      failures.push('agents');
    }
  }

  // Install skills
  const skillsSrc = join(src, 'skills');
  if (existsSync(skillsSrc)) {
    const skillsDest = join(targetDir, 'commands', 'agentsmith');
    copyDir(skillsSrc, skillsDest, pathPrefix, runtime, true);

    if (existsSync(skillsDest)) {
      console.log(`  ${green}✓${reset} Installed commands/agentsmith`);
    } else {
      console.error(`  ${yellow}✗${reset} Failed to install commands/agentsmith`);
      failures.push('commands/agentsmith');
    }
  }

  if (failures.length > 0) {
    console.error(`\n  ${yellow}Installation incomplete!${reset} Failed: ${failures.join(', ')}`);
    process.exit(1);
  }

  console.log(`\n  ${green}Done!${reset} AgentSmith has been installed to ${runtimeLabel}.`);
  console.log(`\n  ${cyan}Next steps:${reset}`);
  console.log(`  - Launch ${runtimeLabel} and use the Task tool to invoke agents`);
  console.log(`  - Build new agents and skills with agentsmith agents\n`);
}

function installAll(runtimes: string[], isGlobal: boolean): void {
  for (const runtime of runtimes) install(isGlobal, runtime);
}

/**
 * Prompt for runtime selection
 */
function promptRuntime(callback: (runtimes: string[]) => void): void {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  let answered = false;

  rl.on('close', () => {
    if (!answered) {
      console.log(`\n  ${yellow}Installation cancelled${reset}\n`);
      process.exit(0);
    }
  });

  console.log(`  ${yellow}Which runtime(s) would you like to install for?${reset}\n
  ${cyan}1${reset}) Claude Code ${dim}(~/.claude)${reset}
  ${cyan}2${reset}) OpenCode    ${dim}(~/.config/opencode)${reset}
  ${cyan}3${reset}) Gemini      ${dim}(~/.gemini)${reset}
  ${cyan}4${reset}) All
`);

  rl.question(`  Choice ${dim}[1]${reset}: `, (answer) => {
    answered = true;
    rl.close();
    const choice = answer.trim() || '1';
    if (choice === '4') callback(['claude', 'opencode', 'gemini']);
    else if (choice === '3') callback(['gemini']);
    else if (choice === '2') callback(['opencode']);
    else callback(['claude']);
  });
}

/**
 * Prompt for install location (global vs local)
 */
function promptLocation(runtimes: string[]): void {
  if (!process.stdin.isTTY) {
    console.log(`  ${yellow}Non-interactive terminal detected, defaulting to global install${reset}\n`);
    installAll(runtimes, true);
    return;
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  let answered = false;

  rl.on('close', () => {
    if (!answered) {
      console.log(`\n  ${yellow}Installation cancelled${reset}\n`);
      process.exit(0);
    }
  });

  const globalPaths = runtimes.map(r => getGlobalDir(r).replace(homedir(), '~')).join(', ');
  const localPaths = runtimes.map(r => `./${getDirName(r)}`).join(', ');

  console.log(`  ${yellow}Where would you like to install?${reset}\n
  ${cyan}1${reset}) Global ${dim}(${globalPaths})${reset} - available in all projects
  ${cyan}2${reset}) Local  ${dim}(${localPaths})${reset} - this project only
`);

  rl.question(`  Choice ${dim}[1]${reset}: `, (answer) => {
    answered = true;
    rl.close();
    installAll(runtimes, answer.trim() !== '2');
  });
}

// Main
if (hasGlobal && hasLocal) {
  console.error(`  ${yellow}Cannot specify both --global and --local${reset}`);
  process.exit(1);
} else if (hasUninstall) {
  if (!hasGlobal && !hasLocal) {
    console.error(`  ${yellow}--uninstall requires --global or --local${reset}`);
    process.exit(1);
  }
  const runtimes = selectedRuntimes.length > 0 ? selectedRuntimes : ['claude'];
  for (const runtime of runtimes) uninstall(hasGlobal, runtime);
} else if (selectedRuntimes.length > 0) {
  if (!hasGlobal && !hasLocal) promptLocation(selectedRuntimes);
  else installAll(selectedRuntimes, hasGlobal);
} else if (hasGlobal || hasLocal) {
  installAll(['claude'], hasGlobal);
} else {
  if (!process.stdin.isTTY) {
    console.log(`  ${yellow}Non-interactive terminal detected, defaulting to Claude Code global install${reset}\n`);
    installAll(['claude'], true);
  } else {
    promptRuntime((runtimes) => promptLocation(runtimes));
  }
}
