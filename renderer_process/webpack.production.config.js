const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
  baseUrl: '',
};

module.exports = {
  entry: [
    'babel-polyfill',
    './src/index.js',
  ],
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: 'babel-loader',
    }, {
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'postcss-loader',
          options: {
            plugins: () => [
              require('postcss-import'),
              require('postcss-simple-vars'),
            ],
          },
        },
      ],
    }, {
      test: /\.(ttf|eot|svg|woff2?)$/,
      use: 'url-loader',
    }, {
      test: /\.hbs$/,
      use: 'handlebars-loader',
    }],
  },
  resolve: {
    extensions: ['.js', '.json', '.jsx'],
    modules: ['node_modules', path.resolve(__dirname, 'src')],
  },
  output: {
    path: path.resolve(__dirname, 'dist'), // eslint-disable-line
    publicPath: config.baseUrl,
    filename: 'bundle.js',
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } }),
    new webpack.NormalModuleReplacementPlugin(
      /config_test$/,
      './config_production'
    ),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(
        JSON.parse(process.env.NODE_ENV === 'development' || false)
      ),
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'production'
      ),
    }),
    new HtmlWebpackPlugin({
      template: './src/index.hbs',
      inject: false,
      title: 'REPLACE_THIS',
      config,
    }),
  ],
};
