const config = require('./config');
const path = require('path');
const webpack = require('webpack');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const notifier = require('node-notifier');

const jsName = 'assets/js/build.[hash].js';
const cssName = 'assets/css/[name].[contenthash].css';
const imagesName = 'assets/images/[name].[hash].[ext]';

const isDevelopment = !process.env.NODE_ENV
  || process.env.NODE_ENV === 'development';

module.exports = {
  entry: `${config.srcDir}/main.js`,

  output: {
    path: path.resolve(__dirname, config.distDir),
    publicPath: '/',
    filename: jsName
  },

  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
            // the "scss" and "sass" values for the lang attribute to the right configs here.
            // other preprocessors should work out of the box, no loader config like this necessary.
            'scss': 'vue-style-loader!css-loader!sass-loader',
            'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax'
          }
          // other vue-loader options go here
        }
      },

      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },

      {
        test: /\.(png|jpe?g|gif|svg)$/,
        loader: 'url-loader',
        options: {
          limit: isDevelopment ? 1 : 4096,
          name: imagesName,
          fallback: 'file-loader'
        }
      },

      {
        test: /\.scss/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [{
            loader: 'css-loader',
            options: { sourceMap: true }
          }, {
            loader: 'resolve-url-loader',
            options: { root: config.srcDir, sourceMap: true }
          }, {
            loader: 'sass-loader',
            options: { sourceMap: true }
          }]
        })
      }
    ]
  },

  plugins: [
    new FriendlyErrorsWebpackPlugin({
      onErrors: (severity, errors) => {
        if (severity !== 'error') return;
        errors.forEach(error => {
          notifier.notify({
            title: error.name,
            message: error.message,
            subtitle: error.file || ''
          });
        });
      }
    }),
    new CleanWebpackPlugin(config.distDir),
    new webpack.NoEmitOnErrorsPlugin(),
    new ExtractTextPlugin(cssName),
    new HtmlWebpackPlugin({
      template: `${config.srcDir}/index.html`,
      filename: 'index.html',
      minify: { collapseWhitespace: true }
    })
  ],

  devServer: {
    historyApiFallback: true,
    noInfo: true,
    quiet: true,
    compress: true,
    proxy: {
      '/api': `http://localhost:${config.port}`
    }
  },

  performance: {
    hints: false
  },

  devtool: isDevelopment ? '#cheap-inline-module-source-map' : 'none'
};

//
// Production section
//

if (!isDevelopment) {
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),

    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),

    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ]);
}