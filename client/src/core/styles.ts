/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GlamorProps } from 'flawk-types'
import React from 'react'
import config, { projectStyles as pS, projectStylesOverrides as projectOverrides } from './config'

export const projectStyles = pS

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
const _mainVeryLight = 'rgba(51,108,251, .15)'

const _green = 'rgba(40,201,134, 1)'
const _red = 'rgba(250,61,91,1)'
const _pink = 'rgba(189, 31, 130, 1)'
const _purple = 'rgba(159, 90, 253, 1)'
const _orange = 'rgba(255,152,0,1)'
const _yellow = 'rgba(255,235,59,1)'
const _blue = 'rgba(66, 124, 255,1)'

const styles: Styles = {
	// Config

	font: _font,
	fontAlt: _fontAlt,
	defaultBorderRadius: 6,
	defaultFontSize: 14,
	defaultFontBold: 700,

	// Input Config

	invalidFontSize: 13,
	invalidFontWeight: 500,
	inputFontWeight: undefined,
	inputBackground: undefined,

	inputBoxShadow: true,
	inputBorder: 'full',
	inputBorderFactorDay: 0.2,
	inputBorderFactorNight: 0.15,

	inputLabelOpacityNight: 0.66,
	inputLabelOpacityDay: 0.75,
	inputLabelStyle: undefined,

	inputHeight: 31,
	inputPaddingLeft: 10,

	// Button Config

	buttonBorderRadius: 6,
	buttonBorder: 'solid',
	buttonFontWeight: undefined,

	// Modal Config

	modalWidth: undefined,
	modalPadding: undefined,
	modalBackground: undefined,
	modalButtonWrap: true,
	modalCard: undefined,
	modalContentStyle: undefined,
	modalButtonsStyle: {
		line: true,
	},
	modalHeaderStyle: {
		line: true,
		noCloseButton: false,
		fontWeight: 'bold',
		fontSize: 19,
		textStyle: {
			marginTop: 5,
		},
	},

	// Dropdown Config

	dropdown: undefined,
	dropdownFontWeight: undefined,

	// Table Config
	table: undefined,

	// Tooltip Config

	tooltip: undefined,

	// Dashboard Config
	dashboardHeader: { marginBottom: 30, minHeight: 41 },

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
		background: config.replaceAlpha(_main, 0.1),
	},
	dropZoneReject: {
		borderColor: _red,
		background: config.replaceAlpha(_red, 0.1),
	},

	// Misc

	fakeButton: {
		cursor: 'pointer',
		transition: 'opacity 200ms',
		':focus-visible': {
			opacity: 0.75,
		},
		':hover': {
			opacity: 0.75,
		},
	},

	//

	...projectOverrides,

	//

	buttonAppearances: () => {
		const base: ({
			name: string
			usageBackground?: string
		} & GlamorProps &
			React.CSSProperties)[] =
			(projectOverrides.buttonAppearances && projectOverrides.buttonAppearances()) || []

		return base.concat([
			{
				name: 'delete',
				transition: 'background 200ms, border-color 200ms, color 200ms',
				color: _red,
				':focus-visible': {
					outline: 'none',
					borderColor: _red,
					boxShadow: undefined,
					background: config.replaceAlpha(_red, 0.5),
					color: _white,
				},
				':hover': {
					opacity: 1,
					color: _white,
					background: config.replaceAlpha(_red, 0.5),
					boxShadow: '0 0 0 2px ' + config.replaceAlpha(_red, 0.1),
					borderColor: _red,
				},
				':active': {
					color: _white,
					borderColor: _red,
					background: _red,
				},
			},
			{
				name: 'delete_primary',
				color: _white,
				borderColor: _red,
				background: _red,

				':focus-visible': {
					outline: 'none',
					background: config.replaceAlpha(_red, 0.5),
					boxShadow: undefined,
					color: _white,
					borderColor: _red,
				},
				':hover': {
					opacity: 1,
					background: config.replaceAlpha(_red, 0.5),
					boxShadow: '0 0 0 2px ' + config.replaceAlpha(_red, 0.1),
					color: _white,
					borderColor: _red,
				},
				':active': {
					borderColor: _red,
					background: _red,
					color: _white,
					boxShadow: undefined,
				},
			},
		])
	},
	inputAppearances: () => {
		const base: ({
			name: string
			usageBackground?: string
		} & GlamorProps &
			React.CSSProperties)[] =
			(projectOverrides.inputAppearances && projectOverrides.inputAppearances()) || []
		return base.concat([
			{
				name: 'dark',
				usageBackground: _black,
				color: _white,
				background: 'transparent',
				caretColor: config.replaceAlpha(_white, 0.5),
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
		])
	},

	// Cards

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
		...projectOverrides.card,
	},
	outlineCard: {
		width: 'fit-content',
		borderStyle: 'solid',
		borderWidth: '1px',
		boxSizing: 'border-box',
		padding: 20,
		borderRadius: 10,
		noDarkMode: false,
		borderColor: 'inherit',
		...projectOverrides.outlineCard,
	},

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
		purple: _purple,
		orange: _orange,
		yellow: _yellow,
		...projectOverrides.colors,
	},
	gradients: {
		fade: 'linear-gradient(90deg, rgba(2, 4, 51, 1), rgba(2, 4, 51, 1), rgba(2, 4, 51, 0))',
		main: _main,
		...projectOverrides.gradients,
	},
}
export default styles

