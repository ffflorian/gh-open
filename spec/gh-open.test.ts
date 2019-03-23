import {parseRegex, parser} from '../src/gh-open';

describe('getFullUrl', () => {
  const normalizedUrl = 'https://github.com/ffflorian/gh-open';

  const testRegex = (str: string) => {
    const match = parseRegex(str, 'fullUrl');
    expect(match).toEqual(jasmine.any(String));
    const replaced = str.replace(parser.fullUrl.regex, 'https://$1/$2');
    expect(replaced).toBe(normalizedUrl);
  };

  it('converts complete git URLs', () => {
    const gitUrl = 'git@github.com:ffflorian/gh-open.git';
    testRegex(gitUrl);
  });

  it('converts git URLs without a suffix', () => {
    const gitUrl = 'git@github.com:ffflorian/gh-open';
    testRegex(gitUrl);
  });

  it('converts git URLs without a user', () => {
    const gitUrl = 'github.com:ffflorian/gh-open.git';
    testRegex(gitUrl);
  });

  it('converts complete https URLs', () => {
    const gitUrl = 'https://github.com/ffflorian/gh-open.git';
    testRegex(gitUrl);
  });

  it('converts https URLs without suffix', () => {
    const gitUrl = 'https://github.com/ffflorian/gh-open';
    testRegex(gitUrl);
  });

  it('converts https URLs with a username', () => {
    const gitUrl = 'https://git@github.com/ffflorian/gh-open.git';
    testRegex(gitUrl);
  });

  it('converts https URLs with a username and password', () => {
    const gitUrl = 'https://git:password@github.com/ffflorian/gh-open.git';
    testRegex(gitUrl);
  });
});

describe('parseGitConfig', () => {
  const rawUrl = 'git@github.com:ffflorian/gh-open.git';

  const testRegex = (str: string) => {
    const match = parseRegex(str, 'rawUrl');
    expect(match).toBe(rawUrl);
  };

  it('converts a normal git config', () => {
    const gitConfig = `[remote "origin"]
    url = git@github.com:ffflorian/gh-open.git
    fetch = +refs/heads/*:refs/remotes/origin/*
[branch "master"]
    remote = origin
    merge = refs/heads/master`;
    testRegex(gitConfig);
  });

  describe('parseGitBranch', () => {
    const testRegex = (str: string, result: string) => {
      const match = parseRegex(str, 'gitBranch');
      expect(match).toBe(result);
    };

    it('detects the master branch', () => {
      const rawBranch = 'master';
      const gitHead = 'ref: refs/heads/master\n';
      testRegex(gitHead, rawBranch);
    });

    it('detects a branch with a slash', () => {
      const rawBranch = 'fix/regex';
      const gitHead = 'ref: refs/heads/fix/regex\n';
      testRegex(gitHead, rawBranch);
    });
  });
});
