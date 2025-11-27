## Deployment & Configuration Notes

- See `README.md` for an example `mcp.json` for VSCode and example MCP integration.
- CLI supports `--config` or `--mcp-config` flags.
- Minimal requirement: database (sqlite, postgres); local/disk storage for attachments is supported.

## Signing & Secrets

- Webhook payloads must be signed with a secret. The server uses `X-Hub-Signature-256` (HMAC SHA256) for outbound webhook signatures.

`X-Hub-Signature-256: sha256=abcdef123456...`

To verify (example, bash/openssl):

```bash
# Incoming payload body in $BODY and incoming header in $RECEIVED
WEBHOOK_SECRET=your_webhook_secret
SIG_CALC="sha256=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | sed 's/^.*= //')"
if [ "$SIG_CALC" = "$RECEIVED" ]; then
  echo "valid"
else
  echo "invalid"
fi
```

Or in Node.js (example):

```js
import crypto from 'crypto';

function verify(body, secret, received) {
  const h = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return `sha256=${h}` === received;
}
```

# mcp-lubrication API (v1)

This document describes the API for the `mcp-lubrication` tool, designed for agentic models and developer tools to log, track, and resolve sources of friction in codebases and workflows. The API is machine-oriented, with a focus on automation, auditability, and integration with CI, issue trackers, and other MCP servers.

---

## General Conventions

- All endpoints are under `/v1/`.
- All requests and responses use `application/json` unless otherwise specified.
- All timestamps are ISO 8601 strings (UTC).
- All endpoints require authentication unless noted.
- Pagination is supported via `limit` and `offset` query parameters.
- Filtering is supported via query parameters as described per endpoint.
- All error responses use the structure described in the Errors section.

---

---

## Data Model

All endpoints use a consistent data model for friction points. Field names use `snake_case` throughout. Required fields are marked **(required)**; all others are optional unless otherwise noted.

### FrictionPoint

- `id` (string): Unique identifier (UUID)
- `summary` (string, **required**): Short description (max 240 chars)
- `details` (string, **required**): Detailed explanation, may include logs or steps to reproduce
- `location` (string, **required**): File/module/workflow step (e.g., `repo:branch:path:line`)
- `context` (string): Relevant code, logs, or examples
- `agent` (string, **required**): Agent/model identifier (e.g., `agent:gpt-4o-mini:2025-11-27`)
- `tags` (string[]): Tags for categorization
- `proposed_solution` (string): Initial suggestion for improvement
- `priority` ("low" | "medium" | "high"): Priority level
- `status` ("open" | "resolved"): Current status
- `created_at` (ISO date string): Creation timestamp
- `updated_at` (ISO date string): Last update timestamp
- `resolved_at` (ISO date string): Resolution timestamp
- `history` (array): List of actions (created, updated, resolved)

#### Extended Fields

- `severity` ("critical" | "major" | "minor"): How blocking the friction is
- `impact` (string): User or model impact
- `occurrence_count` (integer): Aggregated count
- `first_seen` (ISO date string)
- `last_seen` (ISO date string)
- `metadata` (object): Free-form key/value for agent or CI context (commit, branch, pipeline ID, environment)
- `references` (array): External links (e.g., issues, PRs)
- `attachments` (array): Attachments (filename, url, content_type)
- `confidence_score` (number [0-1]): Confidence this is a valid friction
- `is_actionable` (boolean): Whether remediation is actionable
- `assigned_to` (string): Responsible user or agent

---

## Authentication

All endpoints require authentication via API key or token. Obtain a token via:

**POST** `/v1/auth/token`

Tokens are scoped (e.g., `friction:read`, `friction:write`, `friction:admin`, `friction:apply`). Rate limits are enforced and returned in headers (`X-RateLimit-Limit`, etc.).

---

## Endpoints

### Log a Friction Point

**POST** `/v1/friction-points`

