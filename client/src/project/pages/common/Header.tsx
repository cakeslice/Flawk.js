/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Animated from 'core/components/Animated'
import Tooltip from 'core/components/Tooltip'
import lightOn from 'core/components/viewer/assets/lightbulb.svg'
import lightOff from 'core/components/viewer/assets/lightbulb_off.svg'
import config from 'core/config'
import { usePrevious } from 'core/functions/hooks'
import styles from 'core/styles'
import { css } from 'glamor'
import logo from 'project/assets/images/logo.svg'
import { github } from 'project/components/Icons'
import { useEffect, useState, memo } from 'react'
import { useMediaQuery } from 'react-responsive'
import { Link } from 'react-router-dom'
import mod from '../main/Main.module.scss'

const mobileHeight = 60
const mobileHeightTop = 70
const desktopHeight = 70
const desktopHeightTop = 125

type Props = {
	expand?: boolean
	fillSpace?: boolean
}
const Header = memo(function Header(props: Props) {
	const previousProps = usePrevious(props)

	const [shrink, setShrink] = useState(false)
	function handleScroll() {
		const scrollTop = document.body.scrollTop || document.documentElement.scrollTop

		setShrink(props.expand ? scrollTop > 0 : true)
	}
	useEffect(() => {
		window.addEventListener('scroll', handleScroll)

		return () => {
			window.removeEventListener('scroll', handleScroll)
		}
	})

	useEffect(() => {
		if (previousProps.expand !== props.expand) {
			handleScroll()
		}
	}, [handleScroll, previousProps, props])

	const maxWidth = config.publicMaxWidth

	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })

	return (
		<div
			data-nosnippet
			className={'flex-col w-full ' + mod.local}
			style={{
				minHeight: props.fillSpace ? (desktop ? desktopHeight : mobileHeight) : 0,
			}}
		>
			<div
				className={'flex-col w-full items-center' + (shrink ? ' blur-background' : '')}
				style={{
					transition: 'border-color .5s, box-shadow .5s, background-color .25s',
					backgroundColor: shrink
						? config.replaceAlpha(styles.colors.white, 0.85)
						: config.replaceAlpha(styles.colors.white, 0),
					boxShadow: shrink ? styles.mediumShadow : undefined,
					borderBottomStyle: 'solid',
					borderWidth: 1,
					borderColor: shrink
						? styles.colors.lineColor
						: config.replaceAlpha(styles.colors.lineColor, 0),
					position: 'fixed',
					top: 0,
					zIndex: 30,
					paddingLeft: '5vw',
					paddingRight: '5vw',
				}}
			>
				<Animated
					animateOffscreen
					effects={['fade', 'up']}
					duration={0.5}
					distance={desktop ? -desktopHeight : -mobileHeightTop}
					//
					className={'flex justify-between w-full items-center'}
					style={{
						maxWidth: maxWidth,
						minHeight: desktop
							? shrink
								? desktopHeight
								: desktopHeightTop
							: shrink
							? mobileHeight
							: mobileHeightTop,
						maxHeight: desktop
							? shrink
								? desktopHeight
								: desktopHeightTop
							: shrink
							? mobileHeight
							: mobileHeightTop,
						transition: 'max-height .5s, min-height .5s',
						boxSizing: 'border-box',
					}}
				>
					<Link
						to={'/'}
						style={{
							height: 'fit-content',
							color: styles.colors.black,
							textDecoration: 'none',
						}}
						className='flex items-center'
					>
						<img
							style={{
								maxWidth: !shrink ? (desktop ? 38 : 28) : desktop ? 34 : 28,
								objectFit: 'contain',
								transition: 'max-width .5s',
							}}
							src={logo}
						></img>

						<h2
							style={{
								paddingLeft: desktop ? 15 : 10,
								transition: 'font-size .5s',
								fontSize: shrink || !desktop ? '175%' : '200%',
							}}
						>
							<span style={{ fontFamily: 'Amaranth' }}>{'Flawk'}</span>
							<tag
								style={{
									position: 'relative',
									top: -1,
									padding: '7.5px 10px',
									verticalAlign: 'middle',
									marginLeft: desktop ? 20 : 15,
									color: styles.colors.purple,
									opacity: 1,
									background: config.replaceAlpha(styles.colors.purple, 0.1),
								}}
							>
								{!desktop ? 'WIP' : 'WORK IN PROGRESS'}
							</tag>
						</h2>
					</Link>

					<div className='flex items-center'>
						<Tooltip
							foreground
							hidden={!desktop}
							content={'Source code'}
							tooltipProps={{
								placement: 'bottom',
							}}
						>
							<a
								{...css({
									height: 36,
									transition: 'opacity .25s',
									opacity: 0.75,
									':hover': {
										opacity: 1,
									},
								})}
								className='flex items-center'
								target='_blank'
								href='https://github.com/cakeslice/flawk.js'
								rel='noreferrer'
							>
								{github(styles.colors.black, 26)}
							</a>
						</Tooltip>

						{desktop ? <sp /> : <hsp />}

						<Tooltip
							foreground
							hidden={!desktop}
							content={!global.nightMode ? 'Dark mode' : 'Light mode'}
							offsetAlt={9}
							tooltipProps={{
								placement: 'bottom',
							}}
							containerStyle={{
								position: 'relative',
								left: 9,
							}}
						>
							<button
								type='button'
								onClick={() => global.toggleNightMode()}
								{...css({
									width: 35,
									padding: 0,
									transition: 'opacity .25s',
									opacity: 0.66,
									':hover': {
										opacity: 1,
									},
								})}
							>
								<img
									style={{
										height: '100%',
										maxHeight: 30,
									}}
									src={global.nightMode ? lightOff : lightOn}
								></img>
							</button>
						</Tooltip>
					</div>
				</Animated>
			</div>
		</div>
	)
})

export default Header
