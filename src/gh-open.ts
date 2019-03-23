import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';

const readFileAsync = promisify(fs.readFile);

const parser = {
  fullUrl: new RegExp('^(?:.+?://(?:.+@)?|(?:.+@)?)(.+?)[:/](.+?)(?:.git)?/?$', 'i'),
  gitBranch: new RegExp('ref: refs/heads/(.*)$', 'mi'),
  gitConfig: new RegExp('.*url = (.*)', 'mi'),
};

function parseRegex(str: string, regex: keyof typeof parser): string | null {
  const match = parser[regex].exec(str);
  return match && match[1] ? match[1] : null;
}

async function parseGitBranch(gitDir: string): Promise<string> {
  const gitHeadFile = path.join(gitDir, 'HEAD');

  let gitHead;

  try {
    gitHead = await readFileAsync(gitHeadFile, 'utf-8');
  } catch (error) {
    const errorMessage = `Could not find git HEAD file in "${gitDir}".`;
    throw new Error(errorMessage);
  }

  const match = parseRegex(gitHead, 'gitBranch');

  if (!match) {
    const errorMessage = 'No branch found in git HEAD file.';
    throw new Error(errorMessage);
  }

  return match[1];
}

async function parseGitConfig(gitDir: string): Promise<string> {
  const gitConfigFile = path.join(gitDir, 'config');

  let gitConfig;

  try {
    gitConfig = await readFileAsync(gitConfigFile, 'utf-8');
  } catch (error) {
    const errorMessage = `Could not find git config file in "${gitDir}".`;
    throw new Error(errorMessage);
  }

  const match = parseRegex(gitConfig, 'gitConfig');

  if (!match) {
    const errorMessage = 'No URL found in git config file.';
    throw new Error(errorMessage);
  }

  return match[1];
}

async function getFullUrl(gitDir: string): Promise<string> {
  const rawUrl = await parseGitConfig(gitDir);
  const gitBranch = await parseGitBranch(gitDir);
  const match = parseRegex(rawUrl, 'fullUrl');

  if (!match) {
    const errorMessage = 'Could not convert raw URL.';
    throw new Error(errorMessage);
  }

  const parsedUrl = rawUrl.replace(parser.fullUrl, 'https://$1/$2');

  return `${parsedUrl}/tree/${gitBranch}`;
}

export {getFullUrl, parseGitBranch, parseGitConfig, parseRegex, parser};
