const { useDebugSymbols } = require("./config");

module.exports = {
  plugins: [
    require("autoprefixer")(["> 1%", "last 2 versions", "Firefox ESR"])
  ],
  sourceMap: useDebugSymbols ? "inline" : false
};
