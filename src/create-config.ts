import { PlaywrightTestConfig } from '@playwright/test';

import { loadConfigMeta } from './load-config-meta.js';
import { ProcessConstants } from './process-constants';

export type CreateStencilPlaywrightConfigOptions = Partial<PlaywrightTestConfig> & {
  webServerCommand?: string;
  webServerTimeout?: number;
};

export const createStencilPlaywrightConfig = async (
  overrides?: CreateStencilPlaywrightConfigOptions,
): Promise<PlaywrightTestConfig> => {
  const { webServerUrl, baseURL, stencilEntryPath, stencilNamespace } = await loadConfigMeta();

  process.env[ProcessConstants.STENCIL_NAMESPACE] = stencilNamespace;
  process.env[ProcessConstants.STENCIL_ENTRY_PATH] = stencilEntryPath;

  return {
    testMatch: '*.e2e.ts',
    use: {
      baseURL,
    },
    webServer: {
      command: overrides?.webServerCommand ?? 'npm start -- --no-open',
      url: webServerUrl,
      reuseExistingServer: !process.env.CI,
      // Max time to wait for dev server to start before aborting, defaults to 60000 (60 seconds)
      timeout: overrides?.webServerTimeout ?? undefined,
    },
    ...(overrides ?? {}),
  };
};
