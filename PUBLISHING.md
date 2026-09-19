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
2. Add this entry to the `plugins` array in `.grok-plugin/marketplace.json`, replacing `sha` with the output of `git ls-remote https://github.com/pipe-0/grokbot-plugin.git HEAD`:

   ```json
   {
     "name": "pipe0",
     "description": "Prospect leads, enrich contacts with work emails and phone numbers, and build GTM automations in pipe0 Sheets through the hosted pipe0 MCP server.",
     "category": "development",
     "source": {
       "source": "url",
       "url": "https://github.com/pipe-0/grokbot-plugin.git",
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

Neither marketplace tracker has a Grok Bot testing path. Grok Bot only installs from the Cursor Marketplace (or a Cursor team marketplace), so test the plugin files in Cursor and Grok Build, which read the same manifests.

Known tracker issues that shape this repo:

- cursor/plugin-template#4: a Cursor engineer confirmed `~/.cursor/plugins/local/<name>/` is the supported local path. cursor/plugins#35: symlinks there do not load; copy the folder.
- cursor/plugins#252: when `mcp.json` and `.mcp.json` both exist, a marketplace clone may load `.mcp.json`. This repo keeps both files identical and pins `mcpServers` in the Cursor manifest, and `scripts/validate.mjs` fails if they diverge.
- xai-org/plugin-marketplace#166 and #123: Grok Build's marketplace scanner currently drops single-plugin root sources (`"source": "./"`), so `grok plugin marketplace add pipe-0/grokbot-plugin` lists nothing until that is fixed. Direct install (`grok plugin install pipe-0/grokbot-plugin --trust`) is unaffected, and the official catalog entry uses a URL source, which works.

- Grok Build: `grok plugin install ./ --trust`, then run `/pipe0` or ask for a work email. Confirm the OAuth browser flow completes and `grok inspect` lists the `pipe0` MCP server.
- Cursor (verified 2026-09-19): `rsync -a --delete --exclude .git ./ ~/.cursor/plugins/local/pipe0/`, reload the window, open **Customize > Plugins > pipe0**, click the MCP row, and use **Authenticate** on the plugin environment row to finish the browser sign-in. If the row then shows a green dot with 0 tools, toggle the server off and on once; Cursor staff describe this as a snapshot race for plugin MCP servers (forum thread 162637). Expect 34 tools.
- Any other client: add the server from `mcp.json` and complete the OAuth flow.
