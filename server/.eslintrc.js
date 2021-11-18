module.exports = {
	root: true,
	env: {
		commonjs: true,
		es6: true,
		node: true,
		jest: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:import/recommended',
		'plugin:security/recommended',
		'plugin:security-node/recommended',
		'plugin:jest/recommended',
		// Disable rules that conflict with Prettier
		// Prettier must be last to override other configs
		'prettier',
	],
	// Only add plugins to customize the rules
	plugins: ['security', 'security-node', 'jest', 'no-secrets'],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
	},
	parserOptions: {
		ecmaVersion: 2018,
	},
	rules: {
		'import/no-unresolved': 'off',
		'import/no-anonymous-default-export': 'off',
		//
		'no-secrets/no-secrets': 'error',
		'security/detect-object-injection': 0,
		//
		'security-node/detect-crlf': 0,
		'security-node/detect-possible-timing-attacks': 'error',
		//
		eqeqeq: 'error',
		'no-console': 'off',
		'no-unused-vars': 'warn',
		'no-use-before-define': 'error',
		'no-eq-null': 'error',
		'no-trailing-spaces': 'error',
		'no-prototype-builtins': 'off',
		'comma-spacing': [
			'error',
			{
				before: false,
				after: true,
			},
		],
		'key-spacing': [
			'error',
			{
				beforeColon: false,
				afterColon: true,
			},
		],
		'padded-blocks': ['error', 'never'],
		'block-spacing': 'error',
		'eol-last': ['error', 'always'],
		'comma-dangle': [
			'error',
			{
				arrays: 'always-multiline',
				objects: 'always-multiline',
				imports: 'always-multiline',
				exports: 'never',
				functions: 'never',
			},
		],
		'no-whitespace-before-property': 'error',
		'require-atomic-updates': 0,
		'no-multi-spaces': 'error',
		'no-inner-declarations': 'error',
		'no-empty': 'error',
		'no-useless-catch': 'error',
		'no-unreachable': 'error',
		//
		'no-redeclare': 'error',
		'no-constant-condition': 'error',
	},

	overrides: [
		// Javascript
		{
			files: ['*.{js,jsx}'],

			extends: ['plugin:jsdoc/recommended'],
			plugins: ['jsdoc'],
			rules: {
				'jsdoc/require-jsdoc': [
					'error',
					{ exemptEmptyConstructors: true, exemptEmptyFunctions: true },
				],
				'jsdoc/require-property-description': 0,
				'jsdoc/require-param-description': 0,
				'jsdoc/require-returns-description': 0,
				'jsdoc/require-returns': 'warn',
				'jsdoc/require-param': 'warn',
				'jsdoc/require-property': 'warn',
				'jsdoc/valid-types': 0,
			},
		},
		// Typescript
		{
			files: ['*.{ts,tsx}'],
			parser: '@typescript-eslint/parser',
			parserOptions: {
				// Lint with Type Information
				// https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/TYPED_LINTING.md
				tsconfigRootDir: __dirname,
				project: './tsconfig.json',
			},

			extends: [
				'plugin:@typescript-eslint/recommended',
				'plugin:@typescript-eslint/recommended-requiring-type-checking',
			],
			plugins: ['@typescript-eslint'],
			rules: {
				'import/named': 'off',
				'no-use-before-define': 'off',
				//
				'@typescript-eslint/restrict-plus-operands': 'off',
				'@typescript-eslint/require-await': 'warn',
				'@typescript-eslint/no-explicit-any': ['error'],
				'@typescript-eslint/no-use-before-define': ['error'],
				'@typescript-eslint/ban-ts-comment': 'warn',
				'@typescript-eslint/explicit-module-boundary-types': 'off',
				'@typescript-eslint/no-floating-promises': 'warn',
				'@typescript-eslint/no-unsafe-member-access': 'off',
				'@typescript-eslint/no-unsafe-assignment': 'off',
				'@typescript-eslint/no-unsafe-call': 'off',
				'@typescript-eslint/no-unsafe-return': 'off',
			},
		},
	],
}
