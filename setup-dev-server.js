const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const clientConfig = require('./webpack.client.config');
const serverConfig = require('./webpack.server.config');
const MemoryFileSystem = require('memory-fs');

function setupDevServer(app, updateCallback) {
  let serverBundle, clientManifest;
  const clientCompiler = webpack(clientConfig);
  const serverCompiler = webpack(serverConfig);

  // Utilities
  function update() {
    updateCallback({
      serverBundle,
      clientManifest
    });
  }

  function readFileSync(fs, filename) {
    try {
      const pathToFile = path.join(clientConfig.output.path, filename);
      return JSON.parse(fs.readFileSync(pathToFile, 'utf-8'));
    } catch (e) {
      console.error('An error occured white trying to read the file.');
    }
  }

  // 0. Watch template file


  // 1. Watch client bundle
  clientConfig.entry = [
    clientConfig.entry,
    'webpack-hot-middleware/client'
  ];

  clientConfig.plugins.push(
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  );

  const webpackDevMiddlewareInstance = webpackDevMiddleware(clientCompiler, {
    publicPath: clientConfig.output.publicPath
  });

  const webpackHotMiddlewareInstance = webpackHotMiddleware(clientCompiler);

  app.use(webpackDevMiddlewareInstance);
  app.use(webpackHotMiddlewareInstance);

  clientCompiler.plugin('done', stats => {
    stats = stats.toJson();
    stats.errors.forEach(console.error);
    stats.warnings.forEach(console.warn);

    clientManifest = readFileSync(
      webpackDevMiddlewareInstance.fileSystem,
      'vue-ssr-client-manifest.json'
    );

    update();
  });

  // 2. Watch server bundle
  const MFS = new MemoryFileSystem();
  serverCompiler.outputFileSystem = MFS;

  serverCompiler.watch({}, (err, stats) => {
    if (err) throw err;
    stats = stats.toJson();
    stats.errors.forEach(console.error);
    stats.warnings.forEach(console.warn);

    serverBundle = readFileSync(MFS, 'vue-ssr-server-bundle.json');

    update();
  });
}

module.exports = setupDevServer;
