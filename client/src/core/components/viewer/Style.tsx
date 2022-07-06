/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Avatar from 'core/components/Avatar'
import FButton from 'core/components/FButton'
import Loading from 'core/components/Loading'
import Tooltip from 'core/components/Tooltip'
import config from 'core/config'
import styles from 'core/styles'
import React from 'react'
import { useMediaQuery } from 'react-responsive'
import { Link } from 'react-router-dom'
import { Next, Section } from './ComponentsViewer'
import cssModule from './ComponentsViewer.module.scss'

//

const Typography = React.lazy(() => import('core/components/viewer/style/Typography'))
const Color = React.lazy(() => import('core/components/viewer/style/Color'))
const Card = React.lazy(() => import('core/components/viewer/style/Card'))
const Button = React.lazy(() => import('core/components/viewer/style/Button'))
const Animation = React.lazy(() => import('core/components/viewer/style/Animation'))

//

const customElement = {
	padding: '3px 8px',
	fontFamily: 'monospace',
	fontSize: 15,
}

// eslint-disable-next-line
type Props = {}
export default function Style(props: Props) {
	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })

	return (
		<div>
			<Typography />

			<Color />

			<Section
				title='Dark mode'
				code={`const color = global.nightMode ? '#fff' : '#000'

// Switch between dark/light modes
await global.toggleNightMode()
`}
				description={
					<>
						All components in Flawk support a <m>dark</m> and <m>light</m> mode. If{' '}
						<code>global.nightMode</code> is <code>true</code> the app is in dark mode.
						<sp />
						To switch between them, you can use <code>global.toggleNightMode()</code>.
					</>
				}
				tags={['global.nightMode', 'global.toggleNightMode()']}
			>
				<FButton
					onClick={async () => {
						await global.toggleNightMode()
					}}
					style={{
						minWidth: 50,
					}}
				>
					{global.nightMode ? 'Light' : 'Dark'} mode
				</FButton>
			</Section>

			<Card />

			<Section
				description={
					<>
						Use <code>src</code> prop to set the <m>avatar picture</m>. Name{' '}
						<m>initials</m> can also be set with the <code>name</code> prop.
						<br />
						If no <code>src</code> image available, it falls back to name initials or
						placeholder image.
						<sp />
						The <m>size</m> of the avatar can be set using the <code>style</code> prop.
						<sp />
						{"There's"} also the <code>isOnline</code> prop to show a <m>green dot</m>{' '}
						to indicate that the user is online.
					</>
				}
				code={`import Avatar from 'core/components/Avatar'

// Basic
<Avatar src='AVATAR_PICTURE' name='John Doe' />

// Is online
<Avatar isOnline />

// Custom size
<Avatar style={{ width: 40, height: 40 }} />
`}
				title='Avatar'
				tags={['<Avatar/>']}
			>
				<div style={{ ...styles.card }}>
					<div className='wrapMarginBig flex flex-wrap justify-start'>
						<Avatar name='John Doe' />
						<Avatar isOnline />
						<Avatar />
						<Avatar style={{ width: 40, height: 40 }} />
					</div>
				</div>
			</Section>

			<Section
				description={
					<>
						Use <code>size</code> prop to set the <m>size</m> of the loading animation.
						<sp />
						The component will only be visible after a small delay to{' '}
						<m>avoid flickering</m> in case the respective content loads too fast.
						<br />
						This behaviour can be disabled with the <code>noDelay</code> prop.
					</>
				}
				code={`import Loading from 'core/components/Loading'

<Loading size={18.5} />
`}
				title='Loading'
				tags={['<Loading/>']}
			>
				<div style={{ ...styles.card }}>
					<div className='wrapMarginBig flex flex-wrap justify-start'>
						<Loading size={28 * 3} />
						<Loading />
						<Loading size={18.5} />
					</div>
				</div>
			</Section>

			<Section
				description={
					<>
						Use <code>content</code> prop to set the content <m>inside the tooltip</m>.
						<br />
						The <code>children</code> of the tooltip component is what{' '}
						<m>activates the tooltip</m> on hover.
						<sp />
						The default tooltip style can be overridden in{' '}
						<code>src/project/_styles.ts</code> using the <code>tooltip</code> property.
						<sp />
						In some cases the tooltip can be <m>hidden</m> behind a modal for example
						and the <code>foreground</code> prop can be used to make it visible.
						<br />
						If <m>interaction</m> with the tooltip content is needed like buttons or
						links, the <code>selectable</code> prop can be used to make the tooltip
						content <m>clickable</m>.
						<sp />
						This component uses <code>react-popper-tooltip</code> internally.
					</>
				}
				code={`import Tooltip from 'core/components/Tooltip'

<Tooltip
	content={
		<div>
			Tooltip content
		</div>
	}
>
	<div>Tooltip trigger</div>
</Tooltip>
`}
				title='Tooltip'
				tags={['<Tooltip/>']}
			>
				<div className='wrapMargin flex flex-wrap justify-start'>
					<Tooltip
						tooltipProps={{ placement: 'right' }}
						content={
							<div>
								<p>
									Lorem ipsum dolor sit amet, <s>strikethrough</s> adipiscing
									elit, sed do eiusmod tempor <b>bold</b> ut labore et dolore
									magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
									ullamco laboris nisi ut aliquip ex ea commodo{' '}
									<Link to='/components/style#button'>anchor link</Link>.
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
			</Section>

			<Button />

			<Animation />

			<Section
				description={
					<>
						<m>CSS modules</m> are supported and can be used to <m>override</m> default
						CSS styles in specific components.
					</>
				}
				title='CSS Modules'
			>
				<div className={'wrapMarginBig flex flex-wrap'}>
					<div className={cssModule.example}>
						<div style={{ ...styles.card }}>
							<h1>
								{'Hello. '}
								<tag>h1</tag>
							</h1>
							<sp />
							<p>Default font size of 16px</p>
						</div>
					</div>
					<div className={cssModule.example_2}>
						<div style={{ ...styles.card }}>
							<h1>
								{'Hello. '}
								<tag>h1</tag>
							</h1>
							<sp />
							<p>Default font size of 12px</p>
						</div>
					</div>
				</div>
			</Section>

			<Section
				description={
					<>
						Flawk comes with some custom <m>DOM elements</m> that can be useful and{' '}
						{"don't"} need to be imported.
					</>
				}
				title='Custom DOM elements'
			>
				<div
					className={'wrapMarginBig flex flex-wrap'}
					style={{ ...styles.card, fontSize: 13 }}
				>
					<div className='flex items-center'>
						<tag style={customElement}>{'<sp/>'}</tag>
						<hsp />
						<div style={{ opacity: 0.85 }}>Spacer</div>
					</div>
					<div className='flex items-center'>
						<tag style={customElement}>{'<hsp/>'}</tag>
						<hsp />
						<div style={{ opacity: 0.85 }}>
							Half of <code>{'<sp/>'}</code>
						</div>
					</div>
					<div className='flex items-center'>
						<tag style={customElement}>{'<vr/>'}</tag>
						<hsp />
						<div style={{ opacity: 0.85 }}>
							Same as native <code>{'<hr/>'}</code> but vertical
						</div>
					</div>
					<div className='flex items-center'>
						<tag style={customElement}>{'<tag/>'}</tag>
						<hsp />
						<div style={{ opacity: 0.85 }}>Badge like container</div>
					</div>
					<div className='flex items-center'>
						<tag style={customElement}>{'<hl/>'}</tag>
						<hsp />
						<div style={{ opacity: 0.85 }}>Text highlight</div>
					</div>
					<div className='flex items-center'>
						<tag style={customElement}>{'<m/>'}</tag>
						<hsp />
						<div style={{ opacity: 0.85 }}>Medium font weight</div>
					</div>
					<div className='flex items-center'>
						<tag style={customElement}>{'<bb/>'}</tag>
						<hsp />
						<div style={{ opacity: 0.85 }}>Bigger font size</div>
					</div>
				</div>
			</Section>

			<Next backName='Get Started' backLink='start' name='Layout' link='layout' />
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
