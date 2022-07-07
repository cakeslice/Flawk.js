/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Tooltip from 'core/components/Tooltip'
import config from 'core/config'
import styles from 'core/styles'
import { useMediaQuery } from 'react-responsive'
import { Link } from 'react-router-dom'

export default function _Tooltip() {
	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })

	return (
		<div className='wrapMargin flex flex-wrap justify-start'>
			<Tooltip
				tooltipProps={{ placement: 'right' }}
				content={
					<div>
						<p>
							Lorem ipsum dolor sit amet, <s>strikethrough</s> adipiscing elit, sed do
							eiusmod tempor <b>bold</b> ut labore et dolore magna aliqua. Ut enim ad
							minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
							ex ea commodo <Link to='/components/style#button'>anchor link</Link>.
						</p>
					</div>
				}
			>
				<div style={styles.card}>
					<b>{desktop ? 'Hover' : 'Click'} me</b>
				</div>
			</Tooltip>

			<sp />

			<Tooltip
				content={(forceHide) => {
					return <div style={{ padding: 5 }}>Tooltip</div>
				}}
			>
				<div
					style={{
						opacity: 0.5,
						position: 'relative',
						top: 0.5,
					}}
				>
					{infoIcon(styles.colors.black)}
				</div>
			</Tooltip>
		</div>
	)
}

const infoIcon = (color: string) => (
	<svg
		width='10'
		height='10'
		viewBox='0 0 460 460'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
	>
		<path
			d='M230 0C102.975 0 0 102.975 0 230C0 357.025 102.975 460 230 460C357.025 460 460 357.026 460 230C460 102.974 357.025 0 230 0ZM268.333 377.36C268.333 386.036 261.299 393.07 252.623 393.07H209.522C200.846 393.07 193.812 386.036 193.812 377.36V202.477C193.812 193.801 200.845 186.767 209.522 186.767H252.623C261.299 186.767 268.333 193.8 268.333 202.477V377.36ZM230 157C208.461 157 191 139.539 191 118C191 96.461 208.461 79 230 79C251.539 79 269 96.461 269 118C269 139.539 251.539 157 230 157Z'
			fill={color}
		/>
	</svg>
)
