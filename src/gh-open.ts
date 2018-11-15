#!/usr/bin/env node

import * as fs from 'fs';
import {promisify} from 'util';
import * as path from 'path';
import * as findUp from 'find-up';
import spawn = require('opn');

const SCRIPT_NAME = 'gh-open';
const args = process.argv;

let PRINT_ONLY = false;
let BASE_DIRECTORY = './';

function displayHelp(): never {
  const usageText = `Usage: ${SCRIPT_NAME} [-h] [switch] [folder]

Commands:
--help (-h)        Show help text

Switches:
--print-only (-p)  Just print the URL instead of opening a browser

Example: ${SCRIPT_NAME} -p git_project/`;

  console.info(usageText);
  return process.exit();
}

async function parseGitBranch(gitDir: string): Promise<string> {
  const gitBranchRegex = new RegExp('ref: refs/heads/(.*)$', 'mi');
  const gitHeadFile = path.join(gitDir, 'HEAD');

  let gitHead;

  try {
    gitHead = await promisify(fs.readFile)(gitHeadFile, 'utf-8');
  } catch (error) {
    const errorMessage = 'Could not find git HEAD file.';
    throw new Error(errorMessage);
  }

  const match = gitBranchRegex.exec(gitHead);

  if (!match || !match[1]) {
    const errorMessage = 'No branch found in git HEAD file.';
    throw new Error(errorMessage);
  }

  return match[1];
}

async function readGitConfig(gitDir: string): Promise<string> {
  const gitConfigRegex = new RegExp('.*url = (.*)', 'mi');
  const gitConfigFile = path.join(gitDir, 'config');

  let gitConfig;

  try {
    gitConfig = await promisify(fs.readFile)(gitConfigFile, 'utf-8');
  } catch (error) {
    const errorMessage = 'Could not find git config file.';
    throw new Error(errorMessage);
  }

  const match = gitConfigRegex.exec(gitConfig);

  if (!match || !match[1]) {
    const errorMessage = 'Error: No URL found in git config file.';
    throw new Error(errorMessage);
  }

  return match[1];
}

async function getFullUrl(gitDir: string): Promise<string> {
  const gitUrlRegex = new RegExp('^(?:[^:]+://|[^@]+@)([^:]+):((.+?))(?:\\.git)?/?$', 'i');
  const rawUrl = await readGitConfig(gitDir);
  const gitBranch = await parseGitBranch(gitDir);

  const parsedUrl = rawUrl.replace(gitUrlRegex, 'https://$1/$2');
  const fullUrl = `${parsedUrl}/tree/${gitBranch}`;

  return fullUrl;
}

(async () => {
  for (let argIndex = 2; argIndex < args.length; argIndex++) {
    const arg = args[argIndex];

    switch (arg) {
      case '-h':
      case '--help':
        displayHelp();
        break;
      case '-p':
      case '--print-only':
        PRINT_ONLY = true;
        continue;
      default:
        if (arg.startsWith('-')) {
          console.error(`Error: Invalid argument "${arg}".\n`);
          displayHelp();
        } else {
          BASE_DIRECTORY = arg;
        }
        break;
    }
  }

  const resolvedBaseDir = path.resolve(BASE_DIRECTORY);

  try {
    const gitDir = await findUp('.git', {cwd: resolvedBaseDir});

    if (!gitDir) {
      throw new Error('Could not find the git root directory.');
    }

    const fullUrl = await getFullUrl(gitDir);

    if (PRINT_ONLY) {
      console.info(fullUrl);
    } else {
      spawn(fullUrl, {wait: false});
    }
  } catch (error) {
    console.error(error.message);
  }
})();