- **Description:** Record a new friction point encountered by an agent or tool.
- **Request Body:**
  - `summary` (string, required)
  - `details` (string, required)
  - `location` (string, required)
  - `context` (string, optional)
  - `agent` (string, required)
  - `tags` (string[], optional)
  - `proposed_solution` (string, optional)
  - `priority` ("low" | "medium" | "high", optional)

  Example:

  ```json
  {
    "summary": "Short description of the friction",
    "details": "Detailed explanation of the issue or confusion",
    "location": "repo:main:src/index.ts:42",
    "context": "Relevant code, logs, or examples",
    "agent": "agent:gpt-4o-mini:2025-11-27",
    "tags": ["confusing-api", "workflow"],
    "proposed_solution": "Clarify parameter order in docs",
    "priority": "medium"
  }
  ```

- **Response:**

  ```json
  {
    "id": "unique-friction-id",
    "status": "logged"
  }
  ```

- **Notes:**
  - `location` should follow `repo:branch:path:line` for traceability.
  - All required fields must be present; optional fields may be omitted.

---

### Bulk Log Friction Points

**POST** `/v1/friction-points/bulk`

- **Description:** Record multiple friction points in a single request.
- **Request Body:** Array of friction point objects (see above).

  Example:

  ```json
  [
    { "summary": "...", "details": "...", "location": "...", "agent": "..." },
    { "summary": "...", "details": "...", "location": "...", "agent": "..." }
  ]
  ```

- **Response:**

  ```json
  {
    "logged": ["id1", "id2"],
    "errors": [{ "index": 1, "error": "Missing required field 'summary'" }]
  }
  ```

- **Notes:**
  - Partial successes are allowed; errors are reported per item.

---

### List Friction Points

**GET** `/v1/friction-points`

- **Description:** Retrieve a list of all logged friction points, with optional filters and pagination.
- **Query Parameters:**
  - `status` ("open", "resolved", "all")
  - `tag` (string)
  - `agent` (string)
  - `priority` ("low", "medium", "high")
  - `location` (partial match, string)
  - `created_after` (ISO date)
  - `created_before` (ISO date)
  - `repo` (string)
  - `branch` (string)
  - `limit` (integer, default 50, max 500)
  - `offset` (integer, for pagination)

- **Response:**
  - Array of friction point summaries.
  - Pagination metadata is included in response headers: `X-Total-Count`, `X-Limit`, `X-Offset`.
  ```json
  [
    {
      "id": "unique-friction-id",
      "summary": "...",
      "status": "open",
      "created_at": "...",
      "tags": ["..."],
      "priority": "high"
    }
  ]
  ```

### Comment on a Friction Point

**POST** `/v1/friction-points/{id}/comments`

- **Description:** Add a comment to a friction point for discussion or clarification.
- **Request Body:**
  - `comment` (string, required)
  - `agent` (string, required)

- **Response:**
  ```json
  {
    "id": "comment-id",
    "created_at": "..."
  }
  ```

---

### Assign a Friction Point

**PUT** `/v1/friction-points/{id}/assign`

- **Description:** Assign a friction point to a user or agent for remediation.
- **Request Body:**
  - `assigned_to` (string, required)
  - `agent` (string, required)

- **Response:**
  ```json
  {
    "id": "unique-friction-id",
    "assigned_to": "user-or-agent-id"
  }
  ```

---

### Push Friction Point to Issue Tracker

**POST** `/v1/friction-points/{id}/push-issue`

- **Description:** Create an issue or PR in a configured external tracker and link the resulting ID.
- **Request Body:**
  - `tracker_type` (string, required, e.g., "github", "jira")
  - `agent` (string, required)
  - `notes` (string, optional)

- **Response:**
  ```json
  {
    "reference": { "type": "github", "url": "https://...", "id": 123 }
  }
  ```

---

### Apply Suggestion to Friction Point

**POST** `/v1/friction-points/{id}/apply-suggestion`

- **Description:** Apply a provided or AI-generated patch to resolve a friction point. Requires `friction:apply` scope.
- **Request Body:**
  - `patch` (string, required)
  - `agent` (string, required)
  - `notes` (string, optional)

- **Response:**
  ```json
  {
    "status": "applied",
    "pr_url": "https://..." // if a PR was created
  }
  ```

