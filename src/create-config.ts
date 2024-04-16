import { PlaywrightTestConfig } from '@playwright/test';
import merge from 'deepmerge';

import { loadConfigMeta } from './load-config-meta';
import { ProcessConstants } from './process-constants';

// Recursively apply the `Partial` type to all nested object types in the provided generic type
type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Helper function to easily create a Playwright config for Stencil projects. This function will
 * automatically load the Stencil config meta to set default values for the Playwright config respecting the
 * Stencil dev server configuration, and set the Stencil namespace and entry path as environment variables for use
 * in the Playwright tests.
 *
 * @param overrides Values to override in the default config. Any Playwright config option can be overridden.
 * @returns A {@link PlaywrightTestConfig} object
 */
export const createConfig = async (
  overrides: DeepPartial<PlaywrightTestConfig> = {},
): Promise<PlaywrightTestConfig> => {
  const { webServerUrl, baseURL, stencilEntryPath, stencilNamespace } = await loadConfigMeta();

  // Set the Stencil namespace and entry path as environment variables so we can use them when constructing
  // the HTML `head` content in the `setContent` function. This is just an easy way for us to maintain some context
  // about the current Stencil project's configuration.
  process.env[ProcessConstants.STENCIL_NAMESPACE] = stencilNamespace;
  process.env[ProcessConstants.STENCIL_ENTRY_PATH] = stencilEntryPath;

  return merge<DeepPartial<PlaywrightTestConfig>>(
    {
      testMatch: '*.e2e.ts',
      use: {
        baseURL,
      },
      webServer: {
        command: 'npm start -- --no-open',
        url: webServerUrl,
        reuseExistingServer: !!!process.env.CI,
        // Max time to wait for dev server to start before aborting, defaults to 60000 (60 seconds)
        timeout: undefined,
      },
    },
    overrides,
  ) as PlaywrightTestConfig;
};
