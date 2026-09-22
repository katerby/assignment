# TripArc QA Analyst Technical Assignment

This repository contains the exploratory testing notes, five high-value test cases, and Playwright TypeScript automation for the OrangeHRM public demo application.

The assignment response is organized into the required three parts in [docs/assignment-response.md](docs/assignment-response.md).

## Project status

The repository structure and Playwright configuration are initialized. The first test verifies valid authentication. A setup project also saves authenticated browser state for reuse by the remaining four tests.

## Prerequisites

- Node.js 20 or newer
- npm

## Install

```bash
npm install
npx playwright install chromium
```

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

## Project structure

```text
docs/
  assignment-response.md  Exploratory notes and five designed test cases
tests/
  pages/                  Focused page interactions and semantic locators
  setup/                  Authentication state creation
  specs/                  The five automated test cases
  support/                Shared configuration such as demo credentials
playwright.config.ts      Browser, reporting, and artifact configuration
```

## Approach decisions

### Authentication

`tests/setup/auth.setup.ts` logs in once and writes browser state to `playwright/.auth/user.json`. The authenticated Chromium project loads that state before each of the other tests. The state file is generated locally and excluded from Git.

The valid-login case runs in a separate unauthenticated project. It performs the login itself, so it verifies authentication instead of passing because saved state already exists. This separation also prevents later tests from depending on the login test's execution order.

The public credentials printed on the demo login page are the defaults. They can be overridden through `ORANGEHRM_USERNAME` and `ORANGEHRM_PASSWORD`.

### Remaining approach decisions

The final README will also explain:

- project structure and why it was chosen;
- locator strategy;
- deliberate automation exclusions;
- known limitations and assumptions;
- what would be done with another three hours; and
- findings outside the brief.