---

### Audit Log

**GET** `/v1/audit`

- **Description:** Retrieve a tamper-evident, machine-readable audit log of all changes.
- **Query Parameters:**
  - All filters as in List
  - `action` (string, e.g., "created", "updated", "resolved", "assigned")
- **Response:** Array of audit log entries.

---

### ML Endpoints

**POST** `/v1/ml/train`

- **Description:** Submit training data for model improvement.
- **Request Body:**
  - `data` (object or array, required)
  - `agent` (string, required)

- **Response:**
  ```json
  { "status": "training_started" }
  ```

**GET** `/v1/ml/insights`

- **Description:** Fetch model-based predictions and suggested remediations.
- **Query Parameters:**
  - `friction_id` (string, optional)
- **Response:** Array of insights or predictions.

---

## Attachments

- Attachments can be uploaded via presigned URLs or multipart upload endpoints (e.g., `/v1/friction-points/{id}/attachments`).
- To retrieve, use the URLs provided in the `attachments` array of a friction point.
- Attachments metadata includes `filename`, `url`, and `content_type`.

---

## Rate Limiting

- Rate limits are enforced per token and returned in headers:
  - `X-RateLimit-Limit`: Maximum requests per period
  - `X-RateLimit-Remaining`: Requests left in current period
  - `X-RateLimit-Reset`: Time when the limit resets (epoch seconds)
- Exceeding the limit returns HTTP 429 with an error response.

---

## Internationalization / Localization

- Error messages and summaries are returned in English by default.
- Clients may request a different language via the `Accept-Language` header (future support).

---

## Changelog & Deprecation Policy

- Breaking changes are announced at least 90 days in advance.
- Deprecated endpoints return a `Deprecation` header and a warning in the response body.
- Changelog is published in the repository and via `/v1/changelog` (future endpoint).

---

---

### Search Friction Points

**GET** `/v1/friction-points/search`

- **Description:** Advanced search with full-text query across summary, details, and context.
- **Query Parameters:**
  - `q` (string, search query)
  - All filters as in List
- **Response:** Same as List.

---

### Get Friction Point Details

**GET** `/v1/friction-points/{id}`

- **Description:** Retrieve full details for a specific friction point.
- **Query Parameters:**
  - `include` (comma-separated: `attachments`, `metadata`)
- **Response:**
  ```json
  {
    "id": "unique-friction-id",
    "summary": "...",
    "details": "...",
    "location": "...",
    "context": "...",
    "agent": "...",
    "tags": ["..."],
    "proposed_solution": "...",
    "priority": "medium",
    "status": "open",
    "created_at": "...",
    "updated_at": "...",
    "history": [{ "timestamp": "...", "action": "created", "agent": "...", "notes": "..." }]
  }
  ```

---

### Update or Resolve a Friction Point

**PATCH** `/v1/friction-points/{id}`

- **Description:** Update details, propose a solution, or mark a friction point as resolved.
- **Request Body:**
  - `status` ("resolved", optional)
  - `resolution_notes` (string, optional)
  - `resolved_by` (string, optional)
  - `tags` (string[], optional)
  - `priority` ("low" | "medium" | "high", optional)
  - `metadata` (object, optional)

  Example:

  ```json
  {
    "status": "resolved",
    "resolution_notes": "Description of the fix or improvement",
    "resolved_by": "agent:gpt-4o-mini:2025-11-27",
    "tags": ["updated-tag"],
    "priority": "low"
  }
  ```

- **Response:**
  ```json
  {
    "id": "unique-friction-id",
    "status": "resolved"
  }
  ```

---

### Query Friction History

**GET** `/v1/history`

- **Description:** Retrieve a machine-readable log of all friction points and their resolution history.
- **Query Parameters:** Same as List.
- **Response:** Array of friction point histories (see Data Model).

---

### Get Analytics

**GET** `/v1/analytics`

- **Description:** Retrieve statistics and insights on friction points for reporting and prioritization.
- **Query Parameters:**
  - `period` (e.g., "last-30-days", "all")
