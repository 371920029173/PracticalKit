<!-- kinrg MCP tools -->
## MCP Tools: kinrg

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
kinrg MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `smart_search_tool` or `inspect_relationships_tool` instead of Grep
- **Understanding impact**: `trace_impact_tool` instead of manually tracing imports
- **Code review**: `audit_diff_tool` + `prepare_review_tool` instead of reading entire files
- **Finding relationships**: `inspect_relationships_tool` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `generate_blueprint_tool` + `cluster_modules_tool`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `audit_diff_tool` | Reviewing code changes — gives risk-scored analysis |
| `prepare_review_tool` | Need source snippets for review — token-efficient |
| `trace_impact_tool` | Understanding blast radius of a change |
| `check_damaged_flows_tool` | Finding which execution paths are impacted |
| `inspect_relationships_tool` | Tracing callers, callees, imports, tests, dependencies |
| `smart_search_tool` | Finding functions/classes by name or keyword |
| `generate_blueprint_tool` | Understanding high-level codebase structure |
| `refactor_advisor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `audit_diff_tool` for code review.
3. Use `check_damaged_flows_tool` to understand impact.
4. Use `inspect_relationships_tool` pattern="tests_for" to check coverage.
