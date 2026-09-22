import { expect, type Page } from '@playwright/test';

export type CandidateData = {
  firstName: string;
  lastName: string;
  email: string;
  /** Application-stage actions only exist once a candidate is tied to a vacancy. */
  vacancy?: string;
};

export class CandidatePage {
  constructor(private readonly page: Page) {}

  async openAddCandidate(): Promise<void> {
    await this.page.goto('/web/index.php/recruitment/addCandidate');
    await expect(this.page.getByRole('heading', { name: 'Add Candidate', exact: true })).toBeVisible();
  }

  async createCandidate(candidate: CandidateData): Promise<number> {
    await this.page.getByPlaceholder('First Name', { exact: true }).fill(candidate.firstName);
    await this.page.getByPlaceholder('Last Name', { exact: true }).fill(candidate.lastName);
    await this.inputForVisibleLabel('Email').fill(candidate.email);
    if (candidate.vacancy) {
      await this.selectVacancy(candidate.vacancy);
    }

    const createResponsePromise = this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/v2/recruitment/candidates') &&
        response.request().method() === 'POST'
    );
    await this.page.getByRole('button', { name: 'Save', exact: true }).click();

    const createResponse = await createResponsePromise;
    expect(createResponse.ok()).toBeTruthy();
    const responseBody = (await createResponse.json()) as { data?: { id?: number } };
    const candidateId = responseBody.data?.id;
    if (!candidateId) {
      throw new Error('Created candidate ID was not present in the API response');
    }

    await expect(this.page).toHaveURL(new RegExp(`/web/index\\.php/recruitment/addCandidate/${candidateId}$`));
    await expect(
      this.page.getByText(`${candidate.firstName} ${candidate.lastName}`, { exact: true })
    ).toBeVisible();

    return candidateId;
  }

  /**
   * Verifies the Application Stage panel shown on a candidate tied to a vacancy.
   */
  async expectApplicationStage(expected: { vacancy: string; status: string }): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Application Stage' })).toBeVisible();
    await expect(this.page.getByText(`Status: ${expected.status}`)).toBeVisible();
    await expect(this.page.getByText(expected.vacancy, { exact: true }).first()).toBeVisible();
  }

  actionButton(name: 'Shortlist' | 'Reject') {
    return this.page.getByRole('button', { name, exact: true });
  }

  private async selectVacancy(vacancy: string): Promise<void> {
    // OrangeHRM renders this as a custom listbox rather than a <select>, and the
    // options arrive asynchronously, so confirm the pick landed before saving.
    const select = this.page
      .getByText('Vacancy', { exact: true })
      .locator('..')
      .locator('..')
      .locator('.oxd-select-text');
    await select.click();
    await this.page.getByRole('option', { name: vacancy, exact: true }).click();
    await expect(select).toHaveText(vacancy);
  }

  private inputForVisibleLabel(label: string) {
    return this.page
      .getByText(label, { exact: true })
      .locator('..')
      .locator('..')
      .getByRole('textbox');
  }
}
