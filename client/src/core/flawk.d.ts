/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

declare module 'flawk-types' {
	export type Obj = Record<string, unknown>
	export type ArrayObject = Array<Record<string, unknown>>
	export type KeyObject = { [key: string]: Record<string, unknown> }
	export type ArrayKeyObject = Array<{ [key: string]: Record<string, unknown> }>
	export type KeyArrayKeyObject = {
		[key: string]: Array<{ [key: string]: Record<string, unknown> }>
	}
	export type KeyUnknown = { [key: string]: unknown }
	export type ArrayKeyUnknown = Array<{ [key: string]: unknown }>

	export type Lang = {
		text: string
		moment: string
		numeral: string
		date: string
	}

	export type GlamorProps = {
		':active'?: React.CSSProperties
		':hover'?: React.CSSProperties
		':focus-visible'?: React.CSSProperties
		':visited'?: React.CSSProperties
		':link'?: React.CSSProperties
		':focus'?: React.CSSProperties
		':checked'?: React.CSSProperties
		'::placeholder'?: React.CSSProperties
	}

	export type FormIKStruct = {
		name: string
		value?: unknown
		error?: string | FormikErrors<any> | string[] | FormikErrors<any>[]
		touch?: boolean | FormikTouched<any> | FormikTouched<any>[]
		setFieldValue: (field: string, value: unknown, shouldValidate?: boolean | undefined) => void
		setFieldTouched: (
			field: string,
			value: boolean,
			shouldValidate?: boolean | undefined
		) => void
		handleBlur: (Event) => void
		submitCount: number
		changed: boolean
	}
}

declare module 'react-reveal' {
	export class Fade extends React.Component<{
		delay: number
		duration: number
		left?: boolean
		top?: boolean
		bottom?: boolean
		right?: boolean
	}> {}
}
declare module 'react-reveal/HeadShake' {
	export default class HeadShake extends React.Component<{
		spy: number | string
	}> {}
}

declare module '@toolz/use-constructor' {
	export function useConstructor(f: () => void): void
}
