/* eslint no-unused-expressions: 0 */
import { expect } from 'chai';
import ReactDOM from 'react-dom';
import sinon from 'sinon';

import { init } from './app';

describe('App component', () => {
  describe('init', () => {
    let renderStub;

    beforeEach(() => {
      renderStub = sinon.stub(ReactDOM, 'render');
    });

    it('initialises the app and renders the App Component', () => {
      init();
      expect(renderStub.calledOnce).to.be.true;
    });

    afterEach(() => {
      renderStub.restore();
    });
  });
});