- **Response:**
  ```json
  {
    "total_friction_points": 150,
    "open_count": 45,
    "resolved_count": 105,
    "average_resolution_time": "5 days",
    "common_tags": [
      { "tag": "workflow", "count": 30 },
      { "tag": "performance", "count": 20 }
    ],
    "friction_by_agent": [{ "agent": "model-x", "count": 50 }],
    "priority_distribution": {
      "high": 10,
      "medium": 25,
      "low": 10
    },
    "trend": {
      "workflow": "upward",
      "performance": "downward"
    }
  }
  ```

---

### Get Suggestions

**GET** `/v1/suggestions`

- **Description:** Provide AI-generated suggestions for resolving open friction points or preventing similar issues, based on historical data.
- **Query Parameters:**
  - `id` (string, specific friction point)
- **Response:**
  ```json
  [
    {
      "friction_id": "id",
      "suggestion": "Refactor the API to use clearer naming conventions.",
      "confidence": 0.85,
      "proposal_patch": "...", // optional
      "code_diff": "..." // optional
    }
  ]
  ```

---

### Export Friction Data

**GET** `/v1/export`

- **Description:** Export friction points in various formats for external analysis.
- **Query Parameters:**
  - `format` ("json", "csv")
  - All filters as in List
- **Response:** File download or JSON array.

---

### Webhooks

**POST** `/v1/webhooks/friction-logged`

- **Description:** Notify external systems when a new friction point is logged.
- **Request Body:** Friction point data.

**POST** `/v1/webhooks/friction-resolved`

- **Description:** Notify when a friction point is resolved.

- **Notes:**
  - Webhooks support HMAC signing (e.g., `X-Hub-Signature`-style) with a per-webhook secret.
  - Event filter expressions and retries with exponential backoff are supported.

---

---

---

## Future Wishes

- **Integration with MCP Framework:** Expose these as MCP tools instead of REST endpoints for seamless agent interaction.
- **Automated Logging:** Hooks into CI/CD pipelines or IDEs to auto-log friction based on error patterns.
- **Machine Learning Insights:** Use ML to predict potential friction points or recommend resolutions.
- **Collaboration Features:** Allow multiple agents to comment or vote on friction points.
- **Visualization Dashboard:** A web UI for humans to view friction analytics (though primarily machine-oriented).
- **Versioning:** Track friction points across codebase versions or tool updates.

### Additional Wishes and Practical Enhancements

- **SDK/CLI:** Provide an SDK and CLI for common flows: logging friction, listing, searching, and pushing to external trackers. The `README.md` already demonstrates building and running the mcp server; this project should also expose a `mcp-lubrication` CLI (see below) and a small JavaScript/TS SDK.
- **Push-to-Issue:** Add a `POST /friction/{id}/push-issue` endpoint that will create an issue/PR in a configured tracker and link the resulting ID back into `references`.
- **Assign & Comment Endpoints:** Add `POST /friction/{id}/comment` and `PUT /friction/{id}/assign` endpoints to handle discussion and action assignments.
- **Auto-suggest PRs:** `POST /friction/{id}/apply-suggestion` that can generate a branch, PR, or code change proposal with a provided patch or with an AI-generated patch. This endpoint should be scoped and require `friction:apply` permissions.
- **CI/CD Integration:** Endpoints or configurators for hooking into CI (e.g., `POST /ci/log`) so that failed pipelines can automatically log friction with metadata that includes `pipeline_id`, `job_id`, and raw logs.
- **Audit & Compliance:** `GET /audit` with filters returns tamper-evident, machine-readable audit logs of all changes, with optional WORM-like storage.
- **OpenAPI Spec & Examples:** Provide an OpenAPI / Swagger spec for the API and an example server config for `mcp.json` that demonstrates MCP tool integration via stdout/stdin.
- **ML & Model Training:** `POST /ml/train` and `GET /ml/insights` endpoints to configure training data and fetch model-based predictions and suggested remediations.
- **Export & Integrations:** Hooks to sync friction points to third-party tools (Slack, Teams, Jira, GitHub) via a plugin or connector layer, with retry and backoff policy.

