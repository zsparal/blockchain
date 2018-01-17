const webpack = require("webpack");
const CleanPlugin = require("clean-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const SriPlugin = require("webpack-subresource-integrity");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const { env, paths, useDebugSymbols } = require("./config");
const { resolveAbsolute } = require("./util");

const base = require("./webpack.base");
const loaders = require("./webpack/loaders");

const vendorCss = new ExtractTextPlugin(
  useDebugSymbols ? "vendor.css" : "vendor.[contenthash:8].css"
);

const appCss = new ExtractTextPlugin(useDebugSymbols ? "app.css" : "app.[contenthash:8].css");

module.exports = Object.assign({}, base, {
  entry: {
    app: [resolveAbsolute(paths.indexTs)]
  },
  module: {
    rules: base.module.rules.concat([
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: loaders.ts
      },
      {
        test: /\.scss$/,
        use: appCss.extract({
          fallback: "style-loader",
          use: loaders.scss
        })
      },
      {
        test: /\.css$/,
        use: vendorCss.extract({
          fallback: "style-loader",
          use: loaders.css
        })
      }
    ])
  },
  plugins: base.plugins
    .concat([
      new webpack.HashedModuleIdsPlugin(),
      new CleanPlugin([paths.build], {
        root: process.cwd(),
        verbose: false
      }),
      new UglifyJsPlugin({
        sourceMap: useDebugSymbols,
        uglifyOptions: {
          compress: {
            drop_console: true,
            hoist_props: true,
            passes: 2,
            toplevel: true
          },
          mangle: true,
          extractComments: true
        }
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
      vendorCss,
      appCss,
      new SriPlugin({
        enabled: true,
        hashFuncNames: ["sha256", "sha512"]
      })
    ])
    .concat(
      env.analyze
        ? [
            new BundleAnalyzerPlugin({
              analyzerMode: "static",
              openAnalyzer: false,
              generateStatsFile: true
            })
          ]
        : []
    )
});
