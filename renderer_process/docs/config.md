# Config files

## Webpack files

There are 3 webpack configuration files, one per environment we are targetting:

- development: `webpack.config.js` (default file loaded by webpack when no
  other configuration file is specified)
- staging: `webpack.staging.config.js`
- production: `webpack.production.config.js`

Differences between the files:

- development:
  * implements the react hot loader and the webpack-dev-server
  * no minification
- staging:
  * does not implement the react hot loader and the webpack-dev-server
  * no minification
- production:
  * does not implement the react hot loader and the webpack-dev-server
  * minification

## Application files

Inside the application we also have different configuration files per
environment we are targetting:

- test: `src/core/config_test.js`
- development: `src/core/config_development.js`
- staging: `src/core/config_staging.js`
- production: `src/core/config_production.js`

Inside the code you will never refer to these files and always import the main
configuration file(`src/core/config.js`).

By default the main config file is always importing the **test** configuration
files. However, when you are building the app, the test configuration file
won't be loaded. It will be replaced during the build phase by the file
specified in the webpack configuration file you are using.

This is possible thanks to the `NormalModuleReplacementPlugin`. Example:

```
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /config_test$/,
      './config_development'
    ),
  ],
```
