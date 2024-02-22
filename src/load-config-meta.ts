import { loadConfig } from '@stencil/core/compiler';
import { OutputTargetWww } from '@stencil/core/internal';
import { existsSync } from 'fs';
import { relative } from 'path';

export const loadConfigMeta = async () => {
  // Stencil config and Playwright config should always live next to each other, so we
  // can assume the Stencil config lives in the same directory as the current process' execution context
  //
  // From what I can tell, Playwright's CLI does not allow you to pass a path to a config, so no concerns with being in the right
  // directory when executing tests
  //
  // TODO: need to account for non-ts config paths as well
  const stencilConfigPath = `${process.cwd()}/stencil.config.ts`;

  let baseURL = 'http://localhost:3333';
  let webServerUrl = `${baseURL}/ping`;
  let stencilNamespace = 'App';

  // TODO: what is this default in a basic project?
  let stencilEntryPath = '';

  // Only load the Stencil config if the user has created one
  if (existsSync(stencilConfigPath)) {
    const { devServer, namespace, outputTargets } = (await loadConfig({ configPath: stencilConfigPath })).config;

    // Find where the www output is
    //
    // TODO: handle if this isn't found (error boom boom)
    // TODO: cli build targets?
    const { dir } = outputTargets.find((o) => o.type === 'www') as OutputTargetWww;

    // Get path from dev-server root to www
    const relativePath = relative(devServer.root!, dir!);

    baseURL = `${devServer.protocol}://${devServer.address}:${devServer.port}`;
    webServerUrl = `${baseURL}${devServer.pingRoute}`;

    stencilNamespace = namespace;
    stencilEntryPath = `./${relativePath}/build/${namespace.toLowerCase()}`;
  }

  return {
    baseURL,
    webServerUrl,
    stencilNamespace,
    stencilEntryPath,
  };
};
