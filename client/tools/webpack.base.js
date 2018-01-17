const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlPlugin = require("html-webpack-plugin");
const ForkChecker = require("fork-ts-checker-webpack-plugin");
const StyleLintPlugin = require("stylelint-webpack-plugin");

const manifest = require("../src/assets/static/manifest");
const { env, paths, useDebugSymbols } = require("./config");
const { resolveAbsolute } = require("./util");

module.exports = {
  devtool: useDebugSymbols ? "source-map" : undefined,
  output: {
    path: resolveAbsolute(paths.build),
    filename: useDebugSymbols ? "[name].js" : "[name].[chunkhash:8].js",
    chunkFilename: useDebugSymbols ? "[name].chunk.js" : "[name].[chunkhash:8].chunk.js",
    jsonpFunction: "J",
    crossOriginLoading: "anonymous",
    publicPath: paths.public
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
    modules: ["node_modules", resolveAbsolute(paths.app)]
  },
  module: {
    rules: [
      {
        test: /\.(woff|woff2|eot|ttf)$/i,
        use: "file-loader"
      },
      {
        test: /\.(gif|png|jpe?g|svg|webm)$/i,
        use: "url-loader"
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": `"${process.env.NODE_ENV}"`
    }),
    new webpack.ContextReplacementPlugin(
      /moment[\\\/]locale$/,
      /^\.\/(de|hu|pt|es|fr|ja|ru|pl|zh-hk)/
    ),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: ({ resource }) => /node_modules/.test(resource)
    }),
    new webpack.optimize.CommonsChunkPlugin("manifest"),
    new CopyPlugin([{ from: paths.static }]),
    new HtmlPlugin({
      inject: false,
      minify: env.isProd
        ? {
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeOptionalTags: true
          }
        : null,
      template: paths.indexHtml,
      publicPath: paths.public,
      meta: [
        {
          name: "description",
          content: manifest.description
        }
      ],
      title: manifest.name
    }),
    new ForkChecker({
      tslint: true,
      async: env.isDev,
      formatter: "codeframe",
      workers: Math.max(1, require("os").cpus().length / 2 - 1)
    }),
    new StyleLintPlugin({
      emitErrors: env.isProd,
      syntax: "scss",
      quiet: !env.isProd
    })
  ]
};
