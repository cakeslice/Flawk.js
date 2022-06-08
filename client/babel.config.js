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
		'@babel/preset-react',
		'@babel/preset-typescript',
	],
}
