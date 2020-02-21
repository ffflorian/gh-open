#!/usr/bin/env node

import * as program from 'commander';
import * as findUp from 'find-up';
import * as fs from 'fs';
import open = require('open');
import * as path from 'path';

import {RepositoryService} from './RepositoryService';

const defaultPackageJsonPath = path.join(__dirname, 'package.json');
const packageJsonPath = fs.existsSync(defaultPackageJsonPath)
  ? defaultPackageJsonPath
  : path.join(__dirname, '../package.json');

const packageJson = fs.readFileSync(packageJsonPath, 'utf-8');
const {description, name, version} = JSON.parse(packageJson);

program
  .name(name.replace(/^@[^/]+\//, ''))
  .description(description)
  .option('-d, --debug', 'Enable debug logging')
  .option('-p, --print', 'Just print the URL')
  .option('-b, --branch', 'Open the branch tree (and not the PR)')
  .option('-t, --timeout <number>', 'Set a custom timeout for HTTP requests')
  .arguments('[directory]')
  .version(version, '-v, --version')
  .parse(process.argv);

const resolvedBaseDir = path.resolve(program.args[0] || '.');

(async () => {
  const gitDir = await findUp('.git', {cwd: resolvedBaseDir, type: 'directory'});
  if (!gitDir) {
    throw new Error(`Could not find a git repository in "${resolvedBaseDir}".`);
  }

  const repositoryService = new RepositoryService({
    ...(program.debug ?? {debug: program.debug}),
    ...(program.timeout ?? {timeout: parseInt(program.timeout, 10)}),
  });

  let fullUrl = await repositoryService.getFullUrl(gitDir);

  if (!program.branch) {
    const pullRequestUrl = await repositoryService.getPullRequestUrl(fullUrl);
    if (pullRequestUrl) {
      fullUrl = pullRequestUrl;
    }
  }

  if (program.print) {
    console.info(fullUrl);
  } else {
    await open(fullUrl, {url: true});
  }
})().catch(error => {
  console.error(error.message);
  process.exit(1);
});
