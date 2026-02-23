# AgentSmith

AI Agent & Skill Builder for Claude Code, OpenCode, and Gemini.

Build custom agents and skills that work across multiple AI coding assistants.

## Features

- 🤖 **Multi-Runtime Support**: Works with Claude Code, OpenCode, and Gemini
- 🛠️ **Agent Builder**: Create specialized agents for specific tasks
- ⚡ **Skill Builder**: Build reusable skills/commands
- 🔄 **Auto-Transform**: Automatically converts formats for each runtime
- 📦 **Easy Install**: One command to install everywhere

## Installation

### Interactive Install

```bash
bun bin/install.ts
```

Follow the prompts to choose your runtime(s) and install location.

### Quick Install

```bash
# Install for Claude Code globally
bun bin/install.ts --claude --global

# Install for all runtimes globally
bun bin/install.ts --all --global

# Install to current project only
bun bin/install.ts --claude --local
```

### All Options

```bash
bun bin/install.ts [options]

Options:
  -g, --global        Install globally (to config directory)
  -l, --local         Install locally (to current directory)
  --claude            Install for Claude Code only
  --opencode          Install for OpenCode only
  --gemini            Install for Gemini only
  --all               Install for all runtimes
  -u, --uninstall     Uninstall AgentSmith
  -h, --help          Show help message
```

## Usage

After installation, you'll have access to AgentSmith agents and skills:

### Agents

- **agentsmith-agent-builder**: Build custom agents for your workflow
- **agentsmith-skill-builder**: Create reusable skills/commands
- **agentsmith-repository-analyzer**: Analyze codebases for structure and patterns
- **agentsmith-verifier**: Verify agent and skill implementations

Use agents via the Task tool:

```typescript
// In Claude Code, OpenCode, or Gemini
Task(subagent_type: "agentsmith-agent-builder", prompt: "Create an agent for...")
```

### Skills

Skills will be available as `/agentsmith:*` commands once the `skills/` directory is populated.

## Project Structure

```
agentsmith/
├── agents/           # Pre-built agents
├── skills/           # Pre-built skills/commands (coming soon)
├── bin/
│   └── install.ts    # Installation script
└── package.json
```

## How It Works

AgentSmith automatically transforms agent and skill definitions for each runtime:

- **Claude Code**: Uses original `.md` format with YAML frontmatter
- **OpenCode**: Converts to OpenCode format (tools object, hex colors, etc.)
- **Gemini**: Converts to Gemini CLI format (tools array, TOML commands, etc.)

This means you write once and deploy everywhere!

## Development

```bash
# Clone the repo
git clone <repo-url>
cd agentsmith

# Install dependencies
bun install

# Run tests
bun test

# Install locally for testing
bun bin/install.ts --claude --local
```

## Uninstall

```bash
# Uninstall from Claude Code globally
bun bin/install.ts --claude --global --uninstall

# Uninstall from all runtimes globally
bun bin/install.ts --all --global --uninstall
```

## License

MIT
