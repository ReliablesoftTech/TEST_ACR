const { merge } = require("webpack-merge");
const commonConfig = require("./webpack.common.js");
module.exports = merge(commonConfig, {
  mode: "production",
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
});
