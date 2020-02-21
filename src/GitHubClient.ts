import axios from 'axios';
import type {AxiosInstance} from 'axios';

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

export class GitHubClient {
  private readonly apiClient: AxiosInstance;

  constructor(timeout: number = 2000) {
    this.apiClient = axios.create({baseURL: 'https://api.github.com', timeout});
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

    const response = await this.apiClient.get(resourceUrl, {
      params: {
        state: 'open',
      },
    });

    return response.data;
  }
}
