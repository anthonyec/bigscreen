/* eslint no-unused-expressions: 0 */
import { expect } from 'chai';
import sinon from 'sinon';

describe('Project Specs - REMOVE ME WHEN STARTING THE PROJECT', () => {
  describe('async/awaits', () => {
    const noop = () => {};
    const delay = async (str, t, spy = noop) => {
      return new Promise((resolve) => setTimeout(() => {
        spy();
        resolve(str);
      }, t));
    };

    it('works', async () => {
      const str = await delay('foo', 10);
      expect(str).to.equal('foo');
    });

    it('allows parallel execution', async () => {
      // call without await: the execution will continue and both call will
      // happen in parallel
      const fooSpy = sinon.spy();
      const barSpy = sinon.spy();
      const fooCall = delay('foo', 100, fooSpy);
      const barCall = delay('bar', 10, barSpy);

      expect(fooSpy.called).to.be.false;
      expect(barSpy.called).to.be.false;

      // await to get the value returned by 'fooCall`
      // The execution after that line gets blocked for 100ms but everything
      // above is still running
      const foo = await fooCall;

      // `fooCall` was longer than `barCall` so both should have completed and
      // we can check if the 2 spies have been called.
      expect(foo).to.equal('foo');
      expect(fooSpy.calledOnce).to.be.true;
      expect(barSpy.calledOnce).to.be.true;

      // Now we can also get the value returned asynchronously by barCall
      const bar = await barCall;

      expect(bar).to.equal('bar');
    });

    it('allows serial execution', async () => {
      // call with await: the execution will get stoped till we get the value
      // happen in parallel
      const fooSpy = sinon.spy();
      const barSpy = sinon.spy();
      const foo = await delay('foo', 100, fooSpy);

      // The execution has been blocked so nothing below has been executed
      expect(fooSpy.called).to.be.true;
      expect(barSpy.called).to.be.false;
      expect(foo).to.equal('foo');

      const bar = await delay('bar', 10, barSpy);

      expect(barSpy.calledOnce).to.be.true;
      expect(bar).to.equal('bar');
    });
  });
});
