---
name: analyze
description: Use the Task tool to run the agentmancy-repository-analyzer on this repository, write architecture and stack docs to .agentmancy/codebase/, and surface top agent/skill candidates.
---

Use the Task tool to launch the `agentmancy-repository-analyzer` agent with this prompt:

"""
Analyze the repository at the current working directory.

Produce the following documents in `.agentmancy/codebase/`:
- ARCHITECTURE.md — high-level architecture, key directories, data flow
- STRUCTURE.md — file/folder layout with purpose annotations
- STACK.md — languages, frameworks, runtimes, build tools
- INTEGRATIONS.md — external APIs, services, databases, SDKs

After these documents are written, use the `suggest-skills` skill
to start drafting agents and skills for this codebase.
"""

<task>
    After the `agentmancy-repository-analyzer` Task completes:

    1. Read each of the following files from `.agentmancy/codebase/`:
       - ARCHITECTURE.md
       - STRUCTURE.md
       - STACK.md
       - INTEGRATIONS.md

    2. For the user, produce a concise summary with four sections:
       - Architecture: 3–7 bullets on overall design and key components.
       - Structure: 3–7 bullets on important directories and file patterns.
       - Stack: 3–7 bullets on languages, frameworks, and build tools.
       - Integrations: 3–7 bullets on external APIs, services, and databases.

    3. Highlight the top 3–7 agent/skill candidates discovered so far.
       For each, include:
       - Name and type (subagent or skill, with category if a skill).
       - One-sentence “when to use this”.
       - 2–3 bullets on why it is valuable for this repository.

    4. Finally, issue the `/agentmancy:propose` command with a short,
       user-facing message to start the next task. Do not modify any
       files in this step.
</task>
