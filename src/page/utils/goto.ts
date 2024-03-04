/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
import type { Page } from '@playwright/test';

import type { E2EPageOptions } from '../../playwright-declarations';

/**
 * This is an extended version of Playwright's `page.goto` method. In addition to performing
 * the normal `page.goto` work, this code also automatically waits for the Stencil components
 * to be hydrated before proceeding with the test.
 */
export const goto = async (page: Page, url: string, originalFn: typeof page.goto, options?: E2EPageOptions) => {
  const result = await Promise.all([
    page.waitForFunction(() => (window as any).testAppLoaded === true, {
      timeout: 4750,
    }),
    originalFn(url.split('?')[0], options),
  ]);

  return result[1];
};
