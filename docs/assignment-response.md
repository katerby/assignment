# OrangeHRM Quality Assurance Assessment

This document records the exploratory testing, risk-based test design, and matching Playwright automation for the TripArc QA Analyst technical assignment. It will be completed from observed application behavior and explicit test-selection reasoning.

## Part 1 Exploratory Testing

### Scope and areas explored

- Authentication and login page behavior.
- Invalid-credential handling.
- Forgot-password navigation and available reset controls.
- Successful sign-in using the credentials displayed on the public demo login page.
- Dashboard content, summary visualizations, and Quick Launch navigation.
- Assign Leave employee search, required fields, leave-balance feedback, contextual help, and insufficient-balance confirmation.
- PIM employee-list navigation and the entry point for adding an employee.
- Add Employee field requirements, length constraints, generated employee identifiers, save behavior, and Personal Details validation.
- Recruitment candidate creation, required identity and email fields, and save behavior.

### Important observations

- The login page publishes the demo credentials `Admin` and `admin123`.
- The username and password inputs expose clear placeholders, and the submit control has an accessible `Login` button name.
- Invalid credentials leave the user unauthenticated and display an `Invalid credentials` error.
- **Forgot your password** opens the password-reset page, where the user can enter a username, request a reset, or cancel and return to login.
- Authentication is a prerequisite for the remaining functional coverage. The automation therefore creates reusable browser state separately from the business test that verifies login.
- Direct navigation to the protected PIM Employee List without an authenticated session redirects the user to the login page.
- A successful login lands on the dashboard, which provides Quick Launch links for common workflows such as My Timesheet, Apply Leave, My Leave, Leave List, and Assign Leave.
- The explored Quick Launch links opened pages consistent with their labels. A maintainable navigation check should assert the destination page heading or other page-specific content, not only the URL.
- The dashboard also presents action items and workforce summary charts, including employee distribution and distribution by subunit.
- Assign Leave provides required employee, leave type, and date inputs. Employee search returns `No Records Found` when no match exists and suggestions when a matching employee is found.
- When the selected employee lacks enough leave, the page displays the insufficient balance, explanatory help, and a confirmation dialog before allowing the administrator to continue.
- The PIM Employee List provides an **Add** action for creating a new employee. Employee creation is a core setup workflow because employee records are used by leave, time, performance, and other HR modules.
- On Add Employee, first and last name are required while middle name is optional. Each name field enforces a maximum length of 30 characters.
- The application generates an employee ID automatically. After a successful save, it navigates to the new employee's Personal Details page, and the record can be found from the Employee List by its generated ID.
- Personal Details allows additional demographic and identity data, including driver's license information, nationality, marital status, and date of birth.
- Add Candidate requires the candidate's first name, last name, and email address. Middle name, vacancy, contact number, resume, keywords, application date, notes, and data-retention consent provide additional recruitment context.
- The Recruitment pages expose no dedicated QA attributes. Candidate automation therefore uses visible form semantics and verifies the candidate-creation network response in addition to the resulting UI.

### Bugs and usability issues

- **Future date of birth is accepted.** On September 21, 2026, a date of birth of February 11, 2027 was entered and saved successfully. A future date cannot be a valid date of birth, so the form should reject it with a clear validation message and leave the stored value unchanged.
- **Employee ID inputs lack an accessible name.** The pages display an `Employee Id` label, but the label is not programmatically associated with its textbox. This prevents reliable label-based interaction for assistive technology and automation. No dedicated QA attribute is available as an alternative.
- **Needs clarification:** after an insufficient-balance warning, confirming the assignment produced a success message. The dialog explicitly offers an override, so this may be intentional administrator behavior rather than a defect. The result should be verified in the employee's leave records or reports and compared with the expected business rule before filing a bug.

### Risks and further testing

- Authentication is a critical dependency: an outage or regression prevents access to all protected HR workflows.
- Password-reset delivery cannot be validated reliably without access to a controlled user and mailbox. Automation should avoid sending reset requests for shared or unknown accounts.
- Quick Launch links provide broad workflow access, so incorrect destinations would affect several common user journeys.
- Leave balances and employee records in the public demo are volatile. Tests must not assume that a particular employee, balance, or leave request will remain unchanged.
- Assigning leave changes shared HR data. An automated test should not confirm an assignment unless it owns suitable test data and can clean up safely.
- The insufficient-balance override requires product clarification: determine which roles may override a balance, whether a negative balance is expected, and where the resulting request must appear.
- Dashboard chart presence can be checked through the UI, but validating the accuracy of the displayed statistics would require a trusted data source or API comparison.
- Adding an employee creates persistent data in the shared demo. Further testing should cover required fields, unique employee identifiers, cancellation, successful save, searchability of the saved employee, and cleanup. Automation will need uniquely generated test data and a reliable cleanup strategy.
- Date-of-birth validation is a data-integrity risk. Further checks should cover today's date, a dynamically generated future date, invalid calendar dates, leap years, and reasonable lower age boundaries. A dynamic future date is required so an automated check never becomes valid merely because time has passed.

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

