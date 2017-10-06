import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

export default [
	// browser-friendly UMD build
	{
		entry: 'src/main.js',
		dest: pkg.browser,
		format: 'umd',
		moduleName: 'reduxless',
		plugins: [
			resolve(),
			commonjs(),
			babel({
        exclude: ['node_modules/**'],
        "presets": [
          [
            "es2015",
            {
              "modules": false
            }
          ]
        ],
        "plugins": [
          "external-helpers"
        ]
			})
		]
	},

	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// the `targets` option which can specify `dest` and `format`)
	{
		entry: 'src/main.js',
		targets: [
			{ dest: pkg.main, format: 'cjs' },
			{ dest: pkg.module, format: 'es' }
		],
		plugins: [
			babel({
				exclude: ['node_modules/**'],
        "presets": [
          [
            "es2015",
            {
              "modules": false
            }
          ]
        ],
        "plugins": [
          "external-helpers"
        ]
			})
		]
	}
];
