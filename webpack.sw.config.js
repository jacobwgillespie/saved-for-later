const webpack = require('webpack')

module.exports = {
  mode: 'production',
  target: 'webworker',
  entry: './src/service-worker.ts',
  output: {
    path: `${__dirname}/dist`,
    filename: 'service-worker.js',
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
      {
        test: /\.(css)$/,
        use: ['raw-loader', {loader: 'clean-css-loader', options: {level: 2}}],
      },
      {
        test: /\.(png)$/,
        loader: 'raw-loader',
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
      DEBUG: JSON.stringify(!!process.env.DEBUG),
    }),
  ],
}
