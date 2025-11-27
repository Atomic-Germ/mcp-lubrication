# mcp-lubrication API (Wishlist)

This document describes a proposed API for the `mcp-lubrication` tool, based on its intended use as described in the README. This API is designed for agentic models to log, track, and resolve sources of friction in codebases and developer tools.

---

## Overview

The `mcp-lubrication` API is machine-oriented, supporting structured, programmatic interaction for logging, querying, and resolving developer friction points.

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

---

## Authentication

- Agents should authenticate using API keys or tokens to prevent abuse.
- **POST** `/auth/token` to obtain a token for an agent.

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

---

## Future Wishes

- **Integration with MCP Framework:** Expose these as MCP tools instead of REST endpoints for seamless agent interaction.
- **Automated Logging:** Hooks into CI/CD pipelines or IDEs to auto-log friction based on error patterns.
- **Machine Learning Insights:** Use ML to predict potential friction points or recommend resolutions.
- **Collaboration Features:** Allow multiple agents to comment or vote on friction points.
- **Visualization Dashboard:** A web UI for humans to view friction analytics (though primarily machine-oriented).
- **Versioning:** Track friction points across codebase versions or tool updates.

---

## Notes

- All endpoints are designed for programmatic use by agentic models.
- The API should support bulk operations for efficiency.
- Machine-readable output is prioritized for downstream automation and reporting.
- Prioritize scalability for high-volume logging in large codebases.
- Ensure GDPR/CCPA compliance for any personal data in context fields.
