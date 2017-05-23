import { expect } from 'chai';

import {
  HTTPError,
  BadRequestError,
  UnhandledHTTPCodeError,
  NetworkError,
} from './http_errors';

describe('Http Errors', () => {
  const errors = {
    foo: { bar: 'aaa' },
    fizz: { message: 'buzz' },
    blah: { name: 'bleh' },
  };

  describe('HTTPError', () => {
    let err;
    let expected;

    beforeEach(() => {
      err = new HTTPError('400', errors, 'Bad Request');

      expected = {
        errors,
        message: 'Bad Request',
        name: 'HTTPError',
        status: 400,
      };
    });

    it('assigns all the properties passed', () => {
      expect(err.errors).to.eql(errors);
      expect(err.name).to.equal('HTTPError');
      expect(err.message).to.equal('Bad Request');
      expect(err.status).to.equal(400);
    });

    it('has a nice toJson method', () => {
      const str = JSON.stringify(err);
      const obj = JSON.parse(str);

      expect(obj).to.eql(expected);
    });
  });

  describe('BadRequestError', () => {
    let err;
    let expected;

    beforeEach(() => {
      err = new BadRequestError(errors);

      expected = {
        errors,
        message: 'Bad Request',
        name: 'BadRequestError',
        status: 400,
      };
    });

    it('should assign all the properties passed', () => {
      expect(err.errors).to.eql(errors);
      expect(err.name).to.equal('BadRequestError');
      expect(err.message).to.equal('Bad Request');
      expect(err.status).to.equal(400);
    });

    it('should have a nice toJSON method', () => {
      const str = JSON.stringify(err);
      const obj = JSON.parse(str);

      expect(obj).to.eql(expected);
    });
  });

  describe('UnhandledHTTPCodeError', () => {
    let err;
    let expected;

    beforeEach(() => {
      err = new UnhandledHTTPCodeError(errors);

      expected = {
        errors,
        message: 'Unhandled HTTP Code',
        name: 'UnhandledHTTPCodeError',
        status: -1,
      };
    });

    it('should assign all the properties passed', () => {
      expect(err.errors).to.eql(errors);
      expect(err.name).to.equal('UnhandledHTTPCodeError');
      expect(err.message).to.equal('Unhandled HTTP Code');
      expect(err.status).to.equal(-1);
    });

    it('should have a nice toJSON method', () => {
      const str = JSON.stringify(err);
      const obj = JSON.parse(str);

      expect(obj).to.eql(expected);
    });
  });

  describe('NetworkError', () => {
    let err;
    let expected;

    beforeEach(() => {
      err = new NetworkError(errors);

      expected = {
        errors,
        message: 'Network Error',
        name: 'NetworkError',
      };
    });

    it('should assign all the properties passed', () => {
      expect(err.errors).to.eql(errors);
      expect(err.name).to.equal('NetworkError');
      expect(err.message).to.equal('Network Error');
    });

    it('should have a nice toJSON method', () => {
      const str = JSON.stringify(err);
      const obj = JSON.parse(str);

      expect(obj).to.eql(expected);
    });
  });
});
