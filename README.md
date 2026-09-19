# pipe0 plugin

Connect [Grok Bot](https://docs.x.ai/grok-bot/overview), [Grok Build](https://docs.x.ai/build/overview), and Cursor to [pipe0](https://pipe0.com): search for people and companies, enrich them with work emails, phone numbers, and LinkedIn data, and operate pipe0 Sheets, schedules, and reports from your agent.

The plugin is a thin wrapper around the hosted pipe0 MCP server. The server exposes the whole product as tools and carries its own operating instructions, guides, and playbooks, so the agent learns how pipe0 works the moment it connects. The bundled `pipe0` skill adds a short orientation for the agent and a `/pipe0` slash command.

## Install

### Grok Bot

1. Open **Plugins** in the sidebar and search for **pipe0**.
2. Add the plugin. A browser window opens; sign in to pipe0 and approve access.
3. Confirm **pipe0** shows under **Installed**. Every bot on the account can now use it.

### Grok Build

From the official marketplace:

```bash
grok plugin install pipe0 --trust
```

Or straight from this repository:

```bash
grok plugin install pipe-0/pipe0-plugin --trust
```

Inside the TUI, `/marketplace` browses the catalog and `/plugin` manages installed plugins. The first pipe0 tool call opens the browser for sign-in.

### Cursor

Search for **pipe0** in the Cursor Marketplace and install it. Cursor shows a login prompt next to `pipe0` under **Settings > MCP**; click it to sign in.

### Any other MCP client

```json
{
  "mcpServers": {
    "pipe0": {
      "type": "http",
      "url": "https://api.pipe0.com/v1/mcp"
    }
  }
}
```

Full per-client setup instructions live at [pipe0.com/docs/sdks/mcp](https://pipe0.com/docs/sdks/mcp).

## Authentication

Sign-in is OAuth 2.1 with PKCE and dynamic client registration. The client registers itself with pipe0 on first connect and opens the browser for you to sign in and approve access. There is no API key, client ID, or client secret to configure, and the plugin stores no credentials.

pipe0 API keys do not work for the MCP server. If a client configuration sends an `Authorization` header with an API key, remove it and reconnect with OAuth.

## Network endpoints and credentials

The plugin connects only to `api.pipe0.com`:

| Endpoint | Purpose |
|---|---|
| `https://api.pipe0.com/v1/mcp` | Hosted MCP server (streamable HTTP) |
| `https://api.pipe0.com/.well-known/oauth-protected-resource` | OAuth resource metadata discovery |
| `https://api.pipe0.com/.well-known/oauth-authorization-server` | OAuth server metadata discovery |
| `https://api.pipe0.com/auth/mcp/authorize`, `/token`, `/register` | OAuth 2.1 authorization, token exchange, dynamic client registration |

Credentials: a pipe0 account. The access token is sent as `Authorization: Bearer` on `/v1/mcp` and is scoped to the organization the signed-in user belongs to.

Production tool calls are billed in pipe0 credits like regular API requests. Tools that spend credits or mutate data ask for confirmation on the first call. Sandbox runs are free. See [Billing](https://pipe0.com/docs/billing).

## What is inside

```
.grok-plugin/plugin.json       Grok Build manifest
.grok-plugin/marketplace.json  Single-plugin marketplace so this repo can be added as a source
.cursor-plugin/plugin.json     Cursor Marketplace manifest (Grok Bot and Cursor)
.mcp.json                      MCP server config read by Grok Build
mcp.json                       Same config, read by Cursor
skills/pipe0/SKILL.md          Router skill: what pipe0 is and how to work with it
assets/logo.svg                Marketplace logo
```

The two MCP files must stay identical; `scripts/validate.mjs` enforces it.

## What the agent can do

- **Discover** pipes, searches, effects, and playbooks, and read their exact schemas.
- **Run** one-shot searches and enrichments, or **build sheets** with columns, filters, and schedules.
- **Validate** every payload before anything is billed.
- **Verify** outcomes by reading real cell statuses after a run.
- **Report** with versioned report documents next to your sheets.

Read more at [Work with AI agents](https://pipe0.com/docs/sheets/ai-agents).

## Development

```bash
node scripts/validate.mjs        # structural checks on manifests, MCP config, skill, and logo
grok plugin validate .           # Grok Build's own manifest validation, if the CLI is installed
grok plugin install ./ --trust   # try the plugin locally in Grok Build
```

For Cursor, copy the repo to `~/.cursor/plugins/local/pipe0/` and reload. See [PUBLISHING.md](PUBLISHING.md) for how releases reach the marketplaces.

## License

MIT. Use of the hosted MCP server is governed by pipe0's [terms of service](https://pipe0.com/legal/terms-of-service).
