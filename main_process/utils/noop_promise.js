module.exports = exports = function noopPromise() {
  return new Promise((resolve) => { // reject
    resolve();
  });
};
