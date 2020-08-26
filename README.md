# gh-open [![Build Status](https://github.com/ffflorian/gh-open/workflows/Build/badge.svg)](https://github.com/ffflorian/gh-open/actions/) [![npm version](https://img.shields.io/npm/v/@ffflorian/gh-open.svg?style=flat)](https://www.npmjs.com/package/@ffflorian/gh-open)

Open a GitHub repository in your browser.

## Installation

Run `yarn global add @ffflorian/gh-open` or `npm install -g @ffflorian/gh-open`.

## Usage

```
Usage: gh-open [options] [directory]

Open a GitHub repository in your browser. Opens pull requests by default.

Options:
  -p, --print             Just print the URL
  -b, --branch            Open the branch tree (and not the PR)
  -t, --timeout <number>  Set a custom timeout for HTTP requests
  -v, --version           output the version number
  -h, --help              output usage information
```

## Test

```
yarn
yarn test
```
