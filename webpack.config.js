require('dotenv/config')
const webpack = require('webpack')

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
        test: /\.(css)$/,
        use: ['raw-loader', {loader: 'clean-css-loader', options: {level: 2}}],
      },
      {
        test: /\.(png)$/,
        loader: 'url-loader',
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
      FEEDBIN_API_KEY: JSON.stringify(process.env.FEEDBIN_API_KEY),
    }),
  ],
}
