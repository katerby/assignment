# OrangeHRM Quality Assurance Assessment

This document records the exploratory testing, risk-based test design, and matching Playwright automation for the TripArc QA Analyst technical assignment. It will be completed from observed application behavior and explicit test-selection reasoning.

## Part 1 Exploratory Testing

### Scope and areas explored

- Authentication and login page behavior.
- Successful sign-in using the credentials displayed on the public demo login page.

### Important observations

- The login page publishes the demo credentials `Admin` and `admin123`.
- The username and password inputs expose clear placeholders, and the submit control has an accessible `Login` button name.
- Authentication is a prerequisite for the remaining functional coverage. The automation therefore creates reusable browser state separately from the business test that verifies login.

### Bugs and usability issues

To be completed only for reproducible or clearly evidenced findings.

### Risks and further testing

To be completed from the risk discussion.

## Part 2 Test Case Design

Five high-value cases will be selected across meaningful business risks, including positive and negative coverage where appropriate. Each case will use this structure:

1. Title
2. Objective
3. Preconditions
4. Test data
5. Steps
6. Expected result
7. Priority
8. Rationale

### Test case 1

**Title:** Log in with valid administrator credentials

**Objective:** Verify that a user with valid credentials can authenticate and reach the OrangeHRM dashboard.

**Preconditions:** The OrangeHRM demo login page is available, and the browser context has no authenticated session.

**Test data:** Username `Admin`; password `admin123`, or environment overrides if the published demo credentials change.

**Steps:**

1. Open the OrangeHRM login page.
2. Enter the valid username.
3. Enter the valid password.
4. Select **Login**.

**Expected result:** The application navigates to the dashboard URL and displays the **Dashboard** heading.

**Priority:** Critical.

**Rationale:** Authentication protects access to every administrative workflow and is a prerequisite for the other selected cases. A failure here blocks all meaningful use of the application.

### Test case 2

Pending selection.

### Test case 3

Pending selection.

### Test case 4

Pending selection.

### Test case 5

Pending selection.

## Part 3 Test Automation

The automated suite will implement the same five cases from Part 2. Each test will be independently runnable, use observable assertions, and avoid relying on records created by another test or another user of the public demo.

### Project structure

Pending final design decisions.

### Locator strategy

Pending final design decisions.

### Authentication strategy

The valid-login test starts without stored authentication and performs the login itself. A separate Playwright setup project performs the same login once, verifies that the dashboard loaded, and saves browser storage state to a Git-ignored file. Each remaining test starts in a fresh browser context initialized from that state. This avoids repeating the login UI in every test while keeping tests independent of execution order.

### Deliberate exclusions

Pending final design decisions.

### Limitations and assumptions

- The OrangeHRM demo is public and shared, so data can change or reset between runs.
- Environmental slowness or brief unavailability will be recorded rather than hidden with arbitrary waits.

### With another three hours

Pending final retrospective.

### Findings outside the brief

Pending exploratory findings.