export type Styles = {
	// Config

	font: string
	fontAlt: string
	defaultBorderRadius: React.CSSProperties['borderRadius']
	defaultFontSize: number
	defaultFontBold: React.CSSProperties['fontWeight']

	// Input Config

	invalidFontSize: number
	invalidFontWeight: React.CSSProperties['fontWeight']
	inputFontWeight: React.CSSProperties['fontWeight']
	inputBackground: string | undefined

	inputBoxShadow: boolean
	inputBorder: 'full' | 'bottom' | 'none'
	inputBorderFactorDay: number
	inputBorderFactorNight: number

	inputLabelOpacityNight: number
	inputLabelOpacityDay: number
	inputLabelStyle?: React.CSSProperties

	inputHeight: number
	inputPaddingLeft: number

	// Button Config

	buttonBorderRadius: React.CSSProperties['borderRadius']
	buttonBorder: React.CSSProperties['borderStyle']
	buttonFontWeight: React.CSSProperties['fontWeight']

	// Modal Config

	modalWidth?: number
	modalPadding?: number
	modalBackground: React.CSSProperties['background']
	modalButtonWrap: boolean
	modalCard?: React.CSSProperties
	modalContentStyle?: React.CSSProperties
	modalButtonsStyle: React.CSSProperties & {
		line?: boolean
		lineColor?: React.CSSProperties['background']
	}
	modalHeaderStyle: React.CSSProperties & {
		line?: boolean
		lineColor?: React.CSSProperties['background']
		noCloseButton?: boolean
		textStyle?: React.CSSProperties
	}

	// Dropdown Config

	dropdown: { indicator?: { background: string }; menu?: React.CSSProperties } | undefined
	dropdownFontWeight: React.CSSProperties['fontWeight']

	// Table Config
	table:
		| ({
				headerWrapperStyle?: React.CSSProperties
				rowStyle?: React.CSSProperties
				wrapperStyle?: React.CSSProperties
				rowWrapperStyle?: React.CSSProperties
		  } & React.CSSProperties)
		| undefined

	// Tooltip Config

	tooltip: React.CSSProperties | undefined

	// Dashboard Config
	dashboardHeader: React.CSSProperties

	// Helpers

	textEllipsis: React.CSSProperties
	mediumShadow: React.CSSProperties['boxShadow']
	shadowFilter: React.CSSProperties['boxShadow']
	strongerShadow: React.CSSProperties['boxShadow']

	// Dropzone

	dropZone: React.CSSProperties
	dropZoneActive: React.CSSProperties
	dropZoneReject: React.CSSProperties

	// Misc

	fakeButton: React.CSSProperties & GlamorProps

	//

	buttonAppearances: () => ({
		name: string
		usageBackground?: string
	} & GlamorProps &
		React.CSSProperties)[]
	inputAppearances: () => ({
		name: string
		usageBackground?: string
	} & GlamorProps &
		React.CSSProperties)[]

	// Cards

	card: React.CSSProperties & { noDarkMode?: boolean }
	outlineCard: React.CSSProperties & { noDarkMode?: boolean }

	// Colors

	colors: {
		black: string
		blackDay: string
		blackNight: string
		white: string
		whiteDay: string
		whiteNight: string
		main: string
		mainLight: string
		mainVeryLight: string
		//
		background: string
		backgroundDay: string
		backgroundNight: string
		//
		borderColor: string
		borderColorDay: string
		borderColorNight: string
		//
		lineColor: string
		lineColorDay: string
		lineColorNight: string
		//
		green: string
		blue: string
		red: string
		pink: string
		purple: string
		orange: string
		yellow: string
	}
	gradients: {
		fade: string
		main: string
	}
}
