import { describe, expect, it, vi } from 'vitest';
import type { OpenClawPluginApi } from 'openclaw/plugin-sdk/core';
import plugin from '../index';
import { getResolvedConfig } from '../src/core/lark-client';

describe('OpenClaw SDK integration', () => {
  it('imports the complete plugin and registers tenant tools against the installed SDK', () => {
    const names = new Set<string>();
    const config = { channels: { feishu: { enabled: true, appId: 'cli_test', appSecret: 'test-secret', dmPolicy: 'allowlist', allowFrom: ['ou_test'] } } };
    const registerChannel = vi.fn();
    plugin.register({
      config,
      runtime: { config: { current: () => config } },
      logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
      registerChannel,
      registerTool: (tool: unknown, options?: { names?: string[]; name?: string }) => {
        const declared = options?.names ?? (options?.name ? [options.name] : typeof tool === 'object' && tool != null && 'name' in tool ? [String(tool.name)] : []);
        for (const name of declared) names.add(name);
      },
      on: vi.fn(), registerCli: vi.fn(), registerCommand: vi.fn(),
    } as unknown as OpenClawPluginApi);
    expect(registerChannel).toHaveBeenCalledWith(expect.objectContaining({ plugin: expect.objectContaining({ id: 'feishu' }) }));
    for (const name of ['feishu_im_bot_get_messages', 'feishu_im_bot_get_thread_messages', 'feishu_im_bot_search_messages']) {
      expect(names.has(name)).toBe(true);
    }
    expect(getResolvedConfig({})).toEqual(config);
  });
});
