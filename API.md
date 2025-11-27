# mcp-lubrication API (Wishlist)

This document describes a proposed API for the `mcp-lubrication` tool, based on its intended use as described in the README. This API is designed for agentic models to log, track, and resolve sources of friction in codebases and developer tools.

---

## Overview

The `mcp-lubrication` API is machine-oriented, supporting structured, programmatic interaction for logging, querying, and resolving developer friction points.

This server is intended to be used primarily by agentic models (for example, via an `mcp` tool integration) but it also exposes HTTP/REST endpoints for tooling and SDKs. The design emphasizes automation, auditability, and integration with CI systems, issue trackers, and other MCP servers.

---

## Endpoints

### 1. Log a Friction Point

**POST** `/friction`

- **Description:** Record a new friction point encountered by an agent.
- **Request Body:**
  ```json
  {
    "summary": "Short description of the friction",
    "details": "Detailed explanation of the issue or confusion",
    "location": "File, module, or workflow step where friction occurred",
    "context": "Relevant code, logs, or examples",
    "agent": "Agent/model identifier",
    "tags": ["confusing-api", "workflow", "performance"],
    "proposed_solution": "Optional: initial suggestion for improvement",
    "priority": "low|medium|high"  // Optional: priority level
  }
  ```
  - **Notes/Guidance:**
    - `summary` should be a concise statement of the core friction (max 240 chars).
    - `details` may include stack traces, log excerpts, or precise steps to reproduce.
    - `location` can include `repo:branch:path:line` or human friendly descriptions.
    - `agent` should indicate the caller model or tool, e.g. `agent:gpt-4o-mini:2025-11-27`.
- **Response:**
  ```json
  {
    "id": "unique-friction-id",
    "status": "logged"
  }
  ```

---

### 1.5. Bulk Log Friction Points

**POST** `/friction/bulk`

- **Description:** Record multiple friction points in a single request for efficiency during batch processing.
- **Request Body:**
  ```json
  [
    {
      "summary": "...",
      "details": "...",
      "location": "...",
      "context": "...",
      "agent": "...",
      "tags": ["..."],
      "proposed_solution": "...",
      "priority": "medium"
    },
    // ... more friction points
  ]
  ```
- **Response:**
  ```json
  {
    "logged": ["id1", "id2", ...],
    "errors": []  // Any validation errors
  }
  ```

  - **Notes/Guidance:** Bulk logging should be validated server-side; partial successes should return explicit error entries describing which items failed validation.

---

### 2. List Friction Points

**GET** `/friction`

- **Description:** Retrieve a list of all logged friction points, with optional filters.
- **Query Parameters:**
  - `status` (open, resolved, all)
  - `tag`
  - `agent`
  - `priority` (low, medium, high)
  - `location` (partial match)
  - `created_after` (ISO date)
  - `created_before` (ISO date)
  - `repo` (repo/name)
  - `branch`
  - `limit` (max results, default 50)
  - `offset` (for pagination)
- **Response:**
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
    // ...
  ]
  ```

---

### 2.5. Search Friction Points

**GET** `/friction/search`

- **Description:** Advanced search with full-text query across summary, details, and context.
- **Query Parameters:**
  - `q` (search query)
  - Other filters as in List
- **Response:** Same as List.

---

### 3. Get Friction Point Details

**GET** `/friction/{id}`

- **Description:** Retrieve full details for a specific friction point.
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
      {
        "timestamp": "...",
        "action": "created|updated|resolved",
        "agent": "...",
        "notes": "..."
      }
    ]
  }
  ```

    - **Related:** Requests for full details may optionally accept a query parameter `include=attachments,metadata` to include potentially large or sensitive fields.

---

### 4. Update or Resolve a Friction Point

**PATCH** `/friction/{id}`

- **Description:** Update details, propose a solution, or mark a friction point as resolved.
- **Request Body:**
  ```json
  {
    "status": "resolved",
    "resolution_notes": "Description of the fix or improvement",
    "resolved_by": "Agent/model identifier",
    "tags": ["updated-tag"],  // Optional: update tags
    "priority": "low"  // Optional: change priority
  }
  ```
- **Response:**
  ```json
  {
    "id": "unique-friction-id",
    "status": "resolved"
  }
  ```

  - **Metadata handling:** The `PATCH` endpoint accepts `metadata` to store contextual data used by agents and analytics. For example, `metadata` may include `repo`, `commit`, `pipeline_id` and `run_id`.

---

### 5. Query Friction History

**GET** `/history`

- **Description:** Retrieve a machine-readable log of all friction points and their resolution history.
- **Query Parameters:** Same filters as List.
- **Response:** (Array of friction point histories, as above.)

---

### 6. Get Analytics

