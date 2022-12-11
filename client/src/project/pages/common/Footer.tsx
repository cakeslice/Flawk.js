/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Animated from 'core/components/Animated'
import config from 'core/config'
import styles from 'core/styles'
import { useEffect, useState, memo } from 'react'
import { useMediaQuery } from 'react-responsive'
import mod from '../main/Main.module.scss'

type Props = {
	fillSpace?: boolean
}
const Footer = memo(function Footer(props: Props) {
	const [scroll, setScroll] = useState(0)
	function handleScroll() {
		const scrollTop = document.body.scrollTop || document.documentElement.scrollTop

		setScroll(Math.min(2000, scrollTop - document.body.clientHeight))
	}
	useEffect(() => {
		window.addEventListener('scroll', handleScroll)

		return () => {
			window.removeEventListener('scroll', handleScroll)
		}
	})

	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })

	return (
		<div
			data-nosnippet
			className={'flex-col items-center justify-center w-full ' + mod.local}
			style={
				props.fillSpace
					? {
							boxSizing: 'border-box',
							padding: 20,
							paddingBottom: 60,
							paddingTop: 60,
							//background: styles.colors.main,
					  }
					: {
							height: 0,
							position: 'relative',
							top: -190 / 2,
							padding: '0px 20px',
					  }
			}
		>
			<Animated
				className='w-full flex-col items-center text-center'
				effects={['fade', 'up']}
				distance={10}
				duration={0.75}
				delay={0.25}
				style={{ zIndex: 1, paddingBottom: 250 }}
			>
				<div style={{ height: 30 }} className='flex items-center'>
					<a
						target='_blank'
						style={{
							minWidth: 55,
							fontSize: 14.5,
							color: styles.colors.black,
						}}
						href='https://services.cakeslice.dev/privacy'
						rel='noreferrer'
					>
						Privacy
					</a>
					<vr style={{ border: '.25px solid ' + styles.colors.black }} />
					<a
						style={{
							minWidth: 55,
							fontSize: 14.5,
							color: styles.colors.black,
						}}
						href={'mailto:hello@cakeslice.dev'}
					>
						Contact
					</a>
				</div>

				<sp />
				<sp />
				<p
					style={{
						fontSize: 13,
						opacity: 0.75,
					}}
				>
					© 2020 José Guerreiro
				</p>
				<a
					target='_blank'
					style={{
						fontSize: 13,
						color: styles.colors.black,
					}}
					href='https://cakeslice.dev'
					rel='noreferrer'
				>
					www.cakeslice.dev
				</a>
				<sp />
				<sp />
				<sp />
				<div className='flex items-center justify-center'>
					<p
						style={{
							fontFamily: 'Amaranth',
							fontSize: 16,
						}}
					>
						Made with ❤️
					</p>
				</div>
			</Animated>
		</div>
	)
})

export default Footer
