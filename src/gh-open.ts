import {promises as fsAsync} from 'fs';
import * as path from 'path';

export const parser = {
  fullUrl: {
    position: 0,
    regex: new RegExp('^(?:.+?://(?:.+@)?|(?:.+@)?)(.+?)[:/](.+?)(?:.git)?/?$', 'i'),
  },
  gitBranch: {
    position: 1,
    regex: new RegExp('ref: refs/heads/(.*)$', 'mi'),
  },
  rawUrl: {
    position: 1,
    regex: new RegExp('.*url = (.*)', 'mi'),
  },
};

export function parseRegex(str: string, type: keyof typeof parser): string | null {
  const {regex, position} = parser[type];
  const match = regex.exec(str);
  return match && match[position] ? match[position] : null;
}

export async function parseGitBranch(gitDir: string): Promise<string> {
  const gitHeadFile = path.join(gitDir, 'HEAD');

  let gitHead: string;

  try {
    gitHead = await fsAsync.readFile(gitHeadFile, 'utf-8');
  } catch (error) {
    const errorMessage = `Could not find git HEAD file in "${gitDir}".`;
    throw new Error(errorMessage);
  }

  const match = parseRegex(gitHead, 'gitBranch');

  if (!match) {
    const errorMessage = 'No branch found in git HEAD file.';
    throw new Error(errorMessage);
  }

  return match;
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

  const match = parseRegex(gitConfig, 'rawUrl');

  if (!match) {
    const errorMessage = 'No URL found in git config file.';
    throw new Error(errorMessage);
  }

  return match;
}

export async function getFullUrl(gitDir: string): Promise<string> {
  const rawUrl = await parseGitConfig(gitDir);
  const gitBranch = await parseGitBranch(gitDir);
  const match = parseRegex(rawUrl, 'fullUrl');

  if (!match) {
    const errorMessage = 'Could not convert raw URL.';
    throw new Error(errorMessage);
  }

  const parsedUrl = rawUrl.replace(parser.fullUrl.regex, 'https://$1/$2');

  return `${parsedUrl}/tree/${gitBranch}`;
}
