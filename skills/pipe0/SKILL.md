---
name: pipe0
description: What pipe0 is and how to work with it through the pipe0 MCP server. Use whenever pipe0 is mentioned, or when the user wants to find people or companies, enrich records with work emails, phone numbers, or LinkedIn data, build a lead list, run a waterfall enrichment, or automate a recurring data workflow in a pipe0 Sheet.
---

# pipe0

pipe0 is a data enrichment platform. Two primitives cover everything:

- **Searches** create records from filters ("Heads of Marketing at robotics companies in Europe").
- **Pipes** add fields to records you already have: `work_email`, `mobile`, `linkedin_url`, company data, AI qualification, and more. Waterfall pipes try several providers in order and bill only the one that returns a result.

Pipes chain. Each pipe reads the output of the pipes before it, so `person:name:join@1` followed by `person:workemail:waterfall@1` finds an email from a first and last name. Pipe, search, and effect IDs are versioned (`@1`, `@2`) and immutable. Never invent an ID: the list and schema tools are the source of truth.

Work is stateless (a one-shot run returns records) or stateful (a **pipe0 Sheet** holds up to 2M rows, with column history, point-in-time recovery, schedules, and reports). Records move freely between the two.

## The MCP server does the work

This plugin connects the hosted pipe0 MCP server at `https://api.pipe0.com/v1/mcp`. It exposes the whole product as tools and ships its own operating instructions, guides, and playbooks. Read those before drafting anything non-trivial:

- `get_guide` returns a guide per topic: `workflows`, `enrichment`, `search`, `effects`, `reports`, `model`.
- `list_playbooks` returns validated recipes for common goals. Check it first for any multi-step goal.
- `list_pipes`, `list_searches`, `list_effects` shortlist candidates; `get_pipe_schema`, `get_search_schema`, `get_effect_schema` give the exact payload.

## Working loop

1. **Discover.** Playbook first, then the faceted list tools, then the schema tool for the exact shape.
2. **Draft.** Send partial payloads: only the IDs and the fields you set. Catalog defaults merge in. Use `autocomplete_field` for filter values you cannot name.
3. **Validate.** Every run tool validates inline and names the error before anything is billed. `validate_effects` previews a sheet chain without committing it.
4. **Commit.** Tools that spend credits or mutate data ask for confirmation on the first call. Show the user what will run and what it costs, then retry with `confirm: true` once they agree. Never auto-confirm.
5. **Verify.** Read real outcomes with `verify_outcome`, `get_sheet_rows`, or `check_run_status`. Cell statuses separate "no data exists" (`no_result`) from "wrong wiring" (`skipped`) from "something broke" (`failed`). React to the right one.

When candidate paths differ on precision, coverage, or cost, present two or three options with one recommendation and let the user choose.

## Quick decisions

- **A handful of records, answer now:** `run_pipes_oneshot` or `run_search_oneshot`.
- **A list the user will keep, refresh, or report on:** `create_sheet`, then `run_effects` with `search:run@1`, `pipe:add@1`, `rows:enrich@1`. Add `create_schedule` for "every Monday".
- **Trying a workflow shape:** run in the `sandbox` environment. Providers are mocked and nothing bills. Switch to `production` when the columns are right.
- **Provider needs the user's own key:** pick a connection from `list_connections`. Secrets never go through chat.

## Authentication and cost

- Sign-in is OAuth in the browser on first use. No API key, client ID, or secret is configured anywhere. If a client config sends an `Authorization` header with a pipe0 API key, remove it and reconnect; API keys only work for the REST API.
- Production runs bill credits. New organizations start with 20 free credits. Sandbox runs are free.

## Links

- MCP server setup for every client: https://pipe0.com/docs/sdks/mcp
- What agents can do with sheets: https://pipe0.com/docs/sheets/ai-agents
- Pipe catalog: https://pipe0.com/docs/pipe-catalog
- Search catalog: https://pipe0.com/docs/search-catalog
- Billing: https://pipe0.com/docs/billing
