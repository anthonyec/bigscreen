import hook from 'css-modules-require-hook';

hook({
  extensions: ['.css'],
  generateScopedName: '[path][name]---[local]---[hash:base64:5]',
  prepend: [
    require('postcss-import'),
    require('postcss-simple-vars'),
  ],
});
