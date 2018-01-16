import babel from "rollup-plugin-babel";
import pkg from "./package.json";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";

export default [
  {
    input: "src/main.js",
    external: [
      "react",
      "react-dom",
      "preact",
      "inferno-component",
      "prop-types"
    ],
    dest: pkg.browser,
    format: "umd",
    moduleName: "reduxless",
    plugins: [
      json(),
      resolve(),
      commonjs(),
      babel({
        exclude: ["node_modules/**"]
      })
    ]
  },
  {
    input: "src/main.js",
    external: ["react", "react-dom", "preact", "inferno-component"],
    targets: [
      { dest: pkg.main, format: "cjs" },
      { dest: pkg.module, format: "es" }
    ],
    plugins: [
      babel({
        exclude: ["node_modules/**"]
      })
    ]
  }
];
