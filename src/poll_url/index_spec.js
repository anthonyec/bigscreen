const fs = require('fs');

const { expect } = require('chai');
const sinon = require('sinon');
const Chance = require('chance');
const request = require('request');

const poll = require('./');

const chance = new Chance();

describe('Poll URL', () => {
  let sandbox;

  beforeEach(() => {
    // Create sandbox to make it easier restore every stub after each test.
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('check if a URL uses the file URI scheme', () => {
    const randomURL = chance.url();
    const randomFileURL = chance.url({ protocol: 'file' });
    const containingBoth = `${randomURL}${randomFileURL}`;

    expect(poll.isFileURIScheme(randomURL)).to.equal(false);
    expect(poll.isFileURIScheme(randomFileURL)).to.equal(true);
    expect(poll.isFileURIScheme(containingBoth)).to.equal(false);
  });

  it('removes file URI scheme from string', () => {
    const url = 'http://signal-noise.co.uk';
    const fileURL = 'file:///Users/Anthony/Desktop';
    const containingBoth = `${url}${fileURL}`;

    const expectedURLResult = 'http://signal-noise.co.uk';
    const expectedFileResult = '/Users/Anthony/Desktop';
    const expectedBothResult =
      'http://signal-noise.co.ukfile:///Users/Anthony/Desktop';

    expect(poll.removeFileURIScheme(url)).to.equal(expectedURLResult);
    expect(poll.removeFileURIScheme(fileURL)).to.equal(expectedFileResult);
    expect(poll.removeFileURIScheme(containingBoth)).to.equal(
      expectedBothResult
    );
  });

  it('checkFileExists calls the correct callbacks depending on if the file exist', () => { // eslint-disable-line
    const statStub = sandbox.stub(fs, 'stat');
    const successStub = sandbox.stub();
    const failedStub = sandbox.stub();
    const removeFileURISchemeSpy = sandbox.spy(poll, 'removeFileURIScheme');

    const fileURL = chance.url({ protocol: 'file' });

    // Pretend the file stats were retrived without an error.
    statStub.callsFake((url, callback) => {
      callback();
    });

    // Check the file.
    poll.checkFileExists(fileURL, successStub, failedStub);

    // Pretend the file stats caused an error.
    statStub.callsFake((url, callback) => {
      callback('error');
    });

    // Check the file again hoping it errors.
    poll.checkFileExists(fileURL, successStub, failedStub);

    expect(successStub.calledOnce).to.equal(true);
    expect(failedStub.calledOnce).to.equal(true);
    expect(removeFileURISchemeSpy.calledTwice).to.equal(true);
  });

  it('checkRequestExists calls the correct callbacks depending on if the URL can be retrived', () => { // eslint-disable-line
    const requestStub = sandbox.stub(request, 'get');
    const successStub = sandbox.stub();
    const failedStub = sandbox.stub();

    const randomURL = chance.url();

    // Pretend connecting to the URL did not cause an error.
    requestStub.callsFake((url, callback) => {
      callback();
    });

    // Check the URL.
    poll.checkRequestExists(randomURL, successStub, failedStub);

    // Pretend connecting to the URL did cause an error.
    requestStub.callsFake((url, callback) => {
      callback('error');
    });

    // Check the URL again, hoping it errors.
    poll.checkRequestExists(randomURL, successStub, failedStub);

    expect(successStub.calledOnce).to.equal(true);
    expect(failedStub.calledOnce).to.equal(true);
  });

  it('poll calls the correct checking method', () => {
    const randomURL = chance.url();
    const randomFileURL = chance.url({ protocol: 'file' });

    poll.poll(randomURL);
  });

  it('retry callback can be called', () => {

  });
});
