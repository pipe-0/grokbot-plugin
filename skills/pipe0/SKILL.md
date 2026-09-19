---
name: pipe0
description: Read this before using pipe0, and again on any pipe0 connection error. pipe0 is a hosted MCP server for finding people and companies, enriching contacts with work emails and phone numbers, and running GTM automations in pipe0 Sheets. Sign-in is OAuth in the browser, and the server sends its own operating instructions once connected. If pipe0 is connected but has no tools, or reports needs-auth or 401, that is a sign-in step, not a paywall or an API problem.
---

# pipe0

The hosted pipe0 MCP server does the work. Once connected, it sends its own instructions, guides, and playbooks. Follow those. Do not use this file as a substitute for them.

## Connected but no tools, needs-auth, or 401

The user has not finished signing in. Stop and say:

> pipe0 needs a sign-in. Open Customize, find pipe0 under MCP, and click Authenticate. Sign in with your pipe0 account in the browser, then ask me again.

Do not retry in a loop. Do not fall back to the pipe0 REST API or the docs site to do the task by hand.

## No API keys or tokens

Sign-in is OAuth only. Do not ask for a pipe0 API key, bearer token, or Authorization header, and do not accept one if offered. If a client config already sends one, it will fail with 401; tell the user to remove it and reconnect.
