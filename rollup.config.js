import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import json from "rollup-plugin-json";
import minify from "rollup-plugin-babel-minify";
import typescript from "rollup-plugin-typescript2";

const base = {
  external: ["react", "react-dom", "preact", "inferno-component", "prop-types"]
};

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
    ...base,
    input: "src/index.ts",
    output: {
      file: "dist/core/index.esm.js",
      format: "es"
    },
    sourcemap: true,
    plugins
  },
  {
    ...base,
    input: "src/index.ts",
    output: {
      file: "dist/core/index.js",
      format: "cjs"
    },
    sourcemap: true,
    plugins
  },
  {
    ...base,
    input: "src/index.ts",
    output: {
      file: "dist/core/index.min.js",
      format: "cjs"
    },
    plugins: [...plugins, minify({ comments: false, sourceMap: false })]
  },
  {
    ...base,
    input: "src/react/index.ts",
    output: {
      file: "dist/react/index.js",
      format: "cjs"
    },
    sourcemap: true,
    plugins
  },

  {
    ...base,
    input: "src/react/index.ts",
    output: {
      file: "dist/react/index.esm.js",
      format: "es"
    },
    sourcemap: true,
    plugins
  },

  {
    ...base,
    input: "src/preact/index.ts",
    output: {
      file: "dist/preact/index.js",
      format: "cjs"
    },
    sourcemap: true,
    plugins
  },

  {
    ...base,
    input: "src/preact/index.ts",
    output: {
      file: "dist/preact/index.esm.js",
      format: "es"
    },
    sourcemap: true,
    plugins
  }
];
