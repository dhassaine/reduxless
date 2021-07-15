import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const plugins = [commonjs(), resolve(), typescript()];

const minifiedPlugins = [
  commonjs(),
  resolve(),
  typescript({ sourceMap: false }),
  terser(),
];

const configs = [
  ['core', 'index.ts'],
  ['react', 'index.tsx'],
  ['preact', 'index.tsx'],
].flatMap(([module, entry]) => [
  {
    input: `src/${module}/${entry}`,
    output: [
      {
        file: `dist/${module}/index.esm.js`,
        format: 'es',
        sourcemap: true,
      },
      {
        file: `dist/${module}/index.js`,
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins,
  },
  {
    input: `src/${module}/${entry}`,
    output: {
      file: `dist/${module}/index.min.js`,
      format: 'cjs',
    },
    plugins: minifiedPlugins,
  },
]);

export default configs;
