const path = require('path');
const CleanPlugin = require("clean-webpack-plugin");

module.exports = {
  entry: './src/app.ts', // Starting file
  mode: "production",
  output: { //Output 
    filename: 'bundle.js', //Contenthash for a unique hash which we can then use for caching
    path: path.resolve(__dirname, 'dist'),
  },
  //devtool: '(none)', // To properly wire webpack to bundle so that we can then debug
  module: { // For telling webpack that it should compile ts->js using tsloader
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  devServer: { // Addition settings for webpack-dev-server to work
    static: path.resolve(__dirname, '.'),
    devMiddleware: {
      publicPath: '/dist'
    }
  },
  resolve: { // For telling webpack that it should look for both ts and js imports and exports
    extensions: ['.ts', '.js']
  },
  plugins: [
    new CleanPlugin.CleanWebpackPlugin()
  ]
}