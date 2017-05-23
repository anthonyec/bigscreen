import 'isomorphic-fetch';
import chai from 'chai';
import chaiImmutable from 'chai-immutable';
import chaiAsPromised from 'chai-as-promised';
import jsxChai from 'jsx-chai';
import jsdom from 'jsdom';
import chaiEnzyme from 'chai-enzyme';

const doc = jsdom.jsdom('<!doctype html><html><body></body></html>');
const win = doc.defaultView;

global.document = doc;
global.window = win;
global.window.__DEV__ = false; // eslint-disable-line no-underscore-dangle

// Takes all the properties that the jsdom `window` object contains, such as
// `navigator`, and hoist them on to the Node.js `global` object.
// This is done so that properties provided by `window` can be used without the
// `window.` prefix, which is what would happen in a browser environment. Some
// of the code inside React relies on this
Object.keys(global.window).forEach((key) => {
  if (!(key in global)) {
    global[key] = window[key];
  }
});

chai.use(chaiAsPromised);
chai.use(chaiImmutable);
chai.use(jsxChai);
chai.use(chaiEnzyme());
