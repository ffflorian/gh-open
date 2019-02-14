#!/usr/bin/env node

import * as path from 'path';
import * as findUp from 'find-up';
import * as program from 'commander';
import opn = require('opn');

import {getFullUrl} from './gh-open';

const {name, version, description}: {name: string; version: string; description: string} = require('../package.json');

program
  .name(name.replace(/^@[^/]+\//, ''))
  .description(description)
  .option('-p, --print', 'Just print the URL', false)
  .arguments('[directory]',)
  .version(version, '-v, --version')
  .parse(process.argv);

const resolvedBaseDir = path.resolve(program.args[0] || '.');

findUp('.git', {cwd: resolvedBaseDir})
  .then(gitDir => {
    if (!gitDir) {
      throw new Error(`Could not find a git repository in "${resolvedBaseDir}".`);
    }
    return getFullUrl(gitDir);
  })
  .then(fullUrl => {
    if (program.print) {
      console.info(fullUrl);
      return;
    }

    return opn(fullUrl, {wait: false}).then(() => void 0);
  })
  .catch(error => {
    console.error(error.message);
    process.exit(1);
  });
