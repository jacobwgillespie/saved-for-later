module.exports = {
  mode: 'production',
  target: 'web',
  entry: './static-site/app.ts',
  output: {
    path: `${__dirname}/../public`,
    filename: 'app.js',
  },
  resolve: {
    extensions: ['.ts', '.js', '.mjs'],
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
