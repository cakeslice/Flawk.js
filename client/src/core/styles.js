/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var config = require('./config_').default

const _font = 'Roboto'
const _fontAlt = 'PT Sans'
const _background = 'rgba(255,255,255, 1)'
const _backgroundNight = 'rgba(30, 30, 30, 1)'
const _borderColor = 'rgba(0, 0, 0, 0.1)'
const _borderColorNight = 'rgba(255, 255, 255, 0.15)'
const _lineColor = 'rgba(0, 0, 0, 0.05)'
const _lineColorNight = 'rgba(255, 255, 255, 0.05)'

const _black = 'rgba(30, 30, 30, 1)'
const _white = 'rgba(255,255,255, 1)'

const _main = 'rgba(0,117,255, 1)'
const _mainLight = 'rgba(0,117,255, .85)'
const _mainVeryLight = 'rgba(66, 117, 255, .25)'

const _green = 'rgba(40,201,134, 1)'
const _red = 'rgba(250,61,91,1)'
const _pink = 'rgba(189, 31, 130, 1)'
const _orange = 'rgba(255,152,0,1)'
const _yellow = 'rgba(255,235,59,1)'
const _blue = 'rgba(66, 124, 255,1)'

export const styles = {
	// Config

	font: _font,
	fontAlt: _fontAlt,
	defaultBorderRadius: 6,
	defaultFontSize: 14,
	defaultFontBold: 700,

	// Input Config

	inputBorderFactorDay: 0.2,
	inputBorderFactorNight: 0.15,

	inputLabelOpacityNight: 0.66,
	inputLabelOpacityDay: 0.75,

	inputHeight: 31,

	// Button Config

	buttonFontWeight: undefined,

	// Modal Config

	modalHeader: true,
	modalButtonWrap: true,
	modalHeaderStyle: {
		line: true,
		noCloseButton: false,
		fontWeight: 'bold',
		fontSize: 19,
		/* textStyle: {
			marginTop: 10,
		}, */
	},
	modalButtonsStyle: {
		line: true,
		//flexWrap: 'none',
		//paddingBottom: 35 - 5,
		/* buttonStyle: {
			width: '100%',
		}, */
	},

	// Cards

	/**
	 * @type {import('react').CSSProperties}
	 */
	card: {
		boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.05), 0 6px 20px 0 rgba(0, 0, 0, 0.05)',
		borderStyle: 'solid',
		borderWidth: 1,
		padding: 20,
		borderRadius: 10,
		boxSizing: 'border-box',
		background: _white,
	},
	/**
	 * @type {import('react').CSSProperties}
	 */
	outlineCard: {
		borderStyle: 'solid',
		borderWidth: '1px',
		boxSizing: 'border-box',
		padding: 20,
		borderRadius: 10,
	},

	// Helpers

	textEllipsis: {
		textOverflow: 'ellipsis',
		overflow: 'hidden',
		whiteSpace: 'nowrap',
	},
	mediumShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.05)',
	shadowFilter: '2px 6px 8px rgba(0, 0, 0, 0.3)',
	strongerShadow:
		'0 20px 32px -8px rgba(0, 0, 0, 0.1), 0 4px 8px 0 rgba(0, 0, 0, 0.05), 0 6px 20px 0 rgba(0, 0, 0, 0.05)',

	// Colors

	colors: {
		black: _black,
		blackDay: _black,
		blackNight: _white,
		white: _white,
		whiteDay: _white,
		whiteNight: _black,
		main: _main,
		mainLight: _mainLight,
		mainVeryLight: _mainVeryLight,
		background: _background,
		backgroundDay: _background,
		backgroundNight: _backgroundNight,
		borderColor: _borderColor,
		borderColorDay: _borderColor,
		borderColorNight: _borderColorNight,
		lineColor: _lineColor,
		lineColorDay: _lineColor,
		lineColorNight: _lineColorNight,
		green: _green,
		blue: _blue,
		red: _red,
		pink: _pink,
		orange: _orange,
		yellow: _yellow,
		...config.projectStyles.colorsOverride,
	},
	gradients: {
		fade: 'linear-gradient(90deg, rgba(2, 4, 51, 1), rgba(2, 4, 51, 1), rgba(2, 4, 51, 0))',
		main: _main,
	},

	// Dropzone

	dropZone: {
		/* flex: 1,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		padding: '20px',
		borderWidth: 2,
		borderRadius: 2,
		borderColor: '#eeeeee',
		borderStyle: 'dashed',
		backgroundColor: '#fafafa',
		color: '#bdbdbd',
		outline: 'none', */
		transition: 'border .24s ease-in-out',

		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		height: 137,
		width: '100%',
		borderRadius: 4,
		border: '1px dashed ' + _black,
	},
	dropZoneActive: {
		borderColor: _main,
		background: config.replaceAlpha(_main, '.1'),
	},
	dropZoneReject: {
		borderColor: _red,
		background: config.replaceAlpha(_red, '.1'),
	},

	// Misc

	fakeButton: {
		cursor: 'pointer',
		':focus-visible': {
			opacity: 0.75,
		},
		':hover': {
			opacity: 0.75,
		},
	},
	spinnerSmall: { size: 28 * 0.66 },
	spinnerMedium: { size: 28 * 1.5 },
	spinnerLarge: { size: 28 * 3 },

	//

	...config.projectStyles,
}

export default styles
