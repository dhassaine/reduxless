import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import json from "rollup-plugin-json";
import minify from "rollup-plugin-babel-minify";

const base = {
  input: "src/main.js",
  external: ["react", "react-dom", "preact", "inferno-component", "prop-types"]
};

const plugins = [
  json(),
  resolve(),
  babel({
    exclude: ["node_modules/**"],
    plugins: ["external-helpers"]
  })
];

export default [
  {
    ...base,
    output: {
      file: "dist/reduxless.esm.js",
      format: "es"
    },
    plugins
  },
  {
    ...base,
    output: {
      file: "dist/reduxless.js",
      format: "cjs"
    },
    plugins
  },
  {
    ...base,
    output: {
      file: "dist/reduxless.min.js",
      format: "cjs"
    },
    plugins: [...plugins, minify({ comments: false, sourceMap: false })]
  }
];
