# @stencil/playwright

> [!NOTE]
> The Stencil Playwright adapter is currently an experimental package. Breaking changes may be introduced at any time.
>
> The Stencil Playwright adapter is designed to only work with **version 4.13.0 and higher** of Stencil!

Stencil Playwright is a testing adapter package that allows developers to easily use the [Playwright testing framework](https://playwright.dev/docs/intro)
in their Stencil project.

For full documentation, please see the [Playwright testing docs on the official Stencil site](https://stenciljs.com/docs/next/testing/playwright/overview).

## Getting Started

1. Install the necessary packages using your preferred package manager:

   ```bash
   npm i @stencil/playwright @playwright/test --save-dev
   ```

1. Install Playwright's browser binaries:

   ```bash
   npx playwright install
   ```

1. Create a `playwright.config.ts` file. The `@stencil/playwright` package offers a utility function to quickly create a default configuration that should
   work for most Stencil projects:

   ```ts
   // playwright.config.ts

   import { expect } from '@playwright/test';
   import { matchers, createConfig } from '@stencil/playwright';

   expect.extend(matchers);

   export default createConfig();
   ```

1. At this point, any tests can be executed using `npx playwright test` (or by updating the project's test command in the `package.json`). By default, Playwright's test matcher
   is configured to run all tests matching the pattern `*.e2e.ts`. This can be changed by overriding the default matcher using the
   [`createConfig()` function](#createconfigoverrides-createstencilplaywrightconfigoptions-promiseplaywrighttestconfig):

   ```ts
   // playwright.config.ts

   import { expect } from '@playwright/test';
   import { matchers, createConfig } from '@stencil/playwright';

   expect.extend(matchers);

   export default createConfig({
     // Change which test files Playwright will execute
     testMatch: '*.spec.ts',
     // Any other Playwright config option can also be overridden
   });
   ```

## Testing Patterns

### `page.goto()`

The `goto()` method allows tests to load a pre-defined HTML template. This pattern is great if a test file has many tests to execute that all use the same HTML code
or if additional `script` or `style` tags need to be included in the HTML. However, with this pattern, developers are responsible for defining the necessary `script`
tags pointing to the Stencil entry code (so all web components are correctly loaded and registered).

```html
<!-- my-component.e2e.html -->

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf8" />

    <!-- Replace with the path to your entrypoint -->
    <script src="./build/test-app.esm.js" type="module"></script>
    <script src="./build/test-app.js" nomodule></script>
  </head>
  <body>
    <my-component first="Stencil"></my-component>
  </body>
</html>
```

```ts
// my-component.e2e.ts

import { expect } from '@playwright/test';
import { test } from '@stencil/playwright';

test.describe('my-component', () => {
  test('should render the correct name', async ({ page }) => {
    // The path here is the path to the www output relative to the dev server root directory
    await page.goto('/my-component/my-component.e2e.html');

    // Rest of test
  });
});
```

### `page.setContent()`

The `setContent()` method allows tests to define their own HTML code on a test-by-test basis. This pattern is helpful if the HTML for a test is small, or to
avoid affecting other tests is using the `page.goto()` pattern and modifying a shared HTML template file. With this pattern, the `script` tags pointing to Stencil
entry code will be automatically injected into the generated HTML.

```ts
// my-component.e2e.ts

import { expect } from '@playwright/test';
import { test } from '@stencil/playwright';

test.describe('my-component', () => {
  test('should render the correct name', async ({ page }) => {
    await page.setContent('<my-component first="Stencil"></my-component>');

    // Rest of test
  });
});
```

## API

### `createConfig(overrides?: CreateStencilPlaywrightConfigOptions): Promise<PlaywrightTestConfig>`

Returns a [Playwright test configuration](https://playwright.dev/docs/test-configuration#introduction).

`overrides`, as the name implies, will overwrite the default configuration value(s) if supplied. These values can include any valid Playwright config option as well
as some options to override specific values in the config options related to the Stencil integration:

- `webServerCommand`: This can be specified to change the command that will run to start the Stencil dev server. Defaults to `npm start -- --no-open`.
- `webServerTimeout`: This can be specified to change the amount of time Playwright will wait for the dev server to start. Defaults to 60 seconds.

```ts
// playwright.config.ts

import { expect } from '@playwright/test';
import { matchers, createConfig } from '@stencil/playwright';

expect.extend(matchers);

export default createConfig({
  // Change which test files Playwright will execute
  testMatch: '*.spec.ts',

  // Only wait max 30 seconds for server to start
  webServerTimeout: 30000,
});
```

### `test`

`test` designates which tests will be executed by Playwright. See the [Playwright API documentation](https://playwright.dev/docs/api/class-test#test-call) regarding usage.

This package modifies the [`page` fixture](#page) and offers a [`skip` utility](#skip) as discussed below.

#### `page`

The page fixture is a class that allows interacting with the current test's browser tab. In addition to the [default Playwright Page API](https://playwright.dev/docs/api/class-page),
Stencil extends the class with a few additional methods:

- `waitForChanges()`: Waits for Stencil components to re-hydrate before continuing.
- `spyOnEvent()`: Creates a new EventSpy and listens on the window for an event to emit.

#### `skip`

The `skip` utility allows developers to skip tests for certain browsers or [component modes](https://stenciljs.com/docs/styling#style-modes):

```ts
test('my-test', ({ page, skip }) => {
    // Skip tests for certain browsers
    skip.browser('firefox', 'This behavior is not available on Firefox');

    // Skip tests for certain modes
    skip.mode('md', 'This behavior is not available in Material Design');

    ...
})
```
