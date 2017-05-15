/* eslint no-unused-expressions: 0 */
import { expect } from 'chai';
import nock from 'nock';
import sinon from 'sinon';

import { UnhandledHTTPCodeError } from '../errors/http_errors';
import { daoFetch, formatUrl } from './dao_helpers';
import config from '../core/config';

describe('Dao Helpers', () => {
  describe('formatUrl', () => {
    let clock;

    beforeEach(() => {
      const date = new Date();
      clock = sinon.useFakeTimers(date.getTime());
    });

    it('formats the url', () => {
      const endpoint = '/foo';
      const timestamp = (new Date()).getTime();
      let expected = 'http://lvh.me:3000/foo' +
        `?_ts=${timestamp}`;
      expect(formatUrl(endpoint)).to.equal(expected);

      const id = '1234';
      expected = 'http://lvh.me:3000/foo/1234' +
        `?_ts=${timestamp}`;
      expect(formatUrl(endpoint, id)).to.equal(expected);

      const params = { fizz: 'buzz', 'blah bleh': 'meh' };
      expected = 'http://lvh.me:3000/foo/1234' +
        '?fizz=buzz&blah bleh=meh' +
        `&_ts=${timestamp}`;
      expect(formatUrl(endpoint, id, params)).to.equal(expected);

      expected = 'http://lvh.me:3000/foo' +
        '?fizz=buzz&blah bleh=meh' +
        `&_ts=${timestamp}`;
      expect(formatUrl(endpoint, null, params)).to.equal(expected);
    });

    afterEach(() => {
      clock.restore();
    });
  });

  describe('daoFetch', () => {
    describe('before fetch is called', () => {
      let fetchStub;

      beforeEach(() => {
        fetchStub = sinon.stub(global, 'fetch');
        fetchStub.returns(new Promise(() => {}));
      });

      it('sets the correct headers and stringify the body', () => {
        const url = formatUrl('/foo');
        const method = 'POST';
        const opts = { body: { foo: 'bar', fizz: 'buzz' }, method };
        const expected = [url, {
          method,
          body: '{"foo":"bar","fizz":"buzz"}',
          headers: {
            Accept: 'application/json',
            'Content-type': 'application/json',
          },
        }];
        daoFetch(url, opts);
        expect(fetchStub.calledOnce).to.be.true;
        expect(fetchStub.args[0]).to.eql(expected);
      });

      afterEach(() => {
        fetchStub.restore();
      });
    });

    describe('fetch results', () => {
      let clock;

      beforeEach(() => {
        const date = new Date();
        clock = sinon.useFakeTimers(date.getTime());
      });

      it('parses the json string', (done) => {
        const urlToMock = formatUrl('/foo');
        nock(config.apiBaseUrl)
          .get('/foo')
          .query({ _ts: new Date().getTime() })
          .reply(200, { foo: 'bar', fizz: 'buzz' });

        daoFetch(urlToMock).then((obj) => {
          expect(obj).to.eql({ foo: 'bar', fizz: 'buzz' });
          done();
        }).catch(done);
      });

      it('handles codes that are not 200', (done) => {
        const urlToMock = formatUrl('/foo');
        nock(config.apiBaseUrl)
          .get('/foo')
          .query({ _ts: new Date().getTime() })
          .reply(400, { message: 'Error message' });
        daoFetch(urlToMock).catch((err) => {
          expect(err instanceof UnhandledHTTPCodeError).to.be.true;
        }).then(done, done);
      });

      afterEach(() => {
        clock.restore();
      });
    });
  });
});
