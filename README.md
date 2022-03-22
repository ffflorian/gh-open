# gh-open [![Build Status](https://github.com/ffflorian/gh-open/workflows/Build/badge.svg)](https://github.com/ffflorian/gh-open/actions/) [![npm version](https://img.shields.io/npm/v/gh-open.svg?style=flat)](https://www.npmjs.com/package/gh-open)

Open a GitHub repository in your browser.

## Installation

Run `yarn global add gh-open` or `npm install -g gh-open`.

## Usage

```
Usage: gh-open [options] [directory]

Open a GitHub repository in your browser. Opens pull requests by default.

Options:
  -d, --debug             Enable debug logging
  -p, --print             Just print the URL
  -b, --branch            Open the branch tree (and not the PR)
  -t, --timeout <number>  Set a custom timeout for HTTP requests
  -v, --version           output the version number
  -h, --help              display help for command
```

## Test

```
yarn
yarn test
```
