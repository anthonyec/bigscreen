import { expect } from 'chai';

import { getQueryString } from './query_parameters';

describe('Query parameters module', () => {
  describe('getQueryString', () => {
    it('generates a query string from an object', () => {
      const obj = { foo: 'bar', url: 'http://google.com' };
      const expected = '?foo=bar&url=http%3A%2F%2Fgoogle.com';
      const result = getQueryString(obj);

      expect(result).to.equal(expected);
    });
  });
});
