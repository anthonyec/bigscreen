# Babel Polyfill

Babel Polyfill can be useful when you need to support IE9+.

The documentation about Babel Polyfill can be found 
[here](https://babeljs.io/docs/usage/polyfill/).

The best way to include the polyfill is to add it as the first item in your 
`entry` array **in the 3 webpack configuration files**.

- You can optimise your build by only adding as entry points the polyfill you 
  need. Check [https://github.com/zloirock/core-js#commonjs](https://github.com/zloirock/core-js#commonjs) 
  to see how to require specific polyfills.
