import got, {Got} from 'got';

export interface PullRequest {
  _links: {
    html: {
      href: string;
    };
  };
  head: {
    ref: string;
  };
}

const TWO_SECONDS_IN_MILLIS = 2000;

export class GitHubClient {
  private readonly apiClient: Got;

  constructor(timeout: number = TWO_SECONDS_IN_MILLIS) {
    this.apiClient = got.extend({prefixUrl: 'https://api.github.com', timeout});
  }

  async getPullRequestByBranch(user: string, repository: string, branch: string): Promise<PullRequest | undefined> {
    const pullRequests = await this.getPullRequests(user, repository);
    return pullRequests.find(pr => !!pr.head && pr.head.ref === branch);
  }

  /**
   * @see https://developer.github.com/v3/pulls/#list-pull-requests
   */
  async getPullRequests(user: string, repository: string): Promise<PullRequest[]> {
    const resourceUrl = `repos/${user}/${repository}/pulls`;

    const response = await this.apiClient
      .get(resourceUrl, {
        searchParams: {
          state: 'open',
        },
      })
      .json<PullRequest[]>();

    return response;
  }
}
