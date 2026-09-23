# TripArc QA Analyst Technical Assignment

This repository contains the exploratory testing notes, five high-value test cases, and Playwright TypeScript automation for the OrangeHRM public demo application.

The assignment response is organized into the required three parts in [docs/assignment-response.md](docs/assignment-response.md).

## Project status

All five designed test cases are automated: valid authentication, employee creation and retrieval, candidate creation, the candidate application stage, and the shortlist status transition. A setup project saves authenticated browser state for reuse by protected tests, and created records are removed in fixture teardown.

## Prerequisites

- Node.js 20 or newer
- npm

## Install

```bash
npm install
npx playwright install chromium
```

The suite runs against the public demo with its published credentials and needs
no configuration. To point it at different credentials, copy `.env.example` to
`.env` and edit it; the file is loaded from the repository root and is
Git-ignored. Variables already set in the environment take precedence.

## Run

```bash
npm test
```

Additional modes:

```bash
npm run test:headed
npm run test:ui
npm run test:debug
npm run typecheck
```

Run only the valid-login test:

```bash
npm run test:auth
```

## Approach decisions

### How the project is structured, and why

The layout separates the three things that change for different reasons, so a
product change touches one place rather than being scattered across the specs:

```text
docs/
  assignment-response.md  Exploratory notes, five designed test cases, findings
tests/
  pages/                  Page objects: how to interact with each screen
  setup/                  One-time authentication state creation
  specs/                  The five test cases: what is verified, read top to bottom
  support/                Shared fixtures and configuration
playwright.config.ts      Projects, reporting, and failure artifacts
```

- **Page objects** own the locators and the mechanics of a screen (filling the
  Add Employee form, selecting a vacancy, reading the application stage). When
  the product markup shifts, the fix is in one page object, not in every spec
  that used the element.
- **Specs** read as intent. Each is a short, linear sequence of business steps
  with the assertions inline, so what a case proves is legible without opening a
  page object.
- **`support/fixtures.ts`** holds cross-cutting concerns — most importantly the
  cleanup fixtures that delete the records a test created, in teardown rather
  than in the test body (more below).
- **Projects** in `playwright.config.ts` split the unauthenticated login case,
  the one-time auth setup, and the authenticated tests, so each runs with the
  right browser state and in the right order.

### Locator strategy, and why

The goal was stable, reliable locators that survive cosmetic markup changes and
read the way a user perceives the page. The application exposes **no dedicated QA
attributes** — a live DOM audit found no `data-testid`, `data-test`, `data-cy`,
`data-qa`, or `data-automation-id` on the login, PIM, or Recruitment pages — so
the suite leans on Playwright's user-facing locators, in roughly its recommended
priority order:

- [`getByRole()`](https://playwright.dev/docs/locators#locate-by-role) — the
  primary choice, locating by accessibility role and name (buttons, headings,
  rows, cells). It is the most resilient to styling and structural change and is
  what most of the suite uses.
- [`getByPlaceholder()`](https://playwright.dev/docs/locators#locate-by-placeholder)
  — for the form inputs, which carry clear placeholders (`First Name`, `Last
  Name`, `Username`).
- [`getByText()`](https://playwright.dev/docs/locators#locate-by-text) — for
  status text and for anchoring to a visible label when no better handle exists.

[`getByLabel()`](https://playwright.dev/docs/locators#locate-by-label) would
normally be preferred for form controls, but it is **not usable here**: the app
displays labels such as `Employee Id` and `Email` without programmatically
associating them with their inputs. Where a field has only a visible label and
no placeholder, the suite locates it from that label text and the textbox in the
same input group (`inputForVisibleLabel`). This is the one deliberately
DOM-shaped locator; it is isolated in a single helper and commented, so if the
product later adds proper labels or QA attributes it is a one-line change.
[`getByAltText()`](https://playwright.dev/docs/locators#locate-by-alt-text) and
[`getByTitle()`](https://playwright.dev/docs/locators#locate-by-title) were not
needed for these flows. CSS selectors are used only where the product renders a
custom control with no accessible handle — the vacancy `oxd-select` — and are
kept in the page object, never in a spec.

Two identifiers are read from the application itself rather than located in the
DOM: the employee number from the Personal Details URL and the candidate id from
the create response. They are the values the app assigns, which makes them exact
and reliable keys for lookup and cleanup.

### How authentication is handled across tests, and why

`tests/setup/auth.setup.ts` logs in once and writes browser state to
`playwright/.auth/user.json`. The authenticated Chromium project loads that state
before each of the other tests, so the login UI is exercised once rather than
repeated in every spec — faster, and it keeps the specs focused on their own
behaviour.

The valid-login case runs in a **separate, unauthenticated project**. It performs
the login itself, so it genuinely verifies authentication instead of passing
because saved state already exists. This separation also stops the other tests
from depending on the login test's order or outcome.

The state file is generated locally and Git-ignored. The public demo credentials
are the defaults and can be overridden through `ORANGEHRM_USERNAME` and
`ORANGEHRM_PASSWORD` (see Install).

### What was deliberately not automated, and why

- **Password-reset delivery.** It needs a controlled mailbox, and issuing resets
  against a shared demo account is not safe to automate.
- **Dashboard chart accuracy.** Presence is checkable, but validating the numbers
  needs a trusted data source to compare against; only presence would be
  meaningful here.
- **The insufficient-balance leave override.** The behaviour needs product
  clarification (which roles may override, and where the result should appear)
  before it can be asserted as pass or fail.
- **The known defects, as passing behaviour.** The future date-of-birth
  acceptance and the shortlist 500 are documented as findings, not encoded as if
  they were correct. The shortlist case is automated on the path that works and
  the defect is recorded in the response.
- **Cross-browser and responsiveness, and load/performance.** These were covered
  as a manual check rather than in the committed suite; the reasoning and how to
  fold them into CI are in the assignment response.

Cleanup deserves a note because it shaped the specs: every test deletes the
records it creates, by API, in a fixture teardown rather than in the test body.
That runs after the failure screenshot and trace are captured, and a cleanup
error is reported separately instead of masking the assertion that actually
failed — which matters on a shared public demo where leaked data accumulates.
