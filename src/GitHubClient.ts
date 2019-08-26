import axios from 'axios';

export interface PullRequest {
  _links: {
    html: {
      href: string;
    };
  };
  head: {
    ref: string;
  };
  id: string;
}

export class GitHubClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = 'https://api.github.com';
  }

  async getPullRequestByBranch(user: string, project: string, branch: string): Promise<PullRequest | undefined> {
    const pullRequests = await this.getPullRequests(user, project);
    return pullRequests.find(pr => pr.head.ref === branch);
  }

  /**
   * @see https://developer.github.com/v3/pulls/#list-pull-requests
   */
  async getPullRequests(user: string, project: string): Promise<PullRequest[]> {
    const resourceUrl = `${this.baseUrl}/repos/${user}/${project}/pulls`;

    const response = await axios.request({
      method: 'get',
      params: {
        state: 'open',
      },
      url: resourceUrl,
    });

    return response.data;
  }
}
