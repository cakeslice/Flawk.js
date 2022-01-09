module.exports = {
	root: true,
	env: {
		browser: true,
		es6: true,
		node: true,
		jest: true,
	},
	parser: 'babel-eslint',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 2020,
		sourceType: 'module',
	},
	extends: [
		'react-app',
		'react-app/jest',
		// Already includes: (no need to install)
		// eslint-plugin-react
		// eslint-plugin-react-hooks
		// eslint-plugin-jsx-a11y
		// eslint-plugin-testing-library
		// eslint-plugin-import
		// eslint-plugin-jest
		// @typescript-eslint/parser
		// @typescript-eslint/eslint-plugin
		//
		'eslint:recommended',
		'plugin:import/recommended',
		'plugin:react-hooks/recommended',
		'plugin:jsx-a11y/recommended',
		'plugin:security/recommended',
		'plugin:jest/recommended',
		'plugin:cypress/recommended',
		// Disable rules that conflict with Prettier
		// Prettier must be last to override other configs
		'prettier',
	],
	// Only add plugins to customize the rules
	plugins: ['import', 'jsx-a11y', 'security', 'jest', 'no-secrets'],
	rules: {
		'jest/valid-describe': 'off',
		//
		'import/no-unresolved': 'off',
		'import/no-anonymous-default-export': 'off',
		//
		'jsx-a11y/accessible-emoji': 'warn',
		'jsx-a11y/alt-text': 'warn',
		'jsx-a11y/anchor-has-content': 'warn',
		'jsx-a11y/anchor-is-valid': 'warn',
		'jsx-a11y/aria-activedescendant-has-tabindex': 'warn',
		'jsx-a11y/aria-props': 'warn',
		'jsx-a11y/aria-proptypes': 'warn',
		'jsx-a11y/aria-role': 'warn',
		'jsx-a11y/aria-unsupported-elements': 'warn',
		'jsx-a11y/autocomplete-valid': 'warn',
		'jsx-a11y/click-events-have-key-events': 'warn',
		'jsx-a11y/heading-has-content': 'warn',
		'jsx-a11y/html-has-lang': 'warn',
		'jsx-a11y/iframe-has-title': 'warn',
		'jsx-a11y/img-redundant-alt': 'warn',
		'jsx-a11y/label-has-associated-control': 'warn',
		'jsx-a11y/label-has-for': 'off',
		'jsx-a11y/media-has-caption': 'warn',
		'jsx-a11y/mouse-events-have-key-events': 'warn',
		'jsx-a11y/no-access-key': 'warn',
		'jsx-a11y/no-autofocus': 'warn',
		'jsx-a11y/no-distracting-elements': 'warn',
		'jsx-a11y/no-onchange': 'warn',
		'jsx-a11y/no-noninteractive-element-interactions': 'warn',
		'jsx-a11y/no-noninteractive-tabindex': 'warn',
		'jsx-a11y/no-static-element-interactions': 'warn',
		'jsx-a11y/no-redundant-roles': 'warn',
		'jsx-a11y/role-has-required-aria-props': 'warn',
		'jsx-a11y/role-supports-aria-props': 'warn',
		'jsx-a11y/scope': 'warn',
		'jsx-a11y/tabindex-no-positive': 'warn',
		////////////////
		'no-secrets/no-secrets': 'error',
		'security/detect-object-injection': 0,
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
	settings: {
		react: {
			pragma: 'React',
			version: 'detect',
		},
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
				'no-empty-function': 'off',
				//
				'@typescript-eslint/unbound-method': 'warn',
				'@typescript-eslint/restrict-plus-operands': 'off',
				'@typescript-eslint/no-empty-function': ['warn'],
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
