# AgentMancy

AI Agent & Skill Builder for Claude Code, OpenCode, and Gemini.

Build custom agents and skills that work across multiple AI coding assistants.

## Features

- 🤖 **Multi-Runtime Support**: Works with Claude Code, OpenCode, and Gemini
- 🛠️ **Agent Builder**: Create specialized agents for specific tasks
- ⚡ **Skill Builder**: Build reusable skills/commands
- 🔄 **Auto-Transform**: Automatically converts formats for each runtime
- 📦 **Easy Install**: One command to install everywhere

## Requirements

- [Bun](https://bun.sh) must be installed (`curl -fsSL https://bun.sh/install | bash`)

## Installation

### Interactive Install

```bash
npx agentmancy
# or
bunx agentmancy
```

Follow the prompts to choose your runtime(s) and install location.

### Quick Install

```bash
# Install for Claude Code globally
npx agentmancy --claude --global

# Install for all runtimes globally
npx agentmancy --all --global

# Install to current project only
npx agentmancy --claude --local
```

### All Options

```bash
npx agentmancy [options]
# or: bunx agentmancy [options]

Options:
  -g, --global        Install globally (to config directory)
  -l, --local         Install locally (to current directory)
  --claude            Install for Claude Code only
  --opencode          Install for OpenCode only
  --gemini            Install for Gemini only
  --all               Install for all runtimes
  -u, --uninstall     Uninstall AgentMancy
  -h, --help          Show help message
```

## Usage

After installation, you'll have access to AgentMancy agents and skills:

### Agents

- **agentmancy-agent-builder**: Build custom agents for your workflow
- **agentmancy-skill-builder**: Create reusable skills/commands
- **agentmancy-repository-analyzer**: Analyze codebases for structure and patterns
- **agentmancy-verifier**: Verify agent and skill implementations

Use agents via the Task tool:

```typescript
// In Claude Code, OpenCode, or Gemini
Task(subagent_type: "agentmancy-agent-builder", prompt: "Create an agent for...")
```

### Skills

Skills will be available as `/agentmancy:*` commands once the `skills/` directory is populated.

## Project Structure

```
agentmancy/
├── agents/           # Pre-built agents
├── skills/           # Pre-built skills/commands (coming soon)
├── bin/
│   └── install.ts    # Installation script
└── package.json
```

## How It Works

AgentMancy automatically transforms agent and skill definitions for each runtime:

- **Claude Code**: Uses original `.md` format with YAML frontmatter
- **OpenCode**: Converts to OpenCode format (tools object, hex colors, etc.)
- **Gemini**: Converts to Gemini CLI format (tools array, TOML commands, etc.)

This means you write once and deploy everywhere!

## Development

```bash
# Clone the repo
git clone <repo-url>
cd agentmancy

# Install dependencies
bun install

# Run tests
bun test

# Install locally for testing
npx agentmancy --claude --local
```

## Uninstall

```bash
# Uninstall from Claude Code globally
npx agentmancy --claude --global --uninstall

# Uninstall from all runtimes globally
npx agentmancy --all --global --uninstall
```

> You can also use `bunx` in place of `npx` for any of the above commands.

## License

MIT
