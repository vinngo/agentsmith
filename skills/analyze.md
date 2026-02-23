---
name: analyze
description: Analyze the current repository — architecture, tech stack, and agent/skill candidates — and write results to .agentmancy/codebase/
---

Use the Task tool to launch the `agentmancy-repository-analyzer` agent with this prompt:

```
Analyze the repository at the current working directory.

Produce the following documents in `.agentmancy/codebase/`:
- ARCHITECTURE.md — high-level architecture, key directories, data flow
- STRUCTURE.md — file/folder layout with purpose annotations
- STACK.md — languages, frameworks, runtimes, build tools
- INTEGRATIONS.md — external APIs, services, databases, SDKs
- CANDIDATES.md — recommended agents and skills to build for this codebase, with rationale

Be concrete and specific to this codebase. Avoid generic advice.
```

<task>
After the agent completes, summarize the key findings from each document for the user and highlight the top agent/skill candidates and use the `/agentmancy:propose` command to start the next task.
</task>
