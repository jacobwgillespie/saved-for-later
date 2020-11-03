const PnpWebpackPlugin = require(`pnp-webpack-plugin`)

module.exports = {
  mode: 'production',
  target: 'webworker',
  entry: './cloudflare-worker/index.ts',
  output: {
    path: `${__dirname}/../worker`,
    filename: 'script.js',
  },
  resolve: {
    extensions: ['.ts', '.js', '.mjs'],
    plugins: [PnpWebpackPlugin],
  },
  resolveLoader: {
    plugins: [PnpWebpackPlugin.moduleLoader(module)],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: require.resolve('ts-loader'),
      },
    ],
  },
}
