import { loadConfig } from '@stencil/core/compiler';
import { OutputTargetWww } from '@stencil/core/internal';
import { existsSync } from 'fs';
import { globSync } from 'glob';
import { relative } from 'path';

const DEFAULT_NAMESPACE = 'app';
const DEFAULT_BASE_URL = 'http://localhost:3333';
const DEFAULT_WEB_SERVER_URL = `${DEFAULT_BASE_URL}/ping`;
const DEFAULT_STENCIL_ENTRY_PATH = `./build/${DEFAULT_NAMESPACE}`;

/**
 * For internal use only.
 *
 * Loads and validates the project's Stencil config.
 *
 * @returns The processed Stencil config meta data.
 */
export const loadConfigMeta = async () => {
  let baseURL = DEFAULT_BASE_URL;
  let webServerUrl = DEFAULT_WEB_SERVER_URL;
  let stencilNamespace = DEFAULT_NAMESPACE;
  let stencilEntryPath = DEFAULT_STENCIL_ENTRY_PATH;

  // Stencil config and Playwright config should always live next to each other, so we
  // can assume the Stencil config lives in the same directory as the current process' execution context.
  //
  // From what I can tell, Playwright's CLI does not allow you to pass a path to a config, so no concerns with being in the right
  // directory when executing tests.
  //
  // Use a glob pattern so we can account for both .ts and .js config files
  const stencilConfigPath = globSync(`${process.cwd()}/stencil.config.{ts,js}`)?.[0];

  // Only load the Stencil config if the user has created one
  if (stencilConfigPath && existsSync(stencilConfigPath)) {
    const { devServer, fsNamespace, outputTargets } = (await loadConfig({ configPath: stencilConfigPath })).config;

    // Grab the WWW output target. If one doesn't exist, we'll throw a warning and roll
    // with the default value for the entry path.
    const wwwTarget = outputTargets.find((o) => o.type === 'www') as OutputTargetWww;
    if (wwwTarget) {
      // Get path from dev-server root to www
      let relativePath = relative(devServer.root!, wwwTarget.dir!);
      relativePath = relativePath === '' ? '.' : relativePath;
      if (!relativePath.startsWith('.')) {
        relativePath = `./${relativePath}`;
      }

      stencilEntryPath = `${relativePath}/build/${fsNamespace}`;
    } else {
      console.warn(
        'No "www" output target found in the Stencil config. Using default entry path. Tests using `setContent` may fail to execute.',
      );
    }

    baseURL = `${devServer.protocol}://${devServer.address}:${devServer.port}`;
    webServerUrl = `${baseURL}${devServer.pingRoute ?? ''}`;
    stencilNamespace = fsNamespace;
  }

  return {
    baseURL,
    webServerUrl,
    stencilNamespace,
    stencilEntryPath,
  };
};
