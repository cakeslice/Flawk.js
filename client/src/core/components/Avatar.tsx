/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config_'
import styles from 'core/styles'
import React from 'react'
import { Img } from 'react-image'
import { MetroSpinner } from 'react-spinners-kit'
import uniqolor from 'uniqolor'
import avatar from '../assets/images/avatar.svg'

export default function Avatar({
	src,
	name,
	emptyOverride,
	isOnline,
	style,
}: {
	src?: string
	name?: string
	emptyOverride?: string
	isOnline?: boolean
	style?: React.CSSProperties
}) {
	const finalStyle: React.CSSProperties = {
		borderRadius: '50%',
		objectFit: 'cover',
		width: 60,
		height: 60,
		...style,
	}

	let finalName = name && name.split(' ')[0][0]
	if (finalName && name && name.split(' ').length > 1) finalName += name && name.split(' ')[1][0]

	const nameColor = name && uniqolor(name)

	return (
		<div style={{ display: 'flex' }}>
			<Img
				loader={
					<div
						style={{
							...finalStyle,
							opacity: 0.75,
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<MetroSpinner
							size={styles.spinnerSmall.size}
							color={config.replaceAlpha(styles.colors.black, 0.1)}
							loading={true}
						/>
					</div>
				}
				unloader={
					finalName ? (
						<div
							style={{
								...finalStyle,
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								paddingLeft: 3,
								letterSpacing: 3,
								color:
									nameColor && nameColor.isLight
										? styles.colors.blackDay
										: styles.colors.whiteDay,
								background: nameColor && nameColor.color,
							}}
						>
							{finalName}
						</div>
					) : (
						<img
							src={emptyOverride || avatar}
							style={{
								...finalStyle,
								opacity: 0.75,
								borderRadius: '',
							}}
						></img>
					)
				}
				style={{ ...finalStyle }}
				src={src || ''}
				key={src}
			></Img>
			{isOnline && (
				<div style={{ maxWidth: 0, maxHeight: 0 }}>
					<div
						style={{
							position: 'relative',
							top: 1,
							left: -1,
							borderRadius: '50%',
							background: styles.colors.green,
							minWidth: 5,
							minHeight: 5,
						}}
					></div>
				</div>
			)}
		</div>
	)
}
