module.exports = {
  mode: 'production',
  target: 'webworker',
  entry: './src/index.ts',
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
