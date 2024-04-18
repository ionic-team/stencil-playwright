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

const findUpMock = jest.fn();
jest.mock('find-up', () => ({
  findUp: () => findUpMock(),
}));
jest.mock('@stencil/core/compiler', () => ({
  loadConfig: () => ({
    config: stencilConfig,
  }),
}));

describe('loadConfigMeta', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return defaults if a config does not exist', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    findUpMock.mockResolvedValueOnce('/mock-path/stencil.config.ts');

    const configMeta = await loadConfigMeta();

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Unable to find your project's Stencil configuration file, starting from '/mock-path/stencil.config.ts'. Falling back to defaults.",
    );
    expect(configMeta).toEqual({
      baseURL: 'http://localhost:3333',
      stencilEntryPath: './build/app',
      stencilNamespace: 'app',
      webServerUrl: 'http://localhost:3333/ping',
    });
  });

  it('should use the validated Stencil config values', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValueOnce(true);
    findUpMock.mockResolvedValueOnce('/mock-path/stencil.config.ts');

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
    findUpMock.mockResolvedValueOnce('/mock-path/stencil.config.ts');
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const configMeta = await loadConfigMeta();

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      `No "www" output target found in the Stencil config. Using default entry path: "./build/mock-namespace". Tests using 'setContent' may fail to execute.`,
    );
    expect(configMeta).toEqual({
      baseURL: 'http://localhost:4444',
      stencilEntryPath: './build/mock-namespace',
      stencilNamespace: 'mock-namespace',
      webServerUrl: 'http://localhost:4444/status',
    });
  });

  it('should log a warning if no Stencil config path was found', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const configMeta = await loadConfigMeta();

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      `No Stencil config file was found matching the glob 'stencil.config.{ts,js}' in the current or parent directories. Falling back to defaults.`,
    );
    expect(configMeta).toEqual({
      baseURL: 'http://localhost:3333',
      stencilEntryPath: './build/app',
      stencilNamespace: 'app',
      webServerUrl: 'http://localhost:3333/ping',
    });
  });
});
