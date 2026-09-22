import { expect, type Page } from '@playwright/test';

export type EmployeeName = {
  firstName: string;
  lastName: string;
  /**
   * Replaces the id the application pre-fills. That generated value is a shared
   * counter that only advances on save, so two runs that open the form at the
   * same time read the same id and the second save is rejected with
   * "Employee Id already exists".
   */
  employeeId: string;
};

export class EmployeeListPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/web/index.php/pim/viewEmployeeList');
    await expect(this.page.getByRole('heading', { name: 'PIM', exact: true })).toBeVisible();
    // The heading and the Add button paint with the page shell, roughly 800ms
    // before the employee list finishes loading. Waiting for the record count
    // keeps a click from landing on a control the app has not wired up yet.
    await expect(this.recordCount()).toBeVisible();
  }

  async openAddEmployee(): Promise<void> {
    await this.page.getByRole('button', { name: /Add$/ }).click();
    await expect(this.page.getByRole('heading', { name: 'Add Employee', exact: true })).toBeVisible();
    await expect(this.page).toHaveURL(/\/web\/index\.php\/pim\/addEmployee$/);
  }

  /** Returns the employee number, the identifier the application assigns on save. */
  async createEmployee(employee: EmployeeName): Promise<string> {
    await this.page.getByPlaceholder('First Name', { exact: true }).fill(employee.firstName);
    await this.page.getByPlaceholder('Last Name', { exact: true }).fill(employee.lastName);

    // Confirm the application generates an id, then take ownership of it.
    const employeeIdInput = this.inputForVisibleLabel('Employee Id');
    await expect(employeeIdInput).not.toHaveValue('');
    await employeeIdInput.fill(employee.employeeId);

    await this.page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(this.page).toHaveURL(/\/web\/index\.php\/pim\/viewPersonalDetails\/empNumber\/\d+$/);
    await expect(this.page.getByRole('heading', { name: 'Personal Details', exact: true })).toBeVisible();

    const employeeNumber = new URL(this.page.url()).pathname.split('/').at(-1);
    if (!employeeNumber) {
      throw new Error('Employee number was not present in the Personal Details URL');
    }

    return employeeNumber;
  }

  async expectEmployeeById(employee: EmployeeName): Promise<void> {
    await this.open();
    await this.inputForVisibleLabel('Employee Id').fill(employee.employeeId);
    await this.page.getByRole('button', { name: 'Search', exact: true }).click();

    const row = this.employeeRow(employee.employeeId);
    await expect(row).toBeVisible();
    await expect(row).toContainText(employee.firstName);
    await expect(row).toContainText(employee.lastName);
  }

  private recordCount() {
    return this.page.getByText(/\(\d+\)\s+Records? Found/);
  }

  private employeeRow(employeeId: string) {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: employeeId, exact: true })
    });
  }

  private inputForVisibleLabel(label: string) {
    return this.page
      .getByText(label, { exact: true })
      .locator('..')
      .locator('..')
      .getByRole('textbox');
  }
}
