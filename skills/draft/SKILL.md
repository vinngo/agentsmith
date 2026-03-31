---
name: draft
description: Draft agents and skills for the user to approve.
---

<prereqs>
    First, read `.agentmancy/codebase/CANDIDATES.md` for context on proposed
    agents and skills.

    - If the file does not exist or is empty:
      - Run the `/agentmancy:analyze` command once to generate candidates.
      - After it completes, re-read `.agentmancy/codebase/CANDIDATES.md`.
      - If it is still missing or empty, abort this skill with a brief
        explanation to the user (do NOT guess candidates).

    You MUST know what the proposed agents and skills are BEFORE interacting
    with the user.
</prereqs>


<task>
    First, present all proposed skills for the user to select using the
    AskUserQuestionTool with `multiSelect: true`:

    - header: "Select Skills"
    - question: "Which skills would you like to install?"
    - options: One option per proposed skill, formatted as:
      - label: "[skill_name]" — what it does
      - description: Short description / when-to-use

    Use the machine name (e.g., `checkout-verifier-skill`) as the option
    value, and show the human-friendly name + description in the label.
    
    Secondly, present all proposed agents for the user to select using the
    AskUserQuestionTool with `multiSelect: true`:

    - header: "Select Agents"
    - question: "Which agents would you like to install?"
    - options: One option per proposed agent, formatted as:
      - label: "[agent_name]" — what it does
      - description: Short description / when-to-use

    Again, use the machine name as the option value, and surface the human
    name and description in the label.
    
    Do NOT include a "skip" or "you decide" option.

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
