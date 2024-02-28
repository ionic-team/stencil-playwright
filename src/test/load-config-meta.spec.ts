import fs from 'fs';

import { loadConfigMeta } from '../load-config-meta';

const stencilConfig = {
  fsNamespace: 'mock-namespace',
  devServer: {
    protocol: 'http',
    address: 'localhost',
    port: 4444,
    pingRoute: '/status',
    root: '/mock-path',
  },
  outputTargets: [
    {
      type: 'www',
      dir: '/mock-path/www',
    },
  ],
};

jest.mock('glob', () => ({
  globSync: () => ['/mock-path/stencil.config.ts'],
}));
jest.mock('@stencil/core/compiler', () => ({
  loadConfig: () => ({
    config: stencilConfig,
  }),
}));

describe('loadConfigMeta', () => {
  it('should return defaults if a config does not exist', async () => {
    const configMeta = await loadConfigMeta();

    expect(configMeta).toEqual({
      baseURL: 'http://localhost:3333',
      stencilEntryPath: './build/app',
      stencilNamespace: 'app',
      webServerUrl: 'http://localhost:3333/ping',
    });
  });

  it('should use the validated Stencil config values', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValueOnce(true);

    const configMeta = await loadConfigMeta();

    expect(configMeta).toEqual({
      baseURL: 'http://localhost:4444',
      stencilEntryPath: './www/build/mock-namespace',
      stencilNamespace: 'mock-namespace',
      webServerUrl: 'http://localhost:4444/status',
    });
  });

  it('should log a warning if no "www" output target is found', async () => {
    stencilConfig.outputTargets = [];
    jest.spyOn(fs, 'existsSync').mockReturnValueOnce(true);
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const configMeta = await loadConfigMeta();

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'No "www" output target found in the Stencil config. Using default entry path. Tests using `setContent` may fail to execute.',
    );
    expect(configMeta).toEqual({
      baseURL: 'http://localhost:4444',
      stencilEntryPath: './build/mock-namespace',
      stencilNamespace: 'mock-namespace',
      webServerUrl: 'http://localhost:4444/status',
    });
  });
});
