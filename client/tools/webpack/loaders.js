const { useDebugSymbols } = require("../config");

const css = [
  {
    loader: "css-loader",
    options: { sourceMap: useDebugSymbols, importLoaders: 1 }
  }
];

const scss = css.concat([
  "resolve-url-loader",
  {
    loader: "postcss-loader",
    options: require("../postcss.config")
  },
  {
    loader: "sass-loader",
    options: { sourceMap: useDebugSymbols }
  }
]);

const ts = [
  {
    loader: "babel-loader"
  },
  {
    loader: "ts-loader",
    options: { transpileOnly: true }
  }
];

module.exports = {
  css,
  scss,
  ts
};
