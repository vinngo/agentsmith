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

Once the user has submitted their respone, use the Task tool to launch the `agentmancy-skill-builder` agent with the following prompt and formatting:

type Skill = {
  name: string;
  function: string;
  description: string;
  rationale: string;
  tools: string[];
};

type Agent = {
  name: string;
  function: string;
  description: string;
  rationale: string;
  tools: string[];
};

```
Given the following documents in `.agentmancy/codebase/`:
- CANDIDATES.md: A high level overview of what skills should be generated
- chosen_skills: Skill[] /* User's chosen skills here */
```

Once the `agentmancy-skill-builder` is finished, use the Launch tool to launch an `agentmancy-agentbuilder` agent with the following prompt.

```
Given the following documents in `.agentmancy/codebase/`:
- CANDIDATES.md: A high level overview of what agents should be generated
- chosen_agents: Agent[] /* User's chosen agents here */
```
