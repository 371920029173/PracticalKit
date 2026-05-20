---
name: Explore Codebase
description: Navigate and understand codebase structure using the knowledge graph
---

## Explore Codebase

Use the kinrg MCP tools to explore and understand the codebase.

### Steps

1. Run `fetch_stats_tool` to see overall codebase metrics.
2. Run `generate_blueprint_tool` for high-level community structure.
3. Use `cluster_modules_tool` to find major modules, then `inspect_module_tool` for details.
4. Use `smart_search_tool` to find specific functions or classes.
5. Use `inspect_relationships_tool` with patterns like `callers_of`, `callees_of`, `imports_of` to trace relationships.
6. Use `explore_flows_tool` and `detail_flow_tool` to understand execution paths.

### Tips

- Start broad (stats, architecture) then narrow down to specific areas.
- Use `children_of` on `inspect_relationships_tool` for a file to see its functions.
- Use `check_complexity_tool` to identify complex code.

## Token Efficiency Rules
- ALWAYS start with `quick_brief_tool(task="<your task>")` before any other graph tool.
- Use `detail_level="minimal"` on all calls. Only escalate to "standard" when minimal is insufficient.
- Target: complete any review/debug/refactor task in ≤5 tool calls and ≤800 total output tokens.
