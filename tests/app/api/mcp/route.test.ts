import { describe, it, expect, vi } from 'vitest';

const registered = vi.hoisted(() => [] as { name: string; config: Record<string, unknown> }[]);

vi.mock('mcp-handler', () => ({
  createMcpHandler: (setup: (server: unknown) => void) => {
    setup({
      registerTool: (name: string, config: Record<string, unknown>) => {
        registered.push({ name, config });
      },
    });
    return () => new Response();
  },
  withMcpAuth: (handler: unknown) => handler,
}));
vi.mock('@/lib/mcp/auth', () => ({ verifyToken: vi.fn(), createRequestScopedClient: vi.fn() }));
vi.mock('@/lib/mcp/wineData', () => ({ getCellarWines: vi.fn(), getRatedWines: vi.fn() }));

describe('MCP tools', () => {
  it('marks every tool read-only so Porto lets read-only callers use it', async () => {
    await import('@/app/api/mcp/route');

    expect(registered.map((tool) => tool.name)).toEqual(['list_wines', 'get_rated_wines']);
    for (const tool of registered) {
      expect(tool.config.annotations).toEqual({ readOnlyHint: true });
    }
  });
});
