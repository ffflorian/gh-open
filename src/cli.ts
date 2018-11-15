#!/usr/bin/env node

import * as path from 'path';
import * as findUp from 'find-up';
import spawn = require('opn');

import {getFullUrl} from './gh-open';

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
        console.error(`Invalid argument "${arg}".\n`);
        displayHelp();
      } else {
        BASE_DIRECTORY = arg;
      }
      break;
  }
}

const resolvedBaseDir = path.resolve(BASE_DIRECTORY);

(async () => {
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
