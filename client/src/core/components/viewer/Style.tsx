/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import FButton from 'core/components/FButton'
import Loading from 'core/components/Loading'
import styles from 'core/styles'
import { Next, Section } from './ComponentsViewer'

// Can't use React.lazy() for anchor links to work

import Animation from 'core/components/viewer/style/Animation'
import Avatar from 'core/components/viewer/style/Avatar'
import Button from 'core/components/viewer/style/Button'
import Card from 'core/components/viewer/style/Card'
import Color from 'core/components/viewer/style/Color'
import CSSModules from 'core/components/viewer/style/CSSModules'
import DOMElements from 'core/components/viewer/style/DOMElements'
import Tooltip from 'core/components/viewer/style/Tooltip'
import Typography from 'core/components/viewer/style/Typography'

export default function Style() {
	return (
		<div>
			<Section
				code={`import styles from 'core/styles'

const style = {
	fontSize: 16,
	fontFamily: styles.font
}
`}
				description={
					<>
						Default fonts can be overridden in <code>src/project/_styles.ts</code> by
						changing the <code>font</code> and <code>fontAlt</code> properties.
						<sp />
						To import new fonts, add them to <code>src/project/assets/fonts.css</code>.
					</>
				}
				title='Typography'
				top
				github='client/src/core/components/viewer/style/Typography.tsx'
			>
				<Typography />
			</Section>

			<Section
				title='Color'
				code={`import styles from 'core/styles'

const mainColor = styles.colors.main

const redColor = styles.colors.red
`}
				description={
					<>
						In <code>styles.colors</code> you can find the main app colors and some
						basic colors to use in your project.
						<sp />
						You can override them in <code>src/project/_styles.ts</code>
					</>
				}
				tags={['styles.colors']}
				github='client/src/core/components/viewer/style/Color.tsx'
			>
				<Color />
			</Section>

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

			<Section
				title='Card'
				description={
					<>
						{"There's"} no <m>Card</m> component in Flawk. You can use{' '}
						<code>styles.card</code> and <code>styles.outlineCard</code> as a base for
						your own cards.
						<sp />
						The base card styles are however used in some Flawk components like{' '}
						<code>{'<Modal/>'}</code>. You can override them in{' '}
						<code>src/project/_styles.ts</code>
					</>
				}
				code={`import { css } from 'glamor'
import styles from 'core/styles'

// Basic
<div style={{...styles.card}}></div>

// Outline
<div style={{...styles.outlineCard}}></div>

// Hover
<div {...css({
	...styles.card,
	top: 0,
	position: 'relative',
	transition: 'top 250ms, box-shadow 250ms',
	':hover': {
		boxShadow: styles.strongerShadow,
		top: -5,
	},
})}></div>
`}
				tags={['styles.card', 'styles.outlineCard']}
				github='client/src/core/components/viewer/style/Card.tsx'
			>
				<Card />
			</Section>

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
				title='Avatar'
				tags={['<Avatar/>']}
				github='client/src/core/components/viewer/style/Avatar.tsx'
			>
				<Avatar />
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

<Loading size={28 * 3} />

<Loading />

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
				github='client/src/core/components/viewer/style/Tooltip.tsx'
			>
				<Tooltip />
			</Section>

			<Section
				description={
					<>
						Use <code>appearance</code> prop to set the <m>button style</m>. You can
						override or add new button styles in <code>src/project/_styles.ts</code>{' '}
						using the <code>buttonAppearances</code> property.
						<br />
						You can also use <code>glamor</code> overrides like <code>{':hover'}</code>{' '}
						to customize the style in <m>different states</m>.
						<sp />
						If the button is supposed to be just a <m>link</m>, you can use{' '}
						<code>href</code> and <code>target</code> props instead of the{' '}
						<code>onClick</code> prop.
						<sp />
						The button component can also be used as a <m>checkbox</m> with the{' '}
						<code>checkbox</code> prop which is a string for the checkbox label.
					</>
				}
				code={`import FButton from 'core/components/FButton'

// Default
<FButton onClick={() => alert('Hello!')}>Click Me</FButton>

// Primary
<FButton appearance='primary'>Click Me</FButton>

// Secondary
<FButton appearance='secondary'>Click Me</FButton>

// Checkbox
<FButton checkbox='I Agree'></FButton>

// Link
<FButton href='https://google.com' target='_blank'>Link</FButton>

// Loading
<FButton isLoading={true}>Click Me</FButton>
`}
				title='Button'
				tags={['<FButton/>', '<button/>']}
				github='client/src/core/components/viewer/style/Button.tsx'
			>
				<Button />
			</Section>

			<Section
				description={
					<>
						Use <code>effects</code> prop to set the effects to be applied when the
						component is <m>visible</m>.
						<br />
						Multiple effects can be applied at the <m>same time</m>.
						<sp />
						The <code>duration</code>, <code>delay</code>, and <code>distance</code>{' '}
						props can be used to configure the effects <m>behaviour</m>.
						<sp />
						To control when the animation is <m>triggered</m>, use{' '}
						<code>controlled</code> prop. If set to <m>false</m>, it will <m>revert</m>{' '}
						the animation including visibility for some effects like <code>fade</code>.
						<sp />
						To animate children <m>sequentially</m>, use <code>staggered</code> prop.
						For nested children, use <code>staggeredChildren</code> prop.
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
				github='client/src/core/components/viewer/style/Animation.tsx'
			>
				<Animation />
			</Section>

			<Section
				description={
					<>
						<m>CSS modules</m> are supported and can be used to <m>override</m> default
						CSS styles in specific components.
					</>
				}
				title='CSS Modules'
				github='client/src/core/components/viewer/style/CSSModules.tsx'
			>
				<CSSModules />
			</Section>

			<Section
				description={
					<>
						Flawk comes with some custom <m>DOM elements</m> that can be useful and{' '}
						{"don't"} need to be imported.
					</>
				}
				title='Custom DOM elements'
				github='client/src/core/components/viewer/style/DOMElements.tsx'
			>
				<DOMElements />
			</Section>

			<Next backName='Get Started' backLink='start' name='Layout' link='layout' />
		</div>
	)
}
