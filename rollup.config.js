import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";

export default {
  input: "src/main.js",
  external: ["react", "react-dom", "preact", "inferno-component", "prop-types"],
  output: {
    file: "dist/reduxless.js",
    format: "cjs"
  },
  plugins: [
    json(),
    resolve(),
    commonjs(),
    babel({
      exclude: ["node_modules/**"]
    })
  ]
};
