import express from 'express';

const app = express();
app.use(express.json());

const PORT = process.env.MCP_PORT ? Number(process.env.MCP_PORT) : 3000;

function notImplementedResponse(feature: string, hints?: string[]) {
  return {
    error_code: 'NotImplemented',
    message: `${feature} is not implemented in this design-time scaffold.`,
    guidance: {
      openapi: '/openapi.yaml',
      suggested_action: `Implement the ${feature} endpoint according to the OpenAPI specification and persist data to a backing store.`,
      hints: hints || [
        'Add persistence (sqlite/postgres) and configuration via DB_CONN',
        'Respect scoped tokens and rate limits as documented in API.md',
      ],
    },
    reminder: true,
  };
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', implemented: false, message: 'Design-time scaffold: implement service to proceed.' });
});

app.post('/v1/auth/token', (req, res) => {
  // Design-time placeholder: return machine-friendly instruction
  res.status(501).json(notImplementedResponse('POST /v1/auth/token', [
    'Return a scoped token (JWT or opaque) with scopes like friction:read, friction:write',
    "Example response: { token: '<jwt>', scope: 'friction:write', expires_in: 3600 }",
  ]));
});

app.post('/v1/friction-points', (req, res) => {
  // Accept request body but remind implementer to persist and validate
  const body = req.body || {};
  res.status(501).json({
    ...notImplementedResponse('POST /v1/friction-points', [
      'Validate required fields: summary, details, location, agent',
      'Persist to DB and return a generated id and status',
    ]),
    received: {
      summary: body.summary || null,
      location: body.location || null,
      agent: body.agent || null,
    },
  });
});

app.get('/v1/friction-points', (req, res) => {
  // Respond with a machine-friendly placeholder list
  const limit = Number(req.query.limit ?? 50);
  const offset = Number(req.query.offset ?? 0);
  res.status(200).json({
    data: [],
    meta: { total: 0, limit, offset },
    note: 'No data: this is a design-time scaffold. Implement storage and listing logic to return actual friction points.',
  });
});

app.get('/v1/friction-points/:id', (req, res) => {
  res.status(404).json({
    error_code: 'NotFound',
    message: `Friction point ${req.params.id} not found (design-time scaffold).`,
    guidance: { openapi: '/openapi.yaml', suggested_action: 'Implement GET /v1/friction-points/{id} to retrieve persisted records' },
  });
});

// Generic not-found
app.use((req, res) => {
  res.status(404).json({ error_code: 'NotFound', message: 'Endpoint not found in scaffold.' });
});

app.listen(PORT, () => {
  // Machine-friendly startup message to guide implementers
  console.log(JSON.stringify({
    message: 'mcp-lubrication design scaffold running',
    port: PORT,
    notice: 'Endpoints return machine-friendly reminders to implement features. See /openapi.yaml and API.md.',
  }));
});
