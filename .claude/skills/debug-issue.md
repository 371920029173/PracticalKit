---
name: Debug Issue
description: Systematically debug issues using graph-powered code navigation
---

## Debug Issue

Use the knowledge graph to systematically trace and debug issues.

### Steps

1. Use `smart_search_tool` to find code related to the issue.
2. Use `inspect_relationships_tool` with `callers_of` and `callees_of` to trace call chains.
3. Use `detail_flow_tool` to see full execution paths through suspected areas.
4. Run `audit_diff_tool` to check if recent changes caused the issue.
5. Use `trace_impact_tool` on suspected files to see what else is affected.

### Tips

- Check both callers and callees to understand the full context.
- Look at affected flows to find the entry point that triggers the bug.
- Recent changes are the most common source of new issues.

## Token Efficiency Rules
- ALWAYS start with `quick_brief_tool(task="<your task>")` before any other graph tool.
- Use `detail_level="minimal"` on all calls. Only escalate to "standard" when minimal is insufficient.
- Target: complete any review/debug/refactor task in ≤5 tool calls and ≤800 total output tokens.
