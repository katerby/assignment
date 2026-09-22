import { expect, type Page } from '@playwright/test';

export type CandidateData = {
  firstName: string;
  lastName: string;
  email: string;
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

  private inputForVisibleLabel(label: string) {
    return this.page
      .getByText(label, { exact: true })
      .locator('..')
      .locator('..')
      .getByRole('textbox');
  }
}
