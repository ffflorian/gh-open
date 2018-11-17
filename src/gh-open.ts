import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';

async function parseGitBranch(gitDir: string): Promise<string> {
  const gitBranchRegex = new RegExp('ref: refs/heads/(.*)$', 'mi');
  const gitHeadFile = path.join(gitDir, 'HEAD');

  let gitHead;

  try {
    gitHead = await promisify(fs.readFile)(gitHeadFile, 'utf-8');
  } catch (error) {
    const errorMessage = `Could not find git HEAD file in "${gitDir}".`;
    throw new Error(errorMessage);
  }

  const match = gitBranchRegex.exec(gitHead);

  if (!match || !match[1]) {
    const errorMessage = 'No branch found in git HEAD file.';
    throw new Error(errorMessage);
  }

  return match[1];
}

async function parseGitConfig(gitDir: string): Promise<string> {
  const gitConfigRegex = new RegExp('.*url = (.*)', 'mi');
  const gitConfigFile = path.join(gitDir, 'config');

  let gitConfig;

  try {
    gitConfig = await promisify(fs.readFile)(gitConfigFile, 'utf-8');
  } catch (error) {
    const errorMessage = `Could not find git config file in "${gitDir}".`;
    throw new Error(errorMessage);
  }

  const match = gitConfigRegex.exec(gitConfig);

  if (!match || !match[1]) {
    const errorMessage = 'No URL found in git config file.';
    throw new Error(errorMessage);
  }

  return match[1];
}

async function getFullUrl(gitDir: string): Promise<string> {
  const gitUrlRegex = new RegExp('^(?:[^:]+://|[^@]+@)([^:]+):((.+?))(?:\\.git)?/?$', 'i');
  const rawUrl = await parseGitConfig(gitDir);
  const gitBranch = await parseGitBranch(gitDir);

  const parsedUrl = rawUrl.replace(gitUrlRegex, 'https://$1/$2');
  return `${parsedUrl}/tree/${gitBranch}`;
}

export {getFullUrl, parseGitBranch, parseGitConfig};
