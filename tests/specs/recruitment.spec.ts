import { CandidatePage } from '../pages/candidate.page';
import { test } from '../support/fixtures';

test('administrator can add a recruitment candidate', async ({ page, trackCandidate }, testInfo) => {
  const candidatePage = new CandidatePage(page);
  const uniqueSuffix = `${Date.now()}${testInfo.workerIndex}`.slice(-10);

  await candidatePage.openAddCandidate();
  trackCandidate(
    await candidatePage.createCandidate({
      firstName: `Qa${uniqueSuffix}`,
      lastName: 'Candidate',
      email: `qa.${uniqueSuffix}@example.com`
    })
  );
});
