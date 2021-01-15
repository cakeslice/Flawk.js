/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ! Can't import config here!

const _font = 'Roboto'
const _fontAlt = 'PT Sans'
const _background = 'rgba(246,248,251,1)'
const _backgroundNight = 'rgba(35, 35, 35,1)'

const _main = 'rgba(51,108,251,1)'
const _mainLight = 'rgba(51,108,251, .85)'
const _mainVeryLight = 'rgba(51,108,251, .25)'

module.exports = {
	font: _font,
	fontAlt: _fontAlt,

	/* defaultBorderRadius: 4,

	inputBorderFactorNight: 0.3,
	inputBorderFactorDay: 0.4,

	inputLabelOpacityNight: 1,
	inputLabelOpacityDay: 1,

	inputHeight: 40,
	buttonFontWeight: 700, */

	customDropdown: {
		indicator: { background: 'none' },
	},
	/* customTable: {
		headerWrapperStyle: {
			..._card,
			padding: 0,
			borderStyle: 'none',
			borderRadius: 0,
			borderBottom: '1px solid ' + 'rgba(223,224,235,1)',
			boxShadow: 'none',
			fontSize: 14,
			fontWeight: 700,
			color: 'rgba(159,162,180,1)',
		},
		rowStyle: {
			boxShadow: 'none',
			fontSize: 14,
			fontWeight: 700,
			padding: 0,
			paddingLeft: 0,
			paddingRight: 0,
			':hover': {},
		},
		wrapperStyle: { ..._card, padding: 0 },
		rowWrapperStyle: {
			padding: 0,
			borderBottom: '1px solid ' + 'rgba(223,224,235,1)',
		},
	}, */

	colorsOverride: {
		background: _background,
		backgroundDay: _background,
		backgroundNight: _backgroundNight,

		main: _main,
		mainLight: _mainLight,
		mainVeryLight: _mainVeryLight,
	},
}
