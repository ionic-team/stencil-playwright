import { PlaywrightTestConfig } from '@playwright/test';

import { loadConfigMeta } from './load-config-meta';
import { ProcessConstants } from './process-constants';

export type CreateStencilPlaywrightConfigOptions = Partial<PlaywrightTestConfig> & {
  webServerCommand?: string;
  webServerTimeout?: number;
};

/**
 * Helper function to easily create a Playwright config for Stencil projects. This function will
 * automatically load the Stencil config meta to set default values for the Playwright config respecting the
 * Stencil dev server configuration, and set the Stencil namespace and entry path as environment variables for use
 * in the Playwright tests.
 *
 * @param overrides Values to override in the default config. Any Playwright config option can be overridden.
 * @returns A {@link PlaywrightTestConfig} object
 */
export const createStencilPlaywrightConfig = async (
  overrides?: CreateStencilPlaywrightConfigOptions,
): Promise<PlaywrightTestConfig> => {
  const { webServerUrl, baseURL, stencilEntryPath, stencilNamespace } = await loadConfigMeta();

  process.env[ProcessConstants.STENCIL_NAMESPACE] = stencilNamespace;
  process.env[ProcessConstants.STENCIL_ENTRY_PATH] = stencilEntryPath;

  // Strip off overrides that are not top-level playwright options
  const playwrightOverrides = JSON.parse(JSON.stringify(overrides ?? {}));
  delete playwrightOverrides.webServerCommand;
  delete playwrightOverrides.webServerTimeout;

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
    ...playwrightOverrides,
  };
};
