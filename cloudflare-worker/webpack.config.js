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
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
    ],
  },
}
