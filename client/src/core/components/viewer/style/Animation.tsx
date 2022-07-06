/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import logo from 'core/assets/images/logo.svg'
import Animated from 'core/components/Animated'
import { Section } from 'core/components/viewer/ComponentsViewer'
import config from 'core/config'
import styles from 'core/styles'
import { motion, Variants } from 'framer-motion'
import { useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import * as uuid from 'uuid'

export default function Animation() {
	const [animationTrigger, setAnimationTrigger] = useState(true)
	const [animationUUID, setAnimationUUID] = useState<string>()

	function toggleAnimation() {
		setAnimationTrigger((prev) => !prev)
		setAnimationUUID(uuid.v1())
	}

	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })

	const animationCard: React.CSSProperties = {
		...styles.card,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		textAlign: 'center',
		width: desktop ? 200 : '100%',
		height: 100,
		minHeight: 68,
		cursor: 'pointer',
	}

	return (
		<Section
			description={
				<>
					Use <code>effects</code> prop to set the effects to be applied when the
					component is <m>visible</m>.
					<br />
					Multiple effects can be applied at the <m>same time</m>.
					<sp />
					The <code>duration</code>, <code>delay</code>, and <code>distance</code> props
					can be used to configure the effects <m>behaviour</m>.
					<sp />
					To control when the animation is <m>triggered</m>, use <code>controlled</code>{' '}
					prop. If set to <m>false</m>, it will <m>revert</m> the animation including
					visibility for some effects like <code>fade</code>.
					<sp />
					To animate children <m>sequentially</m>, use <code>staggered</code> prop. For
					nested children, use <code>staggeredChildren</code> prop.
					<sp />
					This component uses <code>framer-motion</code> internally.
				</>
			}
			code={`import Animated from 'core/components/Animated'

// Fade-in when visible
<Animated
	effects={['fade']}
>
	<div>Content</div>
</Animated>

// Fade-in when 'isVisible' is set to true and
// fade-out when 'isVisible' is set to false
<Animated
	controlled={isVisible}
	effects={['fade']}
>
	<div>Content</div>
</Animated>

// Fade-in sequentially
<Animated
	staggered
	effects={['fade']}
>
	<div>First</div>
	<div>Second</div>
	<div>Third</div>
</Animated>
`}
			title='Animation'
			tags={['<Animated/>', '<motion.div/>', 'transition']}
		>
			<div style={{ opacity: 0.75, fontSize: 13.5, textAlign: 'center' }}>
				Click any card to toggle
			</div>
			<sp />
			<tag>{'<Animated/>'}</tag>
			<hsp />
			<div
				className={
					desktop
						? 'wrapMargin flex flex-wrap justify-start'
						: 'flex-col wrapMarginBigVertical'
				}
			>
				<Animated
					onClick={toggleAnimation}
					style={animationCard}
					controlled={animationTrigger}
					effects={['fade']}
				>
					<tag>Fade</tag>
				</Animated>
				{/* <Animated
					onClick={toggleAnimation}
					style={animationCard}
					triggerID={animationUUID}
					effects={['fade']}
				>
					<tag>Fade Trigger</tag>
				</Animated> */}
				<Animated
					onClick={toggleAnimation}
					style={animationCard}
					controlled={animationTrigger}
					effects={['height']}
				>
					<tag>Size</tag>
				</Animated>
				<Animated
					onClick={toggleAnimation}
					style={animationCard}
					controlled={animationTrigger}
					effects={['down-scale']}
				>
					<tag>Scale</tag>
				</Animated>
				<Animated
					onClick={toggleAnimation}
					style={animationCard}
					controlled={animationTrigger}
					distance={20}
					effects={['down']}
				>
					<tag>Position</tag>
				</Animated>
				<Animated
					onClick={toggleAnimation}
					style={animationCard}
					triggerID={animationUUID}
					effects={['shake']}
				>
					<tag>Shake</tag>
				</Animated>

				<div onClick={toggleAnimation} style={{ ...animationCard, alignItems: undefined }}>
					<div>
						<tag>Layout</tag>
					</div>
					<sp />
					<div className='flex items-center justify-around'>
						<motion.div layout>
							<kbd>Ctrl</kbd>
						</motion.div>
						{animationTrigger && (
							<motion.div layout>
								<kbd>Alt</kbd>
							</motion.div>
						)}
						<motion.div layout>
							<kbd>Del</kbd>
						</motion.div>
					</div>
				</div>

				<div
					onClick={toggleAnimation}
					style={{
						...animationCard,
					}}
				>
					<tag>Staggered</tag>
					<sp />
					<Animated
						staggered
						duration={0.5}
						delay={0.5}
						triggerID={animationUUID}
						onClick={toggleAnimation}
						style={{
							display: 'flex',
							flexWrap: 'wrap',
							justifyContent: 'center',
						}}
						effects={['fade']}
					>
						<kbd>Ctrl</kbd>
						<kbd>Alt</kbd>
						<kbd>Del</kbd>
					</Animated>
				</div>

				<div
					onClick={toggleAnimation}
					style={{
						...animationCard,
					}}
				>
					<tag>Staggered Children</tag>
					<sp />
					<Animated
						staggered
						duration={0.5}
						delay={0.5}
						distance={10}
						extraEffects={[[], ['fade', 'right']]}
						effects={['fade', 'up']}
						triggerID={animationUUID}
						//
						onClick={toggleAnimation}
						style={{
							display: 'flex',
							flexWrap: 'wrap',
							justifyContent: 'center',
						}}
						className={'grid ' + (desktop ? 'grid-cols-2' : 'grid-rows-2')}
						staggerChildren={(v) => {
							const variants = v as Variants[]
							return (
								<>
									<motion.div
										className='flex items-center'
										variants={variants[1]}
									>
										<motion.div variants={variants[2]}>
											<kbd>Ctrl</kbd>
										</motion.div>
										<motion.div className='flex' variants={variants[0]}>
											<img
												style={{
													maxHeight: 15,
													marginLeft: 7.5,
												}}
												src={logo}
											></img>
										</motion.div>
									</motion.div>
									<motion.div
										className='flex items-center'
										variants={variants[1]}
									>
										<motion.div variants={variants[2]}>
											<kbd>V</kbd>
										</motion.div>
										<motion.div className='flex' variants={variants[0]}>
											<img
												style={{
													maxHeight: 15,
													marginLeft: 7.5,
												}}
												src={logo}
											></img>
										</motion.div>
									</motion.div>
								</>
							)
						}}
					></Animated>
				</div>

				<Animated onClick={toggleAnimation} style={animationCard} effects={['fade']}>
					<tag>When visible</tag>
				</Animated>
				<Animated
					onClick={toggleAnimation}
					style={animationCard}
					animateOffscreen
					effects={['fade']}
				>
					<tag>Offscreen</tag>
				</Animated>
			</div>
			<sp />
			<tag>CSS</tag>
			<hsp />
			<div
				className={
					desktop
						? 'wrapMargin flex flex-wrap justify-start'
						: 'flex-col wrapMarginBigVertical'
				}
			>
				<div
					onClick={toggleAnimation}
					style={{
						...animationCard,
						height: animationTrigger ? 100 : 0,
						transition: 'height 750ms ease-in-out',
					}}
				>
					<tag>transition</tag>
				</div>
				<div
					onClick={toggleAnimation}
					style={{
						...animationCard,
						opacity: 0.25,
						animation: 'heartbeat 1s infinite alternate',
					}}
				>
					<tag>animation</tag>
				</div>
				<div
					onClick={toggleAnimation}
					style={{
						...animationCard,
						animation: 'shadowPulse 1s infinite',
					}}
				>
					<tag>animation</tag>
				</div>
			</div>
		</Section>
	)
}
