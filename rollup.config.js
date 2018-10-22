import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import json from "rollup-plugin-json";
import minify from "rollup-plugin-babel-minify";
import typescript from "rollup-plugin-typescript2";

const plugins = [
  json(),
  resolve(),
  typescript({
    useTsconfigDeclarationDir: true,
    tsconfig: "tsconfig.json"
  }),
  babel({
    exclude: ["node_modules/**"],
    plugins: ["external-helpers"]
  })
];

export default [
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.esm.js",
      format: "es"
    },
    sourcemap: true,
    plugins
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "cjs"
    },
    sourcemap: true,
    plugins
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.min.js",
      format: "cjs"
    },
    plugins: [...plugins, minify({ comments: false, sourceMap: false })]
  }
];
