import {parseRegex, parser} from '../src/gh-open';

describe('getFullUrl', () => {
  const normalizedUrl = 'https://github.com/ffflorian/gh-open';

  const testRegex = (str: string, regex: keyof typeof parser) => {
    const match = parseRegex(str, regex);
    const replaced = str.replace(parser[regex], 'https://$1/$2');
    expect(match).toEqual(jasmine.any(String));
    expect(replaced).toBe(normalizedUrl);
  };

  it('converts complete git URLs', () => {
    const gitUrl = 'git@github.com:ffflorian/gh-open.git';
    testRegex(gitUrl, 'fullUrl');
  });

  it('converts git URLs without a suffix', () => {
    const gitUrl = 'git@github.com:ffflorian/gh-open';
    testRegex(gitUrl, 'fullUrl');
  });

  it('converts git URLs without a user', () => {
    const gitUrl = 'github.com:ffflorian/gh-open.git';
    testRegex(gitUrl, 'fullUrl');
  });

  it('converts complete https URLs', () => {
    const gitUrl = 'https://github.com/ffflorian/gh-open.git';
    testRegex(gitUrl, 'fullUrl');
  });

  it('converts https URLs without suffix', () => {
    const gitUrl = 'https://github.com/ffflorian/gh-open';
    testRegex(gitUrl, 'fullUrl');
  });

  it('converts https URLs with a username', () => {
    const gitUrl = 'https://git@github.com/ffflorian/gh-open.git';
    testRegex(gitUrl, 'fullUrl');
  });

  it('converts https URLs with a username and password', () => {
    const gitUrl = 'https://git:password@github.com/ffflorian/gh-open.git';
    testRegex(gitUrl, 'fullUrl');
  });
});
