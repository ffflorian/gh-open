#!/usr/bin/env node

//@ts-check

const fs = require('fs');
const path = require('path');
const spawn = require('opn');

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

function findFile(file, baseDir) {
  const resolvedPath = path.join(baseDir, file);

  try {
    fs.accessSync(resolvedPath, fs.constants.F_OK | fs.constants.R_OK);
    return resolvedPath;
  } catch (err) {
    const higherDir = path.join(baseDir, '..');
    try {
      fs.accessSync(higherDir, fs.constants.F_OK | fs.constants.R_OK);
      return findFile(file, higherDir);
    } catch (err) {
      return false;
    }
  }
}

function parseGitBranch(resolvedBaseDir) {
  const gitBranchRegex = new RegExp('ref: refs/heads/(.*)$', 'mi');

  let gitHeadFile = '.git/HEAD';
  const foundFile = findFile(gitHeadFile, resolvedBaseDir);

  if (foundFile) {
    gitHeadFile = foundFile;
  } else {
    logError('Error: No git HEAD file found.');
  }

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

function readGitConfig(resolvedBaseDir) {
  const gitConfigRegex = new RegExp('.*url = (.*)', 'mi');
  let gitConfigFile = '.git/config';
  const foundFile = findFile(gitConfigFile, resolvedBaseDir);

  if (foundFile) {
    gitConfigFile = foundFile;
  } else {
    logError('Error: No git config file found.');
  }

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

function getFullUrl(resolvedBaseDir) {
  const gitUrlRegex = new RegExp('^(?:[^:]+://|[^@]+@)([^:]+):((.+?))(?:\\.git)?/?$', 'i');
  const rawUrl = readGitConfig(resolvedBaseDir);
  const gitBranch = parseGitBranch(resolvedBaseDir);

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

const fullUrl = getFullUrl(resolvedBaseDir);

if (PRINT_ONLY) {
  console.info(fullUrl);
} else {
  spawn(fullUrl, {wait: false});
}
