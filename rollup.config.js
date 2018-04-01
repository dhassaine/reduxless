import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import json from "rollup-plugin-json";
import minify from "rollup-plugin-babel-minify";

const base = {
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
    input: "src/index.js",
    output: {
      file: "dist/reduxless.esm.js",
      format: "es"
    },
    plugins
  },
  {
    ...base,
    input: "src/index.js",
    output: {
      file: "dist/reduxless.js",
      format: "cjs"
    },
    plugins
  },
  {
    ...base,
    input: "src/index.js",
    output: {
      file: "dist/reduxless.min.js",
      format: "cjs"
    },
    plugins: [...plugins, minify({ comments: false, sourceMap: false })]
  },
  {
    ...base,
    input: "src/react/index.js",
    output: {
      file: "react.js",
      format: "cjs"
    },
    plugins
  },

  {
    ...base,
    input: "src/react/index.js",
    output: {
      file: "react.esm.js",
      format: "es"
    },
    plugins
  },

  {
    ...base,
    input: "src/preact/index.js",
    output: {
      file: "preact.js",
      format: "cjs"
    },
    plugins
  },

  {
    ...base,
    input: "src/preact/index.js",
    output: {
      file: "preact.esm.js",
      format: "es"
    },
    plugins
  }
];
