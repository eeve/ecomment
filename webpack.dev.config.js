const path = require('path')

module.exports = {
  mode: 'development',
  devtool: '#cheap-module-source-map',
  context: path.join(__dirname, 'src'),
  entry: './test.js',
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'test.js',
    publicPath: '/dist/',
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
  devServer: {
    port: 3000,
    contentBase: './',
  }
}
