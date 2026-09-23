import type { APIRequestContext } from '@playwright/test';

import { CandidatePage } from '../pages/candidate.page';
import { expect, test } from '../support/fixtures';

type Vacancy = { id: number; name: string };

/**
 * Vacancies on the shared demo are editable by anyone, so the tests read one at
 * run time instead of hardcoding a name that may be renamed.
 *
 * A vacancy with no hiring manager cannot be shortlisted (the transition answers
 * 500 - see "Bugs and usability issues" in docs/assignment-response.md), and the
 * list payload omits that field, so each vacancy is read individually.
 */
async function findVacancyWithHiringManager(request: APIRequestContext): Promise<string> {
  const listResponse = await request.get('/web/index.php/api/v2/recruitment/vacancies?limit=50&status=true');
  expect(listResponse.ok(), `Could not read vacancies: ${listResponse.status()}`).toBeTruthy();

  for (const vacancy of ((await listResponse.json()).data ?? []) as Vacancy[]) {
    const detail = await request.get(`/web/index.php/api/v2/recruitment/vacancies/${vacancy.id}`);
    if (!detail.ok()) {
      continue;
    }
    if ((await detail.json()).data?.hiringManager?.firstName) {
      return vacancy.name;
    }
  }

  throw new Error('No active vacancy with a hiring manager is available on the demo');
}

async function addCandidateTo(
  candidatePage: CandidatePage,
  vacancy: string,
  workerIndex: number
): Promise<number> {
  const uniqueSuffix = `${Date.now()}${workerIndex}`.slice(-10);

  await candidatePage.openAddCandidate();
  return candidatePage.createCandidate({
    firstName: `Qa${uniqueSuffix}`,
    lastName: 'Candidate',
    email: `qa.${uniqueSuffix}@example.com`,
    vacancy
  });
}

test('a candidate added against a vacancy enters the application stage', async ({
  page,
  request,
  trackCandidate
}, testInfo) => {
  const candidatePage = new CandidatePage(page);
  const vacancy = await findVacancyWithHiringManager(request);

  trackCandidate(await addCandidateTo(candidatePage, vacancy, testInfo.workerIndex));

  await candidatePage.expectApplicationStage({ vacancy, status: 'Application Initiated' });
  await expect(candidatePage.actionButton('Shortlist')).toBeVisible();
  await expect(candidatePage.actionButton('Reject')).toBeVisible();
});

test('an administrator can shortlist a candidate', async ({ page, request, trackCandidate }, testInfo) => {
  const candidatePage = new CandidatePage(page);
  const vacancy = await findVacancyWithHiringManager(request);

  trackCandidate(await addCandidateTo(candidatePage, vacancy, testInfo.workerIndex));

  await candidatePage.actionButton('Shortlist').click();
  await expect(page.getByRole('heading', { name: 'Shortlist Candidate', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await candidatePage.expectApplicationStage({ vacancy, status: 'Shortlisted' });
});