---

## SDK & CLI Examples

### JavaScript/TypeScript SDK snippet (example)

```js
import { LubricationClient } from 'mcp-lubrication-sdk'; // example name

const client = new LubricationClient({
  token: process.env.MCP_TOKEN,
  baseUrl: 'https://mcp-lubrication.example',
});

const resp = await client.log({
  summary: 'CI job failing due to flaky database connections',
  details: 'Intermittent connection timeouts during e2e jobs',
  location: 'repo-name:ci:build#45',
  agent: 'agent:gpt-4-mini',
});
console.log('Friction id', resp.id);
```

### CLI Examples

Basic commands that the server could support in a companion CLI (or in `mcp` tool integration):

```bash
# Log a friction:
mcp-lubrication log --summary "Confusing API contract" --details "Parameters `x` and `y` are swapped" --repo my/repo --branch main

# Search:
mcp-lubrication search --q "timeouts" --tag performance --limit 10

# Resolve:
mcp-lubrication resolve --id <id> --notes "Fixed by reorganizing retry behavior" --resolved-by agent:gpt-4o-mini
```

---

## Webhook & Security Enhancements

- **Signing & Secrets:** Webhook payloads must be signed with a secret. The server should include `X-Hub-Signature`-style HMAC signatures.
- **Event Filtering:** Webhooks support subscriptions by event type (`friction.logged`, `friction.resolved`, `friction.updated`, `friction.assigned`) and optional tag filters.
- **Retries:** Configure max retries, exponential backoff, and dead-letter queue (DLQ) for failed webhook deliveries.

---

## Errors & Response Codes

- All error responses use a consistent structure:
  ```json
  {
    "error_code": "BadRequest",
    "message": "Missing or invalid field 'summary'",
    "fields": ["summary"]
  }
  ```
- Common `error_code` values:
  - `BadRequest`
  - `Unauthorized`
  - `Forbidden`
  - `NotFound`
  - `RateLimitExceeded`
  - `InternalError`
  - `NotImplemented`
  - `Conflict`
- Status codes:
  - 200: OK
  - 201: Created
  - 204: No Content
  - 400: Bad request/validation errors
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not found
  - 409: Conflict
  - 410: Gone (for removed endpoints)
  - 429: Rate limit exceeded
  - 500: Internal server error

---

## Webhook Security Example

Webhook payloads are signed using HMAC SHA256 with a shared secret. Example header:

`X-Hub-Signature-256: sha256=abcdef123456...`

To verify:

1. Compute the HMAC SHA256 of the request body using your secret.
2. Compare the hex digest to the value in the header.

---

## Example Workflows

### Typical Friction Lifecycle

1. Log a friction point (`POST /v1/friction-points`)
2. Add a comment (`POST /v1/friction-points/{id}/comments`)
3. Assign to a user/agent (`PUT /v1/friction-points/{id}/assign`)
4. Push to issue tracker (`POST /v1/friction-points/{id}/push-issue`)
5. Resolve (`PATCH /v1/friction-points/{id}`)
6. Apply a suggestion (`POST /v1/friction-points/{id}/apply-suggestion`)
7. Review audit log (`GET /v1/audit`)

---

---

## MCP Tool and STDIO Integration

In addition to HTTP, `mcp-lubrication` should be usable via the MCP framework (stdio JSON) for agentic models and tools.

- Provide a `tool` and `tool.capabilities` descriptor for MCP.
- Support `tool.invoke('friction.log', payload)` and `tool.invoke('friction.search', params)` for synchronous operations.
- For async/streaming, support event streams and subscription patterns via `tool.listen('friction.*')`.

---

## CI/CD and Auto-Logging

Agents and CI systems can call `POST /v1/ci/log` or `/v1/friction-points` directly with context from the CI system (`job`, `pipeline`, `logs`, `artifacts`). The server will augment entries with `pipeline_id`, `job_id`, `workflow_url`, and attachments as appropriate.

---

## Deployment & Configuration Notes

