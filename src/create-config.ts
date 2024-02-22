import { PlaywrightTestConfig } from '@playwright/test';

import { loadConfigMeta } from './load-config-meta.js';

export const createStencilPlaywrightConfig = async (
  overrides?: Partial<PlaywrightTestConfig>,
): Promise<PlaywrightTestConfig> => {
  const { webServerUrl, baseURL, stencilEntryPath, stencilNamespace } = await loadConfigMeta();

  process.env.STENCIL_NAMESPACE = stencilNamespace;
  process.env.STENCIL_ENTRY_PATH = stencilEntryPath;

  return {
    testMatch: '*.e2e.ts',
    use: {
      baseURL,
    },
    webServer: {
      // TODO: this could be something projects want to override often
      command: 'npm start -- --no-open',
      url: webServerUrl,
      reuseExistingServer: !process.env.CI,
      // TODO: another field users might want to configure.
      // Max time to wait for dev server to start before aborting, defaults to 60000 (60 seconds)
      // timeout: 1000,
    },
    ...(overrides ?? {}),
  };
};
