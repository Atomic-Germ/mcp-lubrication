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
    "proposed_solution": "Optional: initial suggestion for improvement"
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

### 2. List Friction Points

**GET** `/friction`

- **Description:** Retrieve a list of all logged friction points, with optional filters.
- **Query Parameters:**
  - `status` (open, resolved, all)
  - `tag`
  - `agent`
- **Response:**
  ```json
  [
    {
      "id": "unique-friction-id",
      "summary": "...",
      "status": "open",
      "created_at": "...",
      "tags": ["..."]
    }
    // ...
  ]
  ```

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
    "status": "open",
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
    "resolved_by": "Agent/model identifier"
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
- **Response:** (Array of friction point histories, as above.)

---

## Data Model

- **FrictionPoint**
  - `id`: string
  - `summary`: string
  - `details`: string
  - `location`: string
  - `context`: string
  - `agent`: string
  - `tags`: string[]
  - `proposed_solution`: string
  - `status`: "open" | "resolved"
  - `history`: array of actions (created, updated, resolved)

---

## Notes

- All endpoints are designed for programmatic use by agentic models.
- The API should support bulk operations for efficiency.
- Machine-readable output is prioritized for downstream automation and reporting.
