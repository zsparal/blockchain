const path = require("path");
const dotenv = require("dotenv");

const { parseInt } = require("./util");

dotenv.config();

// Paths
const app = path.join(".", "src");
const build = "./dist";
const paths = {
  app,
  build,
  static: path.join(app, "assets", "static"),
  indexTs: path.join(app, "index.tsx"),
  indexHtml: path.join(app, "assets", "index.ejs"),
  public: "/"
};

// Dev server
const port = parseInt(process.env.PORT, 3000);
const devServer = {
  port,
  address: `http://localhost:${port}`,
  apiServer: process.env.API_SERVER || `http://localhost:4200`
};

// Env
const isDev = process.env.NODE_ENV === "development";
const isProd = process.env.NODE_ENV === "production";
const analyze = !!process.env.ANALYZE;
const env = {
  isDev,
  isProd,
  analyze
};

module.exports = {
  paths,
  devServer,
  env,
  useDebugSymbols: isDev || analyze
};
