import {promises as fsAsync} from 'fs';
import * as path from 'path';

import {GitHubClient} from './GitHubClient';

export const parser = {
  fullUrl: new RegExp('^(?:.+?://(?:.+@)?|(?:.+@)?)(.+?)[:/](.+?)(?:.git)?/?$', 'i'),
  gitBranch: new RegExp('ref: refs/heads/(?<branch>.*)$', 'mi'),
  pullRequest: new RegExp('github\\.com\\/(?<user>[^\\/]+)\\/(?<project>[^/]+)\\/tree\\/(?<branch>.*)'),
  rawUrl: new RegExp('.*url = (?<rawUrl>.*)', 'mi'),
};

export async function parseGitBranch(gitDir: string): Promise<string> {
  const gitHeadFile = path.join(gitDir, 'HEAD');

  let gitHead: string;

  try {
    gitHead = await fsAsync.readFile(gitHeadFile, 'utf-8');
  } catch (error) {
    const errorMessage = `Could not find git HEAD file in "${gitDir}".`;
    throw new Error(errorMessage);
  }

  const match = parser.gitBranch.exec(gitHead);

  if (!match || !match.groups) {
    const errorMessage = 'No branch found in git HEAD file.';
    throw new Error(errorMessage);
  }

  return match.groups.branch;
}

export async function parseGitConfig(gitDir: string): Promise<string> {
  const gitConfigFile = path.join(gitDir, 'config');

  let gitConfig;

  try {
    gitConfig = await fsAsync.readFile(gitConfigFile, 'utf-8');
  } catch (error) {
    const errorMessage = `Could not find git config file in "${gitDir}".`;
    throw new Error(errorMessage);
  }

  const match = parser.rawUrl.exec(gitConfig);

  if (!match || !match.groups) {
    const errorMessage = 'No URL found in git config file.';
    throw new Error(errorMessage);
  }

  return match.groups.rawUrl;
}

export async function getFullUrl(gitDir: string): Promise<string> {
  const rawUrl = await parseGitConfig(gitDir);
  const gitBranch = await parseGitBranch(gitDir);
  const match = parser.fullUrl.exec(rawUrl);

  if (!match) {
    const errorMessage = 'Could not convert raw URL.';
    throw new Error(errorMessage);
  }

  const parsedUrl = rawUrl.replace(parser.fullUrl, 'https://$1/$2');

  return `${parsedUrl}/tree/${gitBranch}`;
}

export async function getPullRequest(url: string, timeout?: number): Promise<string> {
  const match = parser.pullRequest.exec(url);
  const gitHubClient = new GitHubClient(timeout);

  if (!match || !match.groups) {
    const errorMessage = 'Could not convert GitHub URL to pull request.';
    throw new Error(errorMessage);
  }

  const {user, project, branch} = match.groups;
  let pullRequest;

  try {
    const response = await gitHubClient.getPullRequestByBranch(user, project, branch);

    if (response && response._links && response._links.html && response._links.html.href) {
      pullRequest = response._links.html.href;
    }
  } catch (error) {
    console.warn(error.message);
  }

  return pullRequest || '';
}
