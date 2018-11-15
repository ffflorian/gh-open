#!/usr/bin/env node

//@ts-check

const fs = require('fs');
const path = require('path');
const spawn = require('opn');
const gitRootDir = require('git-root-dir');

const SCRIPT_NAME = path.basename(__filename);
const args = process.argv;

let PRINT_ONLY = false;
let BASE_DIRECTORY = './';

function logError(message) {
  console.error(message);
  process.exit(1);
}

function displayHelp() {
  const usageText = `Usage: ${SCRIPT_NAME} [-h] [switch] [folder]

Commands:
--help (-h)        Show help text

Switches:
--print-only (-p)  Just print the URL instead of opening a browser

Example: ${SCRIPT_NAME} -p git_project/`;

  console.info(usageText);
  process.exit();
}

function parseGitBranch(gitDir) {
  const gitBranchRegex = new RegExp('ref: refs/heads/(.*)$', 'mi');
  const gitHeadFile = path.join(gitDir, '.git', 'HEAD');

  let gitHead;

  try {
    gitHead = fs.readFileSync(gitHeadFile, 'utf-8');
  } catch (error) {
    logError(error.message);
  }

  const match = gitBranchRegex.exec(gitHead);

  if (!match || !match[1]) {
    const errorMessage = 'Error: No branch found in git HEAD file.';
    logError(errorMessage);
  }

  return match[1];
}

function readGitConfig(gitDir) {
  const gitConfigRegex = new RegExp('.*url = (.*)', 'mi');
  const gitConfigFile = path.join(gitDir, '.git', 'config');

  let gitConfig;

  try {
    gitConfig = fs.readFileSync(gitConfigFile, 'utf-8');
  } catch (error) {
    logError(error.message);
  }

  const match = gitConfigRegex.exec(gitConfig);

  if (!match || !match[1]) {
    const errorMessage = 'Error: No URL found in git config file.';
    logError(errorMessage);
  }

  return match[1];
}

function getFullUrl(gitDir) {
  const gitUrlRegex = new RegExp('^(?:[^:]+://|[^@]+@)([^:]+):((.+?))(?:\\.git)?/?$', 'i');
  const rawUrl = readGitConfig(gitDir);
  const gitBranch = parseGitBranch(gitDir);

  const parsedUrl = rawUrl.replace(gitUrlRegex, 'https://$1/$2');
  const fullUrl = `${parsedUrl}/tree/${gitBranch}`;
  return fullUrl;
}

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
        logError(`Error: Invalid argument "${arg}".\n`);
        displayHelp();
      } else {
        BASE_DIRECTORY = arg;
      }
      break;
  }
}

const resolvedBaseDir = path.resolve(BASE_DIRECTORY);

gitRootDir(resolvedBaseDir).then(gitDir => {
  if (!gitDir) {
    return Promise.reject('Could not find the git root directory.');
  }

  const fullUrl = getFullUrl(gitDir);

  if (PRINT_ONLY) {
    console.info(fullUrl);
  } else {
    spawn(fullUrl, {wait: false});
  }
}).catch(error => {
  logError(error);
});
