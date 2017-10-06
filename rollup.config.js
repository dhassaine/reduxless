import babel from 'rollup-plugin-babel';
import pkg from './package.json';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default [
	{
    input: 'src/main.js',
    external: ['react', 'react-dom', 'preact', 'inferno-component'],
		dest: pkg.browser,
		format: 'umd',
		moduleName: 'reduxless',
		plugins: [
			resolve(),
			commonjs(),
			babel({
				exclude: ['node_modules/**']
			})
		]
	},
	{
    input: 'src/main.js',
    external: ['react', 'react-dom', 'preact', 'inferno-component'],
		targets: [
			{ dest: pkg.main, format: 'cjs' },
			{ dest: pkg.module, format: 'es' }
		],
		plugins: [
			babel({
				exclude: ['node_modules/**']
			})
		]
	}
];
