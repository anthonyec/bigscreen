const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
  baseUrl: 'http://lvh.me:8080/',
};

module.exports = {
  target: 'electron-renderer',
  entry: [
    'babel-polyfill',
    './src/index.js',
  ],
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: ['react-hot-loader', 'babel-loader'],
    }, {
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader?&modules&localIdentName=[name]-[local]-[hash:base64:5]',
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
      test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
      use: 'file-loader',
    }, {
      test: /\.(jpe?g|png|ico|gif)$/i,
      use: 'file-loader',
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
  devServer: {
    contentBase: './dist',
    hot: true,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NormalModuleReplacementPlugin(
      /config_test$/,
      './config_development'
    ),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(
        JSON.parse(process.env.NODE_ENV === 'development' || false)
      ),
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
      ),
    }),
    new HtmlWebpackPlugin({
      template: './src/index.hbs',
      inject: false,
      title: 'Bigscreen',
      config,
    }),
  ],
  devtool: 'source-map',
};
