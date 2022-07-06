/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import FButton from 'core/components/FButton'
import config from 'core/config'
import styles from 'core/styles'
import { github } from 'project/components/Icons'
import React, { useEffect, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import mod from './Main.module.scss'

const buttonStyle = {
	minHeight: 40,
	fontSize: 16,
}

export default function Main() {
	const [scroll, setScroll] = useState(0)
	function handleScroll() {
		const scrollTop = document.body.scrollTop || document.documentElement.scrollTop

		setScroll(Math.min(2000, scrollTop))
	}
	useEffect(() => {
		window.addEventListener('scroll', handleScroll)

		return () => {
			window.removeEventListener('scroll', handleScroll)
		}
	})

	const subtleText = { color: config.replaceAlpha(styles.colors.black, 0.66) }

	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })

	return (
		<div
			style={{
				minHeight: '100vh',
			}}
			className={mod.local}
		>
			<div
				style={{
					minHeight: desktop ? 50 + 125 : 25 + 70,
				}}
			></div>

			<Section>
				<div className='flex justify-between'>
					<div style={{ zIndex: 2 }}>
						<h1>
							<span style={{ color: styles.colors.main }}>Full-stack</span>
							{desktop ? ' ' : <br />}
							ready for liftoff
						</h1>
						<sp />
						<sp />
						<sp />
						<sp />
						<h4 style={subtleText}>
							Strongly opinionated <m>full-stack</m> boilerplate
							{desktop ? <br /> : ' '}
							powered by{!desktop ? <br /> : ' '}
							<m style={{ color: styles.colors.main }}>React</m> and{' '}
							<m style={{ color: styles.colors.main }}>Express/Mongoose</m>
						</h4>

						<sp />
						<sp />
						<sp />
						<sp />
						<sp />
						<sp />
						<sp />
						<sp />
					</div>
				</div>

				<div className='wrapMargin flex flex-wrap justify-center'>
					<FButton
						style={{ ...buttonStyle, minWidth: 145.5 }}
						href='/components'
						appearance={'primary'}
					>
						Get started
					</FButton>
					<FButton
						style={buttonStyle}
						href='https://github.com/cakeslice/flawk.js'
						target='_blank'
					>
						{github(styles.colors.black, 16)}
						<div style={{ marginLeft: 10 }}>Source code</div>
					</FButton>
				</div>
			</Section>

			<div style={{ minHeight: 550 }} />
		</div>
	)
}

function Section(props: {
	className?: string
	children?: React.ReactNode
	style?: React.CSSProperties
}) {
	const padding = '100px 5vw'

	return (
		<div
			className={'flex-col items-center'}
			style={{ overflow: 'hidden', padding: padding, ...props.style }}
		>
			<div
				className={props.className || 'w-full'}
				style={{
					maxWidth: 1280,
					alignSelf: 'center',
				}}
			>
				{props.children}
			</div>
		</div>
	)
}

const warn = (color: string) => (
	<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path
			d='M12 7.75V13'
			stroke={color}
			strokeWidth='1.5'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M21.08 8.58003V15.42C21.08 16.54 20.48 17.58 19.51 18.15L13.57 21.58C12.6 22.14 11.4 22.14 10.42 21.58L4.47998 18.15C3.50998 17.59 2.90997 16.55 2.90997 15.42V8.58003C2.90997 7.46003 3.50998 6.41999 4.47998 5.84999L10.42 2.42C11.39 1.86 12.59 1.86 13.57 2.42L19.51 5.84999C20.48 6.41999 21.08 7.45003 21.08 8.58003Z'
			stroke={color}
			strokeWidth='1.5'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M12 16.2V16.2999'
			stroke={color}
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
)
