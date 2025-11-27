import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import LubricationClient from '../src/sdk/index';
import { startServer } from '../src/index';

let server: import('http').Server;
const PORT = 3010;
const BASE = `http://localhost:${PORT}`;

beforeAll(async () => {
  server = await startServer(PORT);
});

afterAll(() => {
  if (server && typeof server.close === 'function') server.close();
});

describe('Design-time scaffold responses (SDK)', () => {
  const client = new LubricationClient({ baseUrl: BASE });

  it('returns NotImplemented for POST /v1/auth/token', async () => {
    const resp = await client.obtainToken('fake-key');
    expect(resp.status).toBe(501);
    expect(resp.data).toHaveProperty('error_code', 'NotImplemented');
    expect(resp.data.guidance).toBeDefined();
  });

  it('returns NotImplemented for POST /v1/friction-points and echoes fields', async () => {
    const payload = { summary: 's', details: 'd', location: 'repo:main:src:1', agent: 'agent:1' };
    const resp = await client.logFriction(payload);
    expect(resp.status).toBe(501);
    expect(resp.data).toHaveProperty('error_code', 'NotImplemented');
    expect(resp.data.received).toMatchObject({
      summary: 's',
      location: 'repo:main:src:1',
      agent: 'agent:1',
    });
  });

  it('returns empty list for GET /v1/friction-points', async () => {
    const resp = await client.listFriction({ limit: 5, offset: 0 });
    expect(resp.status).toBe(200);
    expect(Array.isArray(resp.data.data)).toBe(true);
    expect(resp.data.meta).toMatchObject({ limit: 5, offset: 0 });
  });

  it('returns NotFound for GET /v1/friction-points/:id', async () => {
    const resp = await client.getFriction('missing-id');
    expect(resp.status).toBe(404);
    expect(resp.data).toHaveProperty('error_code', 'NotFound');
  });
});
