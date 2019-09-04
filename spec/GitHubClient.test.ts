import * as nock from 'nock';

import {GitHubClient, PullRequest} from '../src/GitHubClient';

describe('GitHubClient', () => {
  describe('getPullRequests', () => {
    it('cancels the request after a given time', async () => {
      nock('https://api.github.com')
        .get(/repos\/.*\/.*\/pulls/)
        .query(true)
        .delay(10_000)
        .reply(200);

      const gitHubClient = new GitHubClient(500);
      try {
        await gitHubClient.getPullRequests('user', 'repository');
        fail('Should not have resolved');
      } catch (error) {
        expect(error.message).toBe('timeout of 500ms exceeded');
      } finally {
        nock.cleanAll();
      }
    });
  });

  describe('getPullRequestsByBranch', () => {
    it('correctly parses pull requests', async () => {
      const exampleData: PullRequest[] = [
        {
          _links: {
            html: {
              href: 'https://github.com/user/repo/pull/1234',
            },
          },
          head: {
            ref: 'branch-name',
          },
        },
      ];

      nock('https://api.github.com')
        .get(/repos\/.*\/.*\/pulls/)
        .query(true)
        .reply(200, exampleData);

      const gitHubClient = new GitHubClient();
      const result = await gitHubClient.getPullRequestByBranch('user', 'repository', 'branch-name');
      expect(result).toEqual(exampleData[0]);
    });
  });
});
