import * as nock from 'nock';

import {GitHubClient, PullRequest} from '../src/GitHubClient';

const TEN_SECONDS_IN_MILLIS = 10_000;
const HALF_SECOND_IN_MILLIS = 500;
const HTTP_CODE_OK = 200;

describe('GitHubClient', () => {
  describe('getPullRequests', () => {
    it('cancels the request after a given time', async () => {
      nock('https://api.github.com')
        .get(/repos\/.*\/.*\/pulls/)
        .query(true)
        .delay(TEN_SECONDS_IN_MILLIS)
        .reply(HTTP_CODE_OK);

      const gitHubClient = new GitHubClient(HALF_SECOND_IN_MILLIS);
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
        .reply(HTTP_CODE_OK, exampleData);

      const gitHubClient = new GitHubClient();
      const result = await gitHubClient.getPullRequestByBranch('user', 'repository', 'branch-name');
      expect(result).toEqual(exampleData[0]);
    });
  });
});
