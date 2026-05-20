# MCP tools (installed for this project)

Restart **Cursor** after editing `mcp.json` (Settings → MCP → refresh).

| Name | Role | Notes |
|------|------|--------|
| **kinrg** | Code knowledge graph / context | `pip install kinrg`; run `kinrg index` in repo root |
| **PruneTool** | Browser snapshot pruning (mcprune) | `C:\Users\user\.cursor\tools\mcprune\mcp-server.js` |
| **guardian** | Policy / scan MCP | `npm install -g guardian-mcp` |
| **limelight** | React runtime debug MCP | Uses `C:\nodejs\npx.cmd -y limelight-mcp` |
| **mcp-on-demand** | McpHub proxy | `C:\Users\user\.local\bin\McpHub.exe` |

Extra CLI (not MCP): `C:\Users\user\.local\bin\pruner.exe` — codebase context for agents.

Config files:

- Project: `.cursor/mcp.json`
- Global: `%USERPROFILE%\.cursor\mcp.json`
- McpHub servers: `%USERPROFILE%\.McpHub\config.json`
