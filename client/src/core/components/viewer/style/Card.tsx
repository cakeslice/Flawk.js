/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import FButton from 'core/components/FButton'
import config from 'core/config'
import styles from 'core/styles'
import { css } from 'glamor'
import { useMediaQuery } from 'react-responsive'

export default function Card() {
	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })

	return (
		<>
			<div
				className='flex-col'
				{...css({
					...styles.card,
					borderRadius: 5,
					transition: 'top 250ms, box-shadow 250ms',
					top: 0,
					boxShadow: styles.card.boxShadow,
					position: 'relative',
					':hover': {
						boxShadow: styles.strongerShadow,
						top: -5,
					},
					overflow: 'hidden',
					padding: 0,
					width: desktop ? 350 : '100%',
					height: 350,
				})}
			>
				<div
					style={{
						height: '40%',
						background:
							// eslint-disable-next-line
							'url(https://images.pexels.com/photos/11946504/pexels-photo-11946504.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260)',
						backgroundSize: 'cover',
					}}
				/>
				<div className='grow flex-col justify-between' style={{ padding: 18 }}>
					<div>
						<div className='flex justify-between'>
							<h5>Amazing Pancakes</h5>
							<hsp />
							<tag
								style={{
									padding: '4px 10px',
									color: styles.colors.main,
									opacity: 1,
									borderRadius: 10,
									lineHeight: 'normal',
									fontSize: 12,
									background: styles.colors.mainVeryLight,
								}}
							>
								PROMO
							</tag>
						</div>
						<hsp />
						<p style={{ opacity: 0.9 }}>
							Finally, the Best Pancakes Ever. They are fluffy, crispy on the edges,
							tender in the middle, and completely stackable. The search is over!
						</p>
					</div>
					<hsp />
					<div className='flex flex-wrap'>
						<FButton style={{ flexGrow: 1 }}>Wishlist</FButton>
						<hsp />
						<FButton appearance='primary' style={{ flexGrow: 1 }}>
							Buy now
						</FButton>
					</div>
				</div>
			</div>
			<sp />
			<sp />
			<div
				className={
					desktop
						? 'wrapMarginBig flex flex-wrap justify-start'
						: 'flex-col wrapMarginBigVertical'
				}
			>
				<div
					style={{
						...styles.card,
						textAlign: 'center',
						width: desktop ? 200 : '100%',
						height: 200,
					}}
				>
					<tag>Basic</tag>
				</div>
				<div
					{...css({
						...styles.card,
						/* 	transition: 'opacity .25s',
													opacity: 0.5, */
						transition: 'top 250ms, box-shadow 250ms',
						top: 0,
						boxShadow: styles.card.boxShadow,
						position: 'relative',
						':hover': {
							boxShadow: styles.strongerShadow,
							top: -5,
							//	transform: 'translateY(5px)',
						},
						width: desktop ? 200 : '100%',
						height: 200,
						textAlign: 'center',
					})}
				>
					<tag>Hover</tag>
				</div>
				<div
					style={{
						...styles.outlineCard,
						textAlign: 'center',
						width: desktop ? 200 : '100%',
						height: 200,
					}}
				>
					<tag>Outline</tag>
				</div>
				<div
					{...css({
						...styles.card,
						background: config.replaceAlpha(styles.colors.black, 0.1),
						color: config.replaceAlpha(styles.colors.black, 0.5),
						boxShadow: 'none',
						border: 'none',
						width: desktop ? 200 : '100%',
						height: 200,
						textAlign: 'center',
					})}
				>
					<tag>Muted</tag>
				</div>
			</div>
		</>
	)
}
