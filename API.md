
# mcp-lubrication API (v1)

This document describes the API for the `mcp-lubrication` tool, designed for agentic models and developer tools to log, track, and resolve sources of friction in codebases and workflows. The API is machine-oriented, with a focus on automation, auditability, and integration with CI, issue trackers, and other MCP servers.

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
    "errors": [
      { "index": 1, "error": "Missing required field 'summary'" }
    ]
  }
  ```

- **Notes:**
  - Partial successes are allowed; errors are reported per item.

---


### List Friction Points

**GET** `/v1/friction-points`

- **Description:** Retrieve a list of all logged friction points, with optional filters.
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
  - `limit` (integer, default 50)
  - `offset` (integer, for pagination)

- **Response:** Array of friction point summaries.
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
    "history": [
      { "timestamp": "...", "action": "created", "agent": "...", "notes": "..." }
    ]
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
      {"tag": "workflow", "count": 30},
      {"tag": "performance", "count": 20}
    ],
    "friction_by_agent": [
      {"agent": "model-x", "count": 50}
    ],
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

const client = new LubricationClient({ token: process.env.MCP_TOKEN, baseUrl: 'https://mcp-lubrication.example' });

const resp = await client.log({
  summary: 'CI job failing due to flaky database connections',
  details: 'Intermittent connection timeouts during e2e jobs',
  location: 'repo-name:ci:build#45',
  agent: 'agent:gpt-4-mini'
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
- Status codes:
  - 200: OK
  - 201: Created
  - 400: Bad request/validation errors
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not found
  - 429: Rate limit exceeded
  - 500: Internal server error

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

- See `README.md` for an example `mcp.json` for VSCode.
- Environment variables: `MCP_PORT`, `MCP_BASE_URL`, `DB_CONN`, `JWT_SECRET`, `WEBHOOK_SECRET`.
- CLI supports `--config` or `--mcp-config` flags.
- Minimal requirement: database (sqlite, postgres); local/disk storage for attachments is supported.

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
