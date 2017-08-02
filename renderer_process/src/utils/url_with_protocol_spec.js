import { expect } from 'chai';

import urlWithProtocol from './url_with_protocol';

describe('urlWithProtocol', () => {
  it('prefixes protocol if url does not contain "://" and is not empty', () => {
    const blankString = '      ';
    const url = 'mycoolwebsite.net';
    const fileUrl = 'file:///Users/Mary/Documents';
    const expectedUrl = 'http://mycoolwebsite.net';

    // urlWithProtocol should prefix to this string.
    const result = urlWithProtocol(url);

    // urlWithProtocol should not format these strings.
    const blankResult = urlWithProtocol(blankString);
    const fileResult = urlWithProtocol(fileUrl);

    expect(result).to.equal(expectedUrl);
    expect(blankResult).to.equal(blankString);
    expect(fileResult).to.equal(fileUrl);
  });
});
