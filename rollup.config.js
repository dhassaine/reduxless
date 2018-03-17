import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import json from "rollup-plugin-json";

export default {
  input: "src/main.js",
  external: ["react", "react-dom", "preact", "inferno-component", "prop-types"],
  output: {
    file: "dist/reduxless.js",
    format: "es"
  },
  plugins: [
    json(),
    resolve(),
    babel({
      exclude: ["node_modules/**"],
      plugins: ["external-helpers"]
    })
  ]
};