**GET** `/analytics`

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
    }
  }
  ```

  - **Optional insights:** Analytics can optionally return a `trend` object for each tag or agent, e.g. an upward or downward trend and the top contributed causes.

---

### 7. Get Suggestions

**GET** `/suggestions`

- **Description:** Provide AI-generated suggestions for resolving open friction points or preventing similar issues, based on historical data.
- **Query Parameters:**
  - `id` (specific friction point for tailored suggestions)
- **Response:**
  ```json
  [
    {
      "friction_id": "id",
      "suggestion": "Refactor the API to use clearer naming conventions.",
      "confidence": 0.85
    }
  ]
  ```

  - **Execution:** Suggestions may optionally include a `proposal_patch` or `code_diff` field; `apply_suggestion` requests will be gated and require authorization (see Authentication below).

---

### 8. Export Friction Data

**GET** `/export`

- **Description:** Export friction points in various formats for external analysis.
- **Query Parameters:**
  - `format` (json, csv)
  - Other filters as in List.
- **Response:** File download or JSON array.

---

### 9. Webhooks

**POST** `/webhooks/friction-logged`

- **Description:** Notify external systems when a new friction point is logged (configurable endpoint).
- **Request Body:** Friction point data.

**POST** `/webhooks/friction-resolved`

- **Description:** Notify when a friction point is resolved.

  - **Notes/Guidance:** Webhooks should support HMAC signing (e.g., using a per-webhook secret) and can be configured with an event filter expression. Retries should be attempted with exponential backoff on 5xx responses.

---

## Authentication

- Agents should authenticate using API keys or tokens to prevent abuse.
- **POST** `/auth/token` to obtain a token for an agent.

  - **RBAC & Scopes:** Consider scopes such as `friction:read`, `friction:write`, `friction:admin`, and `friction:apply` (for automated code modifications). Tokens issued to agents should be scoped and optionally limited by origin.
  - **Rate limiting & quotas:** Each agent should have a token-based quota with headers like `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` returned in API responses.

---

## Data Model

- **FrictionPoint**
  - `id`: string (UUID)
  - `summary`: string
  - `details`: string
  - `location`: string
  - `context`: string
  - `agent`: string
  - `tags`: string[]
  - `proposed_solution`: string
  - `priority`: "low" | "medium" | "high"
  - `status`: "open" | "resolved"
  - `created_at`: ISO date string
  - `updated_at`: ISO date string
  - `resolved_at`: ISO date string (optional)
  - `history`: array of actions (created, updated, resolved)

  - **Extended fields** (optional but recommended):
    - `severity`: "critical" | "major" | "minor" — a classifier of how blocking the friction is.
    - `impact`: text describing the user or model impact.
    - `occurrence_count`: integer — how many times this friction was recorded for aggregation.
    - `first_seen`: ISO date string
    - `last_seen`: ISO date string
    - `metadata`: object — free-form key/value for agent or CI context (commit, branch, pipeline ID, environment).
    - `references`: array of objects linking to external issue tracker items, PRs, or docs: `{ "type": "github", "url": "https://...", "id": 123 }`.
    - `attachments`: array of objects `{ "filename": string, "url": string, "content_type": string }`.
    - `confidence_score`: number [0-1] — confidence that this is a valid friction for consideration.
    - `is_actionable`: boolean — whether an automated agent or human should treat it as actionable.
    - `assigned_to`: string — user or agent responsible for remediation.

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

- Common error responses should follow a structured pattern:

```json
{
  "error": "BadRequest",
  "message": "Missing or invalid field 'summary'",
  "fields": ["summary"]
}
```

- Recommended status codes:
  - 200: OK
  - 201: Created
  - 400: Bad request/validation errors
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not found
  - 429: Rate limit
  - 500: Internal error

---

## MCP Tool and STDIO Integration

Aside from HTTP, `mcp-lubrication` should be usable via the MCP framework (stdio JSON) for in-tool agentic models. Design notes:
- Offer a `tool` and `tool.capabilities` descriptor for the MCP system.
- Include an `invoke` API like `tool.invoke('friction.log', payload)` and `tool.invoke('friction.search', params)` for synchronous operations.
- For async or streaming workflows, support event streams and subscription patterns via `tool.listen` (or similar) for `friction.*` events.

---

## CI/CD and Auto-Logging

Agents and CI systems should be able to call `POST /ci/log` or `/friction` directly with context passed from the CI system (`job, pipeline, logs, artifacts`). The server will augment the entry with `pipeline_id`, `job_id`, `workflow_url`, and attachments as appropriate.

---

## Deployment & Configuration Notes

The `README.md` includes a simple example `mcp.json` for VSCode. Additional configuration guidance:
- Environment variables for deployment: `MCP_PORT`, `MCP_BASE_URL`, `DB_CONN`, `JWT_SECRET`, `WEBHOOK_SECRET`.
- Provide `--config` or `--mcp-config` flags for the CLI.
- Minimal requirement: database (sqlite, postgres), option for local/disk storage for attachments.

---

## Example OpenAPI & SDK

Provide a companion `openapi.yaml` or `openapi.json` and a minimal client SDK (node, python) so integrators can easily interact with the system.

---

## Backwards Compatibility & API Versioning

- Use a versioned API prefix, e.g. `/v1/friction`.
- Support `Accept` header negotiation and deprecation notices with clear timelines.

---

## Final Notes

This API is primarily aimed for programmatic usage by agent models and CI systems, but it exposes human-friendly CLI and SDK options to support developers integrating the system. The above changes expand the core resource model, add practical operational concerns (rate limiting, audit, webhooks), and suggest integrations that will reduce developer friction across the lifecycle of issues.

---

## Notes

- All endpoints are designed for programmatic use by agentic models.
- The API should support bulk operations for efficiency.
- Machine-readable output is prioritized for downstream automation and reporting.
- Prioritize scalability for high-volume logging in large codebases.
- Ensure GDPR/CCPA compliance for any personal data in context fields.
