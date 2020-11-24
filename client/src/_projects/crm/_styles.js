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

	colorsOverride: {
		background: _background,
		backgroundDay: _background,
		backgroundNight: _backgroundNight,

		main: _main,
		mainLight: _mainLight,
		mainVeryLight: _mainVeryLight,
	},
}
