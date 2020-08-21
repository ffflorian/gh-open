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
   * @param owner The repository owner
   * @param repository The repository name
   * @see https://docs.github.com/v3/pulls/#list-pull-requests
   */
  getPullRequests(owner: string, repository: string): Promise<PullRequest[]> {
    const resourceUrl = `repos/${owner}/${repository}/pulls`;

    const request = this.apiClient.get(resourceUrl, {
      searchParams: {
        state: 'open',
      },
    });

    return request.json<PullRequest[]>();
  }
}
