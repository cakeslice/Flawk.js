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

/* const _card = {
	borderStyle: 'solid',
	borderWidth: 1,
	padding: 35,
	borderRadius: 8,
	boxSizing: 'border-box',
	background: 'rgba(255,255,255, 1)',
	noDarkMode: false,
} */

export default {
	font: _font,
	fontAlt: _fontAlt,

	extraButtons: [
		{
			buttonType: 'delete',
			transition: 'background 200ms, border-color 200ms, color 200ms',
			color: 'rgba(250,61,91,1)',
			':focus-visible': {
				outline: 'none',
				borderColor: 'rgba(250,61,91,1)',
			},
			':hover': {
				opacity: 1,
				color: 'white',
				borderColor: 'rgba(250,61,91,1)',
				background: 'rgba(250,61,91,.5)',
			},
			':active': {
				color: 'white',
				background: 'rgba(250,61,91,1)',
				borderColor: 'rgba(250,61,91,1)',
			},
		},
		{
			buttonType: 'delete_primary',
			color: 'white',
			borderColor: 'rgba(250,61,91,1)',
			background: 'rgba(250,61,91,1)',

			':focus-visible': {
				outline: 'none',
				background: 'rgba(250,61,91,.5)',
			},
			':hover': {
				opacity: 1,
				background: 'rgba(250,61,91,.5)',
			},

			':active': {
				borderColor: 'rgba(250,61,91,1)',
				background: 'rgba(250,61,91,1)',
			},
		},
		{
			buttonType: 'action',

			color: 'white',
			fontWeight: 'bold',
			minWidth: 128,
			borderColor: 'transparent',

			transition: 'background 200ms, border-color 200ms, -webkit-filter 200ms',
			':focus-visible': {
				outline: 'none',
				borderColor: 'white',
			},
			':hover': {
				borderColor: 'white',
				opacity: 1,
				filter: 'drop-shadow(0px 0px 20px rgba(250, 40, 116, 0.71))',
			},
			':active': {
				borderColor: 'white',
				filter: 'drop-shadow(0px 0px 20px rgba(250, 40, 116, 0.71))',
				background:
					'linear-gradient(90deg,rgba(251, 40, 176, .5) 0%, rgba(252, 38, 60, .5) 100%)',
			},
			background: 'linear-gradient(90deg, #FB28B0 0%, #FC263C 100%)',
		},
	],

	/*
	card: _card,

   defaultBorderRadius: 4,

	inputBorderFactorNight: 0.3,
	inputBorderFactorDay: 0.4,

	inputLabelOpacityNight: 1,
	inputLabelOpacityDay: 1,

	inputHeight: 40,
	buttonFontWeight: 700,
	inputFontWeight: 700,
	dropdownFontWeight: 700,

	modalPadding: 35,
	modalButtonWrap: true,
	modalWidth: 466,

	dropZoneActive: {
		borderColor: _main,
	},
	dropZoneReject: {
		borderColor: _red,
	},
	*/

	/*
	tooltip: {
		background: 'rgba(54,55,64,0.95)',
		maxWidth: 200,
		fontSize: 10,
		padding: 15,
		color: 'rgba(255,255,255,1)',
	},
	*/
	dropdown: {
		indicator: { background: 'none' },
	} as { indicator?: { background: string }; menu?: React.CSSProperties },
	/*
	table: {
		headerWrapperStyle: {
			// ! Can't use _card here, causes error...
			borderWidth: 1,
			boxSizing: 'border-box',
			//
			padding: 0,
			borderStyle: 'none',
			borderRadius: 0,
			borderBottom: '1px solid ' + 'rgba(223,224,235,1)',
			boxShadow: 'none',
			fontSize: 14,
			fontWeight: 700,
			color: _faded,
			height: 54,
			paddingTop: 15,
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
		wrapperStyle: {
			// ! Can't use _card here, causes error...
			borderStyle: 'solid',
			borderWidth: 1,
			borderRadius: 8,
			boxSizing: 'border-box',
			background: 'rgba(255,255,255, 1)',
			//
			padding: 0,
		},
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