**Expected result:** The application navigates to the dashboard URL, displays the **Dashboard** heading, and shows a non-empty authenticated account name in the top-right banner.

**Priority:** Critical.

**Rationale:** Authentication protects access to every administrative workflow and is a prerequisite for the other selected cases. A failure here blocks all meaningful use of the application.

### Test case 2

**Title:** Create an employee and find the record by its generated ID

**Objective:** Verify that an administrator can create a valid employee record and retrieve the same record from the Employee List.

**Preconditions:** The administrator is authenticated and can access PIM. The test can remove the employee it creates.

**Test data:** Unique first and last names of no more than 30 characters. Middle name is optional. The application-generated employee ID is captured during the test.

**Steps:**

1. Open PIM and select **Add** from the Employee List.
2. Enter unique values in the required first-name and last-name fields.
3. Record the automatically generated employee ID.
4. Save the employee.
5. Verify that the application opens the new employee's Personal Details page.
6. Return to the Employee List and search for the captured employee ID.

**Expected result:** The employee is saved, the Personal Details page represents the created employee, and an exact search by the generated ID returns the same employee record.

**Priority:** High.

**Rationale:** Employee records are foundational data for leave, time, performance, and other HR workflows. This case verifies creation, persistence, navigation, and retrieval while using a generated identifier that avoids dependence on another user's data.

### Test case 3

**Title:** Add a recruitment candidate with valid required information

**Objective:** Verify that an authenticated administrator can create a candidate using the required identity and contact information.

**Preconditions:** The administrator is authenticated and can access Recruitment. The test can remove the candidate it creates.

**Test data:** Unique first and last names and a unique syntactically valid email address.

**Steps:**

1. Open the Recruitment Add Candidate page.
2. Enter unique values in the required first-name and last-name fields.
3. Enter a unique valid email address.
4. Save the candidate.

**Expected result:** The create request succeeds, the application opens the saved candidate page, and the candidate's full name is displayed.

**Priority:** High.

**Rationale:** Candidate creation is the entry point to the recruitment workflow. Failure would prevent recruiters from tracking applicants through vacancies, interviews, and hiring stages. Unique data and exact cleanup keep the case independent in the shared demo.

### Test case 4

Pending selection.

### Test case 5

Pending selection.

## Part 3 Test Automation

The automated suite will implement the same five cases from Part 2. Each test will be independently runnable, use observable assertions, and avoid relying on records created by another test or another user of the public demo.

### Project structure

Pending final design decisions.

### Locator strategy

The suite prioritizes user-visible roles, names, placeholders, and text. A live DOM audit found no `data-testid`, `data-test`, `data-cy`, `data-qa`, or `data-automation-id` attributes on the inspected login, PIM, and Recruitment pages. OrangeHRM exposes generated Vue `data-v-*` scope attributes, but these are build artifacts and are deliberately not used. OrangeHRM also does not associate every visual label with its input, so employee ID and candidate email fields are located from their visible label text and the textbox in the same input group. Employee results use semantic row and cell roles with the exact generated ID. Employee cleanup selects that exact row and uses the visible **Delete Selected** action; candidate cleanup uses the exact ID returned by the successful create response.

### Authentication strategy

The valid-login test starts without stored authentication and performs the login itself. A separate Playwright setup project performs the same login once, verifies that the dashboard loaded, and saves browser storage state to a Git-ignored file. Each remaining test starts in a fresh browser context initialized from that state. This avoids repeating the login UI in every test while keeping tests independent of execution order.

### Deliberate exclusions

- The date-of-birth defect is documented but is not encoded as passing expected behavior. If selected for automation, the check should expect rejection of a dynamically generated future date and should be marked as a known failure until the defect is fixed.

### Limitations and assumptions

- The OrangeHRM demo is public and shared, so data can change or reset between runs.
- Environmental slowness or brief unavailability will be recorded rather than hidden with arbitrary waits.

### With another three hours

Pending final retrospective.

### Findings outside the brief

Pending exploratory findings.
