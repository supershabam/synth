var webpack = require('webpack')

module.exports = {
  context: __dirname + "/src",
  entry: "./entry.jsx",
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js"
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: '6to5-loader'},
      { test: /\.jsx$/, exclude: /node_modules/, loaders: ['jsx-loader', '6to5-loader']}
    ]
  },
  plugins: [
    // new webpack.HotModuleReplacementPlugin(),
    // new webpack.NoErrorsPlugin()
  ]
}
