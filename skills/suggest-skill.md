---
name: suggest
description: Propose narrowly scoped subagents and skills for this codebase, then write candidate definitions to .agentmancy/codebase/CANDIDATES.md for the user to review and approve.
---

<methodology>
    Goal: Design narrowly scoped, clearly described specialist subagents that
    offload focused work (exploration, planning, implementation, QA) while
    managing context, cost, and safety.

    When proposing a subagent, ALWAYS specify:
      - name
      - one-sentence description (when to use it)
      - allowed tools + permissions
      - expected input shape
      - expected output format
      - handoff target (who should consume its output)

    Core purpose and scope
      - Prefer single responsibility: one clear goal, one main input shape,
        one expected output format.
      - Target tasks that would otherwise bloat the main context
        (large code exploration, deep research, verbose reports).
      - Use action-oriented descriptions, e.g.:
        “After a spec exists, produce an ADR and guardrails.”
        “Explore the codebase without modifying files.”

    Tooling, permissions, and safety
      - Give each subagent tightly scoped tool access
        (e.g., read-only explorer vs. write-capable implementer).
      - Default to least privilege; serialize high-risk actions
        (deployments, large refactors).
      - Prefer “forced delegation”: the orchestrator does not touch code
        directly, it delegates through specialized subagents.

    Context and memory management
      - Treat each subagent’s context window as a separate scratchpad.
      - Require compact summaries: structured reports, bullet findings,
        patch sets, or test plans.
      - Scope any persistent memory (user / project / local) so patterns
        like code style or recurring issues can be reused without leaking
        irrelevant history.

    Orchestration and collaboration
      - Assume a hierarchy: an orchestrator decomposes work into
        investigate → plan → implement → test.
      - Parallelize low-risk tasks (independent file analyses, docs, reporting);
        serialize high-impact actions.
      - Make handoff rules explicit: when to stop, what artifact to return,
        and which agent or workflow consumes it next.

    Robustness and evolvability
      - Define subagents as config/markdown assets (name, description, tools,
        prompts) that can be version-controlled.
      - When a subagent misbehaves, update its definition:
        clarify triggers, tighten prompts, and enforce more structured outputs.
      - Prefer reusable libraries of specialized subagents (stack-specific,
        framework-specific, review styles) over ad-hoc prompting.
</methodology>

<methodology>
    When proposing a new skill:
      - Assign it to exactly ONE primary category from the list below.
      - Design it as a folder with SKILL.md plus supporting files
        (references, scripts, templates) using progressive disclosure.
      - Focus SKILL.md on information that changes Claude’s behavior beyond
        its default coding knowledge.

    Categories

    1. Library & API References
       - Purpose: Explain how to correctly use a specific library, CLI, SDK,
         or internal platform, including edge cases and footguns.
       - Contents: Reference snippets, “gotchas”, and realistic usage examples.
       - Examples: billing-lib, internal-platform-cli, frontend-design.

    2. Product Verification
       - Purpose: Describe how to test and verify that product flows work.
       - Contents: Scripts + instructions for automated flows (e.g. Playwright,
         tmux, headless browsers) with asserts or state checks.
       - Examples: signup-flow-driver, checkout-verifier, tmux-cli-driver.

    3. Data Fetching & Analysis
       - Purpose: Connect to data/monitoring stacks and standardize common
         analysis workflows.
       - Contents: Data-fetch helpers, canonical table/metric references,
         dashboard IDs, and example queries.
       - Examples: funnel-query, cohort-compare, grafana.

    4. Code Scaffolding & Templates
       - Purpose: Generate opinionated boilerplate for this codebase.
       - Contents: Templates, scripts, and instructions capturing natural
         language requirements that plain code can’t express.
       - Examples: new-<framework>-workflow, new-migration, create-app.

    5. Code Quality & Review
       - Purpose: Enforce local code quality and review standards.
       - Contents: Review checklists, deterministic tools, scripts, and
         organization-specific test practices.
       - Examples: adversarial-review, code-style, testing-practices.

    6. CI/CD & Deployment
       - Purpose: Help fetch, push, and deploy code safely.
       - Contents: Workflows and scripts for PR babysitting, rollout,
         rollback, and production cherry-picks.
       - Examples: babysit-pr, deploy-<service>, cherry-pick-prod.

    Tips & tricks
      - Don’t state the obvious: assume strong general coding knowledge;
        focus on specifics of THIS codebase and stack.
      - Always include a “Gotchas” section built from real failures and
        update it over time.
      - Use the file system for progressive disclosure:
        SKILL.md points to references/, examples/, scripts/, assets/.
      - Avoid railroading: give firm preferences and constraints, but keep
        room for adaptation.
      - Think through setup: store user- or env-specific config in a
        config.json in the skill directory and prompt the user if missing.
      - The description field is for the model:
        describe when to trigger the skill, not just what it does.
      - Store scripts and helper libraries inside the skill so the agent
        spends its turns composing them instead of rewriting boilerplate.
</methodology>

<task>
    Using the information in `.agentmancy/codebase/ARCHITECTURE.md`,
    `STRUCTURE.md`, `STACK.md`, and `INTEGRATIONS.md`:

    1. Identify 3–7 high-value opportunities for:
       - new subagents, and/or
       - new skills (each in exactly one category).

    2. For each opportunity, append a proposal to
       `.agentmancy/codebase/CANDIDATES.md` in this format:

       ## [type] <machine_name>

       - Type: subagent | skill
       - Category: one of [Library & API References | Product Verification
         | Data Fetching & Analysis | Code Scaffolding & Templates
         | Code Quality & Review | CI/CD & Deployment]
       - Human name: Short descriptive name
       - Description: One sentence describing WHEN this should trigger.
       - Inputs: Expected input shape (fields and types, if applicable).
       - Outputs: Expected output format and artifacts.
       - Tools / Permissions: Which tools it can use and any constraints.
       - Files to create in its folder: (for skills) SKILL.md plus any
         reference/, scripts/, examples/, templates/.
       - Gotchas: 3–7 concrete pitfalls this agent/skill is intended to avoid.
       - Rationale: 2–4 bullet points on why this is valuable for THIS codebase.

    3. Do NOT create or modify any other files.
       Only append to `CANDIDATES.md`.
</task>
