/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Styles } from 'core/styles'

const _font = 'Roboto'
const _fontAlt = 'PT Sans'
const _background = 'rgba(246,248,251,1)'
const _backgroundNight = 'rgba(35, 35, 35,1)'

const _main = 'rgba(51,108,251, 1)'
const _mainLight = 'rgba(51,108,251, .85)'
const _mainVeryLight = 'rgba(51,108,251, .15)'

const styles: Partial<Styles> = {
	font: _font,
	fontAlt: _fontAlt,

	buttonAppearances: () => [
		{
			name: 'action',
			usageBackground: 'rgba(30,30,30,1)',

			color: 'white',
			fontWeight: 'bold',
			minWidth: 128,
			borderColor: 'transparent',

			transition: 'background 200ms, border-color 200ms, filter 200ms',
			':focus-visible': {
				color: 'white',
				outline: 'none',
				borderColor: 'white',
				boxShadow: 'none',
				background: 'linear-gradient(90deg, #FB28B0 0%, #FC263C 100%)',
			},
			':hover': {
				color: 'white',
				borderColor: 'white',
				opacity: 1,
				boxShadow: 'none',
				filter: 'drop-shadow(0px 0px 20px rgba(250, 40, 116, 0.71))',
			},
			':active': {
				color: 'white',
				borderColor: 'transparent',
				background: 'linear-gradient(90deg, #FB28B0 0%, #FC263C 100%)',
				filter: 'drop-shadow(0px 0px 20px rgba(250, 40, 116, 0))',
			},
			background: 'linear-gradient(90deg, #FB28B0 0%, #FC263C 100%)',
		},
	],

	colors: {
		background: _background,
		backgroundDay: _background,
		backgroundNight: _backgroundNight,

		main: _main,
		mainLight: _mainLight,
		mainVeryLight: _mainVeryLight,
	},
}
export default styles

export const projectStyles = { dashboardHeader: { marginBottom: 30, minHeight: 41 } }
