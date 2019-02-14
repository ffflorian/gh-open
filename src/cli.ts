#!/usr/bin/env node

import * as fs from 'fs';
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
  const usageText = `Usage: ${SCRIPT_NAME} [-h] [switch] [directory]

Commands:
 --help (-h)   Show help text

Switches:
 --print (-p)  Just print the URL

Example: ${SCRIPT_NAME} -p git_project/`;

  console.info(usageText);
  return process.exit();
}

for (let argIndex = 2; argIndex < args.length; argIndex++) {
  const arg = args[argIndex];

  switch (arg) {
    case '-h':
    case '--help': {
      displayHelp();
      break;
    }
    case '-p':
    case '--print-only': {
      options.printOnly = true;
      continue;
    }
    default: {
      if (arg.startsWith('-')) {
        let isDirectory = false;
        try {
          isDirectory = fs.statSync(arg).isDirectory();
        } catch (error) {}

        if (!isDirectory) {
          console.error(`Invalid argument "${arg}".\n`);
          displayHelp();
        } else {
          options.baseDir = arg;
        }
      } else {
        options.baseDir = arg;
      }
      break;
    }
  }
}

const resolvedBaseDir = path.resolve(options.baseDir);

findUp('.git', {cwd: resolvedBaseDir})
  .then(gitDir => {
    if (!gitDir) {
      throw new Error(`Could not find a git repository in "${resolvedBaseDir}".`);
    }
    return getFullUrl(gitDir);
  })
  .then(fullUrl => {
    if (options.printOnly) {
      console.info(fullUrl);
      return;
    }

    return opn(fullUrl, {wait: false}).then(() => void 0);
  })
  .catch(error => {
    console.error(error.message);
    process.exit(1);
  });