- See `README.md` for an example `mcp.json` for VSCode and example MCP integration.
- Environment variables: `MCP_PORT`, `MCP_BASE_URL`, `DB_CONN`, `JWT_SECRET`, `WEBHOOK_SECRET`.
- CLI supports `--config` or `--mcp-config` flags.
- Minimal requirement: database (sqlite, postgres); local/disk storage for attachments is supported.

### Environment variables (recommended)

These are the environment variables the implementation should respect. Where possible, reasonable defaults are suggested for local development; production deployments should override with secure values.

- `MCP_PORT` (default: `3000`) — port the HTTP API listens on.
- `MCP_BASE_URL` (default: `http://localhost:3000`) — externally visible base URL.
- `DB_CONN` (default: `sqlite://./data/mcp.db`) — database connection string (sqlite for local/dev, postgres for production).
- `DB_POOL_SIZE` (default: `10`) — connection pool size for production DBs.
- `STORAGE_PROVIDER` (default: `local`) — `local` or `s3` (affects attachments handling).
- `JWT_SECRET` (no default; required) — HMAC secret for signing/validating tokens. Must be a secure random value in production.
- `WEBHOOK_SECRET` (no default; optional) — per-webhook secret used to sign outbound webhook payloads.
- `ADMIN_TOKEN` (optional) — short-lived admin token for bootstrap operations (avoid long-lived secrets).
- `RATE_LIMIT_WINDOW_MS` (default: `60000`) — sliding window for rate limiting in milliseconds.
- `RATE_LIMIT_MAX` (default: `100`) — default allowed requests per token per `RATE_LIMIT_WINDOW_MS`.
- `RATE_LIMIT_BURST` (default: `200`) — maximum burst capacity (allow short bursts above normal rate).
- `LOG_LEVEL` (default: `info`) — runtime logging level.

### Sane security & rate-limiting defaults

The API design assumes conservative defaults to protect deployments out-of-the-box. Implementations should use these defaults and allow operators to override via env vars or config.

- Authentication: require a token or API key on all non-public endpoints. Tokens should be scoped (`friction:read`, `friction:write`, `friction:apply`, `friction:admin`).
- JWT secret: `JWT_SECRET` must be set in production and rotated periodically. Reject unsigned or expired tokens.
- Webhook signing: sign webhook payloads with `WEBHOOK_SECRET` and include an `X-Hub-Signature-256` header.
- Rate limiting: default to `RATE_LIMIT_MAX=100` requests per `RATE_LIMIT_WINDOW_MS=60000` (100/minute) with `RATE_LIMIT_BURST=200` to allow short bursts. Return `Retry-After` and the `X-RateLimit-*` headers on 429 responses.
- Abuse mitigation: implement exponential backoff and temporary token suspension for repeated abuse; log and surface suspicious activity to audit logs.

### Docker (illustrative)

When a runnable image exists, the following pattern is recommended for local development:

```bash
docker build -t mcp-lubrication:dev .
docker run --rm -p 3000:3000 \
  -e MCP_PORT=3000 \
  -e JWT_SECRET=devsecret \
  -e DB_CONN=sqlite:///data/mcp.db \
  mcp-lubrication:dev
```

Production deployments should mount persistent storage for attachments and use a managed database (Postgres) and a secure secrets manager for `JWT_SECRET` and webhook secrets.

---

## Example OpenAPI & SDK

Provide a companion `openapi.yaml` or `openapi.json` and a minimal client SDK (Node.js, Python) for easy integration.

---

## Backwards Compatibility & API Versioning

- All endpoints use a versioned prefix, e.g., `/v1/friction-points`.
- Support `Accept` header negotiation and deprecation notices with clear timelines.

---

## Final Notes

This API is designed for programmatic use by agentic models, CI systems, and developer tools, with human-friendly CLI and SDK options. The design prioritizes clarity, consistency, automation, and scalability for high-volume, machine-driven workflows.

---

## Additional Notes

- All endpoints are programmatic and support bulk operations.
- Machine-readable output is prioritized for automation and reporting.
- Designed for scalability in large codebases.
- Ensure GDPR/CCPA compliance for any personal data in context fields.
