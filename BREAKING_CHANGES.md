# Breaking Changes

This is a list of all breaking changes introduced in the Stencil Playwright adapter. This document is broken into two sections:

1. Breaking changes introduced in experimental versions (i.e. pre-1.0)
2. Breaking changes introduced in major releases

## Experimental Releases

### v0.2.0

- `createStencilPlaywrightConfig` renamed to `createConfig`
- `createConfig` uses a deep merge to combine default config values with overrides
