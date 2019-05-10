module.exports = {
  mode: 'production',
  target: 'webworker',
  entry: './src/index.ts',
  output: {
    filename: 'worker.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
      {
        test: /\.(css|ico)$/,
        loader: 'raw-loader',
      },
    ],
  },
}
