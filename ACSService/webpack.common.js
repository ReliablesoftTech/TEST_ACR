const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src", "Middleware", "private.pem"),
          to: path.resolve(__dirname, "build"),
        },
        {
          from: path.resolve(__dirname, ".env"),
          to: path.resolve(__dirname, "build"),
        },
      ],
    }),
  ],
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname + "/build"),
    publicPath: "/",
    filename: "bundle.js",
    clean: true,
    libraryTarget: "commonjs2",
  },
  target: "node",
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        include: [path.resolve(__dirname, "src")],
        use: ["babel-loader"],
      },
    ],
  },
  externalsPresets: { node: true },
  externals: [nodeExternals()],
  optimization: {
    splitChunks: {
      chunks: "async",
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
