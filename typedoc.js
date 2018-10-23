const path = require("path");

module.exports = {
  mode: "file",
  name: "@reduxless/core",
  out: path.resolve(__dirname, "docs"),
  include: path.resolve(__dirname, "src"),
  excludeExternals: true,
  excludePrivate: true,
  excludeProtected: true
};
