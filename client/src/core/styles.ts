/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GlamorProps } from 'flawk-types'
import React from 'react'
import config from './config'

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

const _main = 'rgba(51,108,251, 1)'
const _mainLight = 'rgba(51,108,251, .85)'
const _mainVeryLight = 'rgba(51,108,251, .25)'

const _green = 'rgba(40,201,134, 1)'
const _red = 'rgba(250,61,91,1)'
const _pink = 'rgba(189, 31, 130, 1)'
const _purple = 'rgba(159, 90, 253, 1)'
const _orange = 'rgba(255,152,0,1)'
const _yellow = 'rgba(255,235,59,1)'
const _blue = 'rgba(66, 124, 255,1)'

export default {
	// Config

	// @ts-ignore
	font: _font,
	// @ts-ignore
	fontAlt: _fontAlt,
	// @ts-ignore
	defaultBorderRadius: 6,
	// @ts-ignore
	defaultFontSize: 14,
	// @ts-ignore
	defaultFontBold: 700,

	// Input Config

	// @ts-ignore
	invalidFontSize: 13,
	// @ts-ignore
	invalidFontWeight: 700,
	// @ts-ignore
	inputFontWeight: undefined,
	// @ts-ignore
	inputBackground: undefined,

	// @ts-ignore
	inputBoxShadow: true,
	// @ts-ignore
	inputBorder: 'full' as 'full' | 'bottom' | 'none',
	// @ts-ignore
	inputBorderFactorDay: 0.2,
	// @ts-ignore
	inputBorderFactorNight: 0.15,

	// @ts-ignore
	inputLabelOpacityNight: 0.66,
	// @ts-ignore
	inputLabelOpacityDay: 0.75,
	// @ts-ignore
	inputLabelStyle: undefined as React.CSSProperties,

	// @ts-ignore
	inputHeight: 31,
	// @ts-ignore
	inputPaddingLeft: 10,

	// Button Config

	// @ts-ignore
	buttonBorderRadius: 6,
	// @ts-ignore
	buttonBorder: 'solid' as React.CSSProperties['borderStyle'],
	// @ts-ignore
	buttonFontWeight: undefined,

	// Modal Config

	// @ts-ignore
	modalWidth: undefined,
	// @ts-ignore
	modalPadding: undefined,
	// @ts-ignore
	modalBackground: undefined,
	// @ts-ignore
	modalButtonWrap: true,
	// @ts-ignore
	modalCard: undefined as React.CSSProperties,
	// @ts-ignore
	modalContentStyle: undefined as React.CSSProperties,
	// @ts-ignore
	modalButtonsStyle: {
		line: true,
		//flexWrap: 'none',
		//paddingBottom: 35 - 5,
	} as React.CSSProperties & {
		line: boolean
		lineColor: React.CSSProperties['background']
	},
	// @ts-ignore
	modalHeaderStyle: {
		line: true,
		noCloseButton: false,
		fontWeight: 'bold',
		fontSize: 19,
		textStyle: {
			marginTop: 5,
		},
	} as React.CSSProperties & {
		line: boolean
		lineColor: React.CSSProperties['background']
		noCloseButton: boolean
		textStyle: React.CSSProperties
	},

	// Dropdown Config

	// @ts-ignore
	dropdown: undefined as
		| { indicator?: { background: string }; menu?: React.CSSProperties }
		| undefined,
	// @ts-ignore
	dropdownFontWeight: undefined,

	// Table Config
	// @ts-ignore
	table: undefined as
		| ({
				headerWrapperStyle?: React.CSSProperties
				rowStyle?: React.CSSProperties
				wrapperStyle?: React.CSSProperties
				rowWrapperStyle?: React.CSSProperties
		  } & React.CSSProperties)
		| undefined,

	// Tooltip Config

	// @ts-ignore
	tooltip: undefined as React.CSSProperties | undefined,

	// Cards

	// @ts-ignore
	card: {
		width: 'fit-content',
		boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.05), 0 6px 20px 0 rgba(0, 0, 0, 0.05)',
		borderStyle: 'solid',
		borderWidth: 1,
		padding: 20,
		borderRadius: 10,
		boxSizing: 'border-box',
		background: _white,
		noDarkMode: false,
		borderColor: 'inherit',
	} as React.CSSProperties & { noDarkMode?: boolean },
	outlineCard: {
		borderStyle: 'solid',
		borderWidth: '1px',
		boxSizing: 'border-box',
		padding: 20,
		borderRadius: 10,
		noDarkMode: false,
		borderColor: 'inherit',
	} as React.CSSProperties & { noDarkMode?: boolean },

	// Helpers

	textEllipsis: {
		textOverflow: 'ellipsis',
		overflow: 'hidden',
		whiteSpace: 'nowrap',
	} as React.CSSProperties,
	mediumShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.05)',
	shadowFilter: '2px 6px 8px rgba(0, 0, 0, 0.3)',
	strongerShadow:
		'0 20px 32px -8px rgba(0, 0, 0, 0.1), 0 4px 8px 0 rgba(0, 0, 0, 0.05), 0 6px 20px 0 rgba(0, 0, 0, 0.05)',

	// Colors

	colors: {
		// @ts-ignore
		black: _black,
		// @ts-ignore
		blackDay: _black,
		// @ts-ignore
		blackNight: _white,
		// @ts-ignore
		white: _white,
		// @ts-ignore
		whiteDay: _white,
		// @ts-ignore
		whiteNight: _black,
		// @ts-ignore
		main: _main,
		// @ts-ignore
		mainLight: _mainLight,
		// @ts-ignore
		mainVeryLight: _mainVeryLight,
		// @ts-ignore
		background: _background,
		// @ts-ignore
		backgroundDay: _background,
		// @ts-ignore
		backgroundNight: _backgroundNight,
		borderColor: _borderColor,
		borderColorDay: _borderColor,
		borderColorNight: _borderColorNight,
		// @ts-ignore
		lineColor: _lineColor,
		// @ts-ignore
		lineColorDay: _lineColor,
		// @ts-ignore
		lineColorNight: _lineColorNight,
		// @ts-ignore
		green: _green,
		blue: _blue,
		// @ts-ignore
		red: _red,
		// @ts-ignore
		pink: _pink,
		// @ts-ignore
		purple: _purple,
		// @ts-ignore
		orange: _orange,
		// @ts-ignore
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
	} as React.CSSProperties,
	dropZoneActive: {
		borderColor: _main,
		background: config.replaceAlpha(_main, 0.1),
	} as React.CSSProperties,
	// @ts-ignore
	dropZoneReject: {
		borderColor: _red,
		background: config.replaceAlpha(_red, 0.1),
	} as React.CSSProperties,

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

	//

	...config.projectStyles,

	//

	// @ts-ignore
	buttonAppearances: (config.projectStyles.buttonAppearances || []).concat([
		{
			name: 'delete',
			transition: 'background 200ms, border-color 200ms, color 200ms',
			color: _red,
			':focus-visible': {
				outline: 'none',
				borderColor: _red,
				boxShadow: '0 0 0 2px ' + config.replaceAlpha(_red, 0.1),
			},
			':hover': {
				opacity: 1,
				color: 'white',
				background: config.replaceAlpha(_red, 0.5),
				borderColor: _red,
			},
			':active': {
				color: 'white',
				borderColor: _red,
				background: _red,
			},
		},
		{
			name: 'delete_primary',
			color: 'white',
			borderColor: _red,
			background: _red,

			':focus-visible': {
				outline: 'none',
				background: config.replaceAlpha(_red, 0.5),
				boxShadow: '0 0 0 2px ' + config.replaceAlpha(_red, 0.1),
			},
			':hover': {
				opacity: 1,
				background: config.replaceAlpha(_red, 0.5),
			},
			':active': {
				borderColor: _red,
				background: _red,
			},
		},
	]) as ({
		name: string
		usageBackground?: string
	} & GlamorProps &
		React.CSSProperties)[],
	// @ts-ignore
	inputAppearances: (config.projectStyles.inputAppearances || []).concat([
		{
			name: 'dark',
			usageBackground: _black,
			color: _white,
			background: 'transparent',
			'caret-color': config.replaceAlpha(_white, 0.5),
			'::placeholder': {
				color: config.replaceAlpha(_white, 0.5),
			},
			':hover': {
				borderColor: config.replaceAlpha(_white, 0.25),
			},
			':focus': {
				borderColor: config.replaceAlpha(_white, 0.5),
				boxShadow: '0 0 0 2px ' + config.replaceAlpha(_white, 0.25),
			},
			borderColor: _white,
		},
	]) as ({
		name: string
		usageBackground?: string
	} & GlamorProps &
		React.CSSProperties)[],
}
