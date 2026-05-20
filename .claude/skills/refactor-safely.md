---
name: Refactor Safely
description: Plan and execute safe refactoring using dependency analysis
---

## Refactor Safely

Use the knowledge graph to plan and execute refactoring with confidence.

### Steps

1. Use `refactor_advisor_tool` with mode="suggest" for community-driven refactoring suggestions.
2. Use `refactor_advisor_tool` with mode="dead_code" to find unreferenced code.
3. For renames, use `refactor_advisor_tool` with mode="rename" to preview all affected locations.
4. Use `execute_refactor_tool` with the refactor_id to apply renames.
5. After changes, run `audit_diff_tool` to verify the refactoring impact.

### Safety Checks

- Always preview before applying (rename mode gives you an edit list).
- Check `trace_impact_tool` before major refactors.
- Use `check_damaged_flows_tool` to ensure no critical paths are broken.
- Run `check_complexity_tool` to identify decomposition targets.

## Token Efficiency Rules
- ALWAYS start with `quick_brief_tool(task="<your task>")` before any other graph tool.
- Use `detail_level="minimal"` on all calls. Only escalate to "standard" when minimal is insufficient.
- Target: complete any review/debug/refactor task in ≤5 tool calls and ≤800 total output tokens.
