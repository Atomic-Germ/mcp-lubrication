# mcp-lubrication

![status: design](https://img.shields.io/badge/status-design-orange) ![license-MIT](https://img.shields.io/badge/license-MIT-blue)

This repository is currently a design-phase specification for an MCP server and API to help agentic models and automation log, track, and resolve sources of friction in developer workflows.

Important: absolutely nothing in this repository is implemented yet — the project is in the design/spec phase. The files in this repo (including `API.md` and `QUICKSTART.md`) describe planned behavior, data models, and examples for implementation.

If you expected a working server, see `QUICKSTART.md` and `API.md` for planned usage and examples, then consider contributing an implementation.

**Quick facts**

- Status: Design / specification only (no runtime yet)
- Tests: `pnpm test` is the standard test command for this repo
- Package manager: `pnpm`

**Where to look next**

- Read the design and examples in `API.md` and `QUICKSTART.md`.
- If you'd like to implement features, follow `CONTRIBUTING.md` (see `CONTRIBUTING.md`).

**Examples and development**
The `QUICKSTART.md` contains example requests and local-run snippets (illustrative). Example cURL and SDK snippets shown there are for guidance — they describe the intended API shape.

Run example (design-time):

```bash
# Install dependencies (development)
pnpm install

# Build step (if/when implemented)
pnpm build

# Run tests
pnpm test
```

**Docker (illustrative)**
When an implementation exists, the intended Docker use will follow this pattern (example):

```bash
# Build image (when Dockerfile implements the server)
docker build -t mcp-lubrication:dev .

# Run with sane defaults for development
docker run -e MCP_PORT=3000 -e JWT_SECRET=devsecret -p 3000:3000 mcp-lubrication:dev
```

**License**

- This design is published under the repository `LICENSE` (see `LICENSE` in this repo).

If you want me to scaffold a minimal, runnable implementation (HTTP server + a few endpoints + tests), I can start that next — tell me your preferred database (sqlite/postgres) and I'll scaffold it.
