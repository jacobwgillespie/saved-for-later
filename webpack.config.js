require('dotenv/config')
const webpack = require('webpack')

module.exports = {
  mode: 'production',
  target: 'webworker',
  entry: './src/index.ts',
  output: {
    path: `${__dirname}/worker`,
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
      FEEDBIN_API_KEY: JSON.stringify(process.env.FEEDBIN_API_KEY),
      TWITTER_API_KEY: JSON.stringify(process.env.TWITTER_API_KEY),
    }),
  ],
}
