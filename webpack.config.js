const path = require('path')
const webpack = require('webpack')

module.exports = {
  mode: 'production',
  devtool: false,
  context: path.join(__dirname, 'src'),
  entry: './ecomment.js',
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'ecomment.browser.js',
    libraryTarget: 'umd',
    library: 'ecomment'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /^node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ]
}
