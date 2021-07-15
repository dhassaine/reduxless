import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const plugins = [commonjs(), resolve(), typescript()];

const minifiedPlugins = [
  commonjs(),
  resolve(),
  typescript({ sourceMap: false }),
  terser()
];

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true
    },
    plugins
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    },
    plugins
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.min.js',
      format: 'cjs'
    },
    plugins: minifiedPlugins
  }
];
