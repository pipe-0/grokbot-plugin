# Publishing

The same repository is submitted to two catalogs. Grok Bot installs plugins from the Cursor Marketplace; Grok Build has its own GitHub catalog.

## Release checklist

1. Bump `version` in both `.grok-plugin/plugin.json` and `.cursor-plugin/plugin.json` (they must match), and add a `CHANGELOG.md` entry with the same version.
2. Run `node scripts/validate.mjs`.
3. Commit, then tag: `git tag v<version> && git push --tags`. With Grok Build installed, `grok plugin tag --push` does this from the manifest.
4. Update the catalogs below.

## Grok Build: xai-org/plugin-marketplace

The catalog is an index of pinned commits. Third-party plugins are listed by URL, sourced from the vendor's official org.

1. Fork https://github.com/xai-org/plugin-marketplace and branch from `main`.
2. Add this entry to the `plugins` array in `.grok-plugin/marketplace.json`, replacing `sha` with the output of `git ls-remote https://github.com/pipe-0/pipe0-plugin.git HEAD`:

   ```json
   {
     "name": "pipe0",
     "description": "Search for people and companies, enrich them with work emails, phone numbers, and LinkedIn data, and operate pipe0 Sheets, schedules, and reports through the hosted pipe0 MCP server.",
     "category": "development",
     "source": {
       "source": "url",
       "url": "https://github.com/pipe-0/pipe0-plugin.git",
       "sha": "<full 40-character commit sha>"
     },
     "homepage": "https://pipe0.com/docs/sdks/mcp",
     "keywords": ["pipe0", "pipe0 mcp", "pipe0 sheets", "pipe0 enrichment", "pipe0 search"],
     "domains": ["pipe0.com", "api.pipe0.com"]
   }
   ```

3. Regenerate and validate, exactly as CI does:

   ```bash
   python3 scripts/generate-plugin-index.py
   python3 scripts/validate-catalog.py
   python3 scripts/generate-plugin-index.py --check
   ```

4. Open a pull request using the repository's template. It asks for the network endpoints the plugin calls and the credentials it needs; copy the table from `README.md`. Code-owner review is required.

For a new release, bump `sha` in the existing entry and regenerate the index. Do not open a second entry.

Review guidelines to keep in mind: keywords and domains must be brand-scoped (no generic terms like `api` or `database`), the source must be the official org, the license must be stated, and no hooks, scripts, or shell-executing MCP servers should be added without a clear need.

## Grok Bot and Cursor: Cursor Marketplace

1. Make sure the repository is public and `main` passes `node scripts/validate.mjs`.
2. Submit the repository URL at https://cursor.com/marketplace/publish.
3. Every plugin and every update is reviewed manually by Cursor. Keep the manifest, logo path, and README current; the reviewers check that `name` is unique and kebab-case, the description is clear, the logo is committed with a relative path, and all paths are relative.

Once listed, the plugin appears in Grok Bot's **Plugins** sidebar and in Cursor's marketplace. Team admins control availability through their Cursor team marketplace.

## Testing before submission

- Grok Build: `grok plugin install ./ --trust`, then run `/pipe0` or ask for a work email. Confirm the OAuth browser flow completes and `grok inspect` lists the `pipe0` MCP server.
- Cursor: copy the repository to `~/.cursor/plugins/local/pipe0/`, open **Settings > MCP**, and complete the login prompt next to `pipe0`.
- Any other client: add the server from `mcp.json` and complete the OAuth flow.
