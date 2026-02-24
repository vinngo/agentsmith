---
name: propose
description: Propose agents and skills for the user to approve.
---

<prereqs>
Firstly, read .agentsmith/codebase/CANDIDATES.md for context on proposed agents and skills. If that file doesn't exist or is blank: use `/agentmancy:analyze`. You MUST know what the proposed agents and skills are BEFORE interaction with the user.
</prereqs>

<task>
First present all the skills proposed for the user to select using the `AskUserQuestionTool (multiSelect: True)`
- header: "Select Skills"
- question: "Which skills would you like to install?"
- options: Generate fields for each skill proposed, formatted as:
  - "[skill name]" (what it does)
  - (description)

Secondly present all the agents proposed for the user to select using the `AskUserQuestionTool (multiSelect: True)`
- header: "Select Agents"
- question: "Which agents would you like to install?"
- options: Generate fields for each agent proposed, formatted as:
  - "[skill name]" (what it does)
  - (description)
  
Do NOT include a **skip** or a "you decide" option.
</task>

Once the user has submitted their response, dispatch builders in parallel:

**Skills**: Launch one `agentmancy-skill-builder` Task per chosen skill. Each agent receives a single skill object:

\```
Build the following skill and write it to skills/.

CANDIDATES.md context: <paste relevant excerpt>

skill: {
  name: "...",
  function: "...",
  description: "...",
  rationale: "...",
  tools: [...]
}
\```

**Agents**: Simultaneously, launch one `agentmancy-agent-builder` Task per chosen agent, each with a single agent object in the same format.

Wait for all Tasks to complete, then summarize what was written.
