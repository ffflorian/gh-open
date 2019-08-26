#!/usr/bin/env node

import * as program from 'commander';
import * as findUp from 'find-up';
import * as fs from 'fs';
import open = require('open');
import * as path from 'path';

import {getFullUrl, getPullRequest} from './gh-open';

const defaultPackageJsonPath = path.join(__dirname, 'package.json');
const packageJsonPath = fs.existsSync(defaultPackageJsonPath)
  ? defaultPackageJsonPath
  : path.join(__dirname, '../package.json');

const packageJson = fs.readFileSync(packageJsonPath, 'utf-8');
const {description, name, version}: {description: string; name: string; version: string} = JSON.parse(packageJson);

program
  .name(name.replace(/^@[^/]+\//, ''))
  .description(description)
  .option('-p, --print', 'Just print the URL')
  .option('-r, --pull-request', 'Get the pull request for the branch')
  .arguments('[directory]')
  .version(version, '-v, --version')
  .parse(process.argv);

const resolvedBaseDir = path.resolve(program.args[0] || '.');

(async () => {
  const gitDir = await findUp('.git', {cwd: resolvedBaseDir, type: 'directory'});
  if (!gitDir) {
    throw new Error(`Could not find a git repository in "${resolvedBaseDir}".`);
  }

  let fullUrl = await getFullUrl(gitDir);

  if (program.pullRequest) {
    const pullRequestUrl = await getPullRequest(fullUrl);
    if (pullRequestUrl) {
      fullUrl = pullRequestUrl;
    } else {
      console.info('No pull request found.');
    }
  }

  if (program.print) {
    console.info(fullUrl);
    return;
  }

  await open(fullUrl);
})().catch(error => {
  console.error(error.message);
  process.exit(1);
});
