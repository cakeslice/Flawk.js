const test = process.env.NODE_ENV === 'test'

module.exports = {
	plugins: test
		? [
				function () {
					return {
						visitor: {
							MetaProperty(path) {
								path.replaceWithSourceString('process')
							},
						},
					}
				},
				'@babel/plugin-transform-runtime',
		  ]
		: [],
	presets: [
		[
			'@babel/preset-env',
			{
				targets: {
					node: 'current',
				},
			},
		],
		[
			'@babel/preset-react',
			{
				runtime: 'automatic',
			},
		],
		'@babel/preset-typescript',
	],
}
