const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin


module.exports = function override(config) {
  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.alias,
      '@': path.resolve(__dirname, 'src'),
    },
  };
  if (process.env.NODE_ENV === 'development'){
    config.plugins.push(new BundleAnalyzerPlugin());
  }

  if (process.env.NODE_ENV === 'production'){
    config.optimization.splitChunks = {
      chunks: "all",
    };
  }

  return config;
};
