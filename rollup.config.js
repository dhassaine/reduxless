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

export default [
  /* Core */
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/core/index.esm.js',
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'dist/core/index.js',
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins,
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/core/index.min.js',
      format: 'cjs',
    },
    plugins: minifiedPlugins,
  },
  /* Preact */
  {
    input: 'src/preact/index.tsx',
    output: [
      { file: 'dist/preact/index.esm.js', format: 'es', sourcemap: true },
      { file: 'dist/preact/index.js', format: 'cjs', sourcemap: true },
    ],
    plugins,
  },
  {
    input: 'src/preact/index.tsx',
    output: [{ file: 'dist/preact/index.min.js', format: 'cjs' }],
    plugins: minifiedPlugins,
  },
  /* React */
  {
    input: 'src/react/index.tsx',
    output: [
      { file: 'dist/react/index.esm.js', format: 'es', sourcemap: true },
      { file: 'dist/react/index.js', format: 'cjs', sourcemap: true },
    ],
    plugins,
  },
  {
    input: 'src/react/index.tsx',
    output: [{ file: 'dist/react/index.min.js', format: 'cjs' }],
    plugins: minifiedPlugins,
  },
];
