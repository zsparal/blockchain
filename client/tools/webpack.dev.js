const webpack = require("webpack");

const { devServer, paths, useDebugSymbols } = require("./config");
const { resolveAbsolute } = require("./util");

const base = require("./webpack.base");
const loaders = require("./webpack/loaders");

module.exports = Object.assign({}, base, {
  entry: {
    app: [resolveAbsolute(paths.indexTs)]
  },
  devServer: {
    historyApiFallback: true,
    contentBase: paths.build,
    port: devServer.port,
    noInfo: true
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
        use: [
          {
            loader: "style-loader",
            options: { sourceMap: useDebugSymbols }
          }
        ].concat(loaders.scss)
      },
      {
        test: /\.css$/,
        use: ["style-loader"].concat(loaders.css)
      }
    ])
  },
  plugins: base.plugins.concat([
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NamedChunksPlugin()
  ])
});
