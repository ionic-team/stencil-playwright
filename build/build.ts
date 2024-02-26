import * as esbuild from 'esbuild';

async function build() {
  const baseOptions: esbuild.BuildOptions = {
    bundle: true,
    entryPoints: ['src/index.ts'],
    external: ['@playwright/test', '@stencil/core', 'fs', 'path'],
    platform: 'node',
    sourcemap: 'linked',
    target: 'node16',
  };

  await Promise.all([
    esbuild.build({
      ...baseOptions,
      outfile: 'dist/index.js',
      format: 'esm',
    }),
    esbuild.build({
      ...baseOptions,
      outfile: 'dist/index.cjs',
      format: 'cjs',
    }),
  ]);
}

build();
