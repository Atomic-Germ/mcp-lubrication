import axios, { AxiosInstance } from 'axios';

export interface ClientOptions {
  baseUrl?: string;
  token?: string;
}

export class LubricationClient {
  private client: AxiosInstance;

  constructor(opts: ClientOptions = {}) {
    this.client = axios.create({ baseURL: opts.baseUrl || 'http://localhost:3000' });
    if (opts.token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${opts.token}`;
    }
  }

  withToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return this;
  }

  async obtainToken(apiKey: string) {
    const resp = await this.client
      .post('/v1/auth/token', { api_key: apiKey })
      .catch(e => e.response || e);
    return resp;
  }

  async logFriction(payload: Record<string, unknown>) {
    const resp = await this.client.post('/v1/friction-points', payload).catch(e => e.response || e);
    return resp;
  }

  async listFriction(params: { limit?: number; offset?: number } = { limit: 50, offset: 0 }) {
    const resp = await this.client
      .get('/v1/friction-points', { params })
      .catch(e => e.response || e);
    return resp;
  }

  async getFriction(id: string) {
    const resp = await this.client.get(`/v1/friction-points/${id}`).catch(e => e.response || e);
    return resp;
  }
}

export default LubricationClient;
