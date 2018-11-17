#!/usr/bin/env node

import * as path from 'path';
import * as findUp from 'find-up';
import opn = require('opn');

import {getFullUrl} from './gh-open';

const SCRIPT_NAME = 'gh-open';
const args = process.argv;

const options = {
  baseDir: './',
  printOnly: false,
};

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
      options.printOnly = true;
      continue;
    default:
      if (arg.startsWith('-')) {
        console.error(`Invalid argument "${arg}".\n`);
        displayHelp();
      } else {
        options.baseDir = arg;
      }
      break;
  }
}

const resolvedBaseDir = path.resolve(options.baseDir);

(async () => {
  try {
    const gitDir = await findUp('.git', {cwd: resolvedBaseDir});

    if (!gitDir) {
      throw new Error('Could not find the git root directory.');
    }

    const fullUrl = await getFullUrl(gitDir);

    if (options.printOnly) {
      console.info(fullUrl);
    } else {
      opn(fullUrl, {wait: false});
    }
  } catch (error) {
    console.error(error.message);
  }
})();
