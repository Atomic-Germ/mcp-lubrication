# Quickstart (design-time examples)

This quickstart demonstrates the intended API usage with simple curl examples. The repository is currently a design/spec; these examples show the expected request/response shape.

Prerequisites

- A running implementation of `mcp-lubrication` (not included in this repo). Replace `MCP_URL` and `TOKEN` below with your server URL and token.

Example: log a friction point

```bash
export MCP_URL=http://localhost:3000
export TOKEN=REPLACE_WITH_YOUR_TOKEN

curl -s -X POST "$MCP_URL/v1/friction-points" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Confusing parameter order in API",
    "details": "Parameters `x` and `y` are documented in the wrong order.",
    "location": "repo:main:src/api.ts:123",
    "agent": "agent:example:2025-11-27",
    "tags": ["docs", "api"]
  }'

# Expected (201) response shape
# { "id": "uuid", "status": "logged" }
```

Example: list friction points (paginated)

```bash
curl -s "$MCP_URL/v1/friction-points?limit=10&offset=0" \
  -H "Authorization: Bearer $TOKEN"

# Response shape (example):
# { "data": [{"id":"...","summary":"...","status":"open"}], "meta": {"total": 42, "limit": 10, "offset": 0 }}
```

Webhook verification (bash example)

When configuring webhooks, the server signs outgoing payloads using HMAC SHA256 and the header `X-Hub-Signature-256: sha256=<hex>`.

Example verification snippet using `openssl` (bash):

```bash
WEBHOOK_SECRET=your_webhook_secret
BODY='{"id":"...","summary":"..."}'
SIG="sha256=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | sed 's/^.*= //')"
echo "Signature header: $SIG"

# Compare to incoming header value (example)
# if [ "$SIG" = "$RECEIVED_HEADER" ]; then echo "valid"; else echo "invalid"; fi
```

Notes

- The auth/token endpoint shape is intentionally minimal in the design; implementing servers should support `Authorization: Bearer <token>` for protected endpoints.
- For local development, use a short-lived token and do not use production secrets in examples above.

# MCP Lubrication Server - Quick Start Guide

Get structured Friction Reduction workflows running in under 5 minutes!

## Prerequisites

- Node.js 18+
- `pnpm` (preferred) or `npm`
- An MCP-compatible client that supports stdio (e.g., Claude Desktop)
- A test framework for integration testing (Vitest, Jest, or Mocha) — optional

## Install & Build

Install dependencies and build the server:

```bash
pnpm install
pnpm build
```

During development you can use:

```bash
pnpm run dev
```

## Run as an MCP stdio server

Run the built entry (`dist/index.js`) via Node so an MCP client can connect over stdio.

Example MCP configuration (VSCode / Claude-style):

```json
{
  "servers": {
    "mcp-lubrication": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/mcp-lubrication/dist/index.js"],
      "env": {}
    }
  },
  "inputs": []
}
```

Notes:
- Ensure `args` points to the built `dist/index.js` entry.
- MCP clients communicate with the server over stdio.

## API & Authentication

- Base path: `/v1/`
- All endpoints require an API key or token (scoped tokens like `friction:write`, `friction:apply`).
- Content-type: `application/json`
- Timestamps are ISO 8601 (UTC)

See `API.md` for the full API reference (endpoints, request/response shapes, error codes).

## Quick API Examples

- Log a friction point (cURL):

```bash
curl -X POST "http://localhost:PORT/v1/friction-points" \
  -H "Authorization: Bearer $MCP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Confusing API contract",
    "details": "Parameters `x` and `y` appear swapped in docs",
    "location": "repo:main:src/index.ts:42",
    "agent": "agent:gpt-4o-mini:2025-11-27",
    "tags": ["docs","api"],
    "priority": "medium"
  }'
```

- Bulk log: `POST /v1/friction-points/bulk` with an array of friction objects.
- Search: `GET /v1/friction-points/search?q=timeou‍t&limit=10` (supports filters from `API.md`).
- Apply suggestion: `POST /v1/friction-points/{id}/apply-suggestion` (requires `friction:apply`).

## Node SDK snippet

```js
import { LubricationClient } from 'mcp-lubrication-sdk';

const client = new LubricationClient({ token: process.env.MCP_TOKEN, baseUrl: 'http://localhost:PORT' });

const resp = await client.log({
  summary: 'CI job failing due to flaky DB',
  details: 'Intermittent connection timeouts during e2e jobs',
  location: 'repo-name:ci:build#45',
  agent: 'agent:gpt-4-mini'
});
console.log('Friction id', resp.id);
```

## CLI Examples (planned)

Example CLI usage (the CLI is planned; these are illustrative):

```bash
mcp-lubrication log \
  --summary "Confusing API contract" \
  --details "Parameters x and y are swapped" \
  --repo my/repo --branch main \
  --token $MCP_TOKEN

mcp-lubrication search --q "timeouts" --tag performance --limit 10

mcp-lubrication resolve --id <id> --notes "Fixed retry logic" --resolved-by agent:gpt-4o-mini
```

Note: Adjust commands once a CLI is available or installed.

## Webhooks & Attachments

- Webhooks are HMAC-signed (`X-Hub-Signature-256`) for events like `friction.logged` and `friction.resolved`.
- Configure retries, backoff, and filters on your webhook subscriptions.
- Attachments can be uploaded via presigned URLs or `POST /v1/friction-points/{id}/attachments`.

## CI Integration

- CI systems and agents should POST to `POST /v1/friction-points` with metadata (`pipeline_id`, `job_id`, `workflow_url`) and attachments for traceability.

## Security & Rate Limiting

- Responses include rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
- Error responses use a consistent JSON format (see `API.md`).

## Useful Commands

Install dependencies:
```bash
pnpm install
```
Build:
```bash
pnpm build
```
Quick local run (example):
```bash
MCP_TOKEN=devtoken node dist/index.js
# or use a package script if provided
```

## Next Steps

- This file mirrors the conventions in `README.md` and `API.md`. If you'd like, I can: 
  - shorten or expand CLI examples,
  - add environment variable details, or
  - include a short example of expected server output.

Need help? Check our [documentation index](./DOCUMENTATION_INDEX.md) or open an issue: https://github.com/Atomic-Germ/mcp-lubrication/issues
