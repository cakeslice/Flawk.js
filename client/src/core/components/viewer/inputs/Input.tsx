/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Dropdown from 'core/components/Dropdown'
import FButton from 'core/components/FButton'
import FInput from 'core/components/FInput'
import Tooltip from 'core/components/Tooltip'
import { Section } from 'core/components/viewer/ComponentsViewer'
import config from 'core/config'
import styles from 'core/styles'
import { css } from 'glamor'
import _find from 'lodash/find'
import _uniqBy from 'lodash/uniqBy'
import { useState } from 'react'
import { useMediaQuery } from 'react-responsive'

export default function Input() {
	const [debounced, setDebounced] = useState<string>()
	const [inputAppearance, setInputAppearance] = useState('default')
	const [usageBackground, setUsageBackground] = useState<string>()

	const appearanceStyle = {
		...styles.outlineCard,
		background: usageBackground,
		color: usageBackground && config.invertColor(usageBackground, styles.colors.whiteDay),
		maxWidth: 950,
	}

	const appearanceDropdown = () => {
		const appearances = styles.inputAppearances()

		return (
			<Dropdown
				label='Appearance'
				value={inputAppearance}
				onChange={(e) => {
					const appearance = _find(appearances, { name: e })
					setInputAppearance(e as string)
					setUsageBackground(appearance && appearance.usageBackground)
				}}
				options={_uniqBy(
					[{ label: 'Default', value: 'default' }].concat(
						appearances.map((e) => {
							return {
								label: config.capitalizeAll(e.name.replaceAll('_', ' ')),
								value: e.name,
							}
						})
					),
					(e) => e.value
				)}
			></Dropdown>
		)
	}

	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })

	return (
		<Section
			description={
				<>
					Use <code>appearance</code> prop to set the <m>input style</m>. You can override
					or add new input styles in <code>src/project/_styles.ts</code> using the{' '}
					<code>inputAppearances</code> property.
					<br />
					You can also use <code>glamor</code> overrides like <code>{':hover'}</code> to
					customize the style in <m>different states</m>.
					<sp />
					To make it a <m>controlled</m> input, use <code>isControlled</code> prop and
					supply a value to <code>value</code> prop.
					<sp />
					Use with <code>{'<Field/>'}</code> if inside a <a href='#form'>form</a>.
				</>
			}
			code={`import FInput from 'core/components/FInput'

// E-mail
<FInput
	type='email'
	label='E-mail'
	autoComplete='new-email'
	placeholder='you@gmail.com'
	onChange={(e) => {
		this.setState({email: e})
	}}
/>

// Text area
<FInput
	style={{ width: '100%', minHeight: 50 }}
	label='Text Area'
	textArea
></FInput>

// Date
<FInput
	label='Date'
	datePicker
/>
`}
			title='Input field'
			tags={['<FInput/>', '<input>']}
			top
		>
			<div style={{ ...styles.card, maxWidth: 783 }}>
				<div className='wrapMargin flex flex-wrap justify-start items-end'>
					<FInput
						type='email'
						label='E-mail'
						autoComplete='new-email'
						defaultValue='someone@gmail.com'
						placeholder='you@gmail.com'
					/>
					<FInput
						type='password'
						autoComplete='new-password'
						label='Password'
						placeholder='******'
					/>
					<FInput
						type='number'
						label='Number'
						formatNumber={{ disable: true }}
						placeholder='123456'
					/>

					<FInput label='Centered' placeholder='Hello' center={true} />
				</div>
				<sp />
				<div className='wrapMargin flex flex-wrap justify-start items-start'>
					<FInput
						label='Invalid Label'
						invalid='*'
						placeholder='Long placeholder really long...'
						name='input'
					/>
					<FInput
						name='input'
						emptyLabel
						invalidType='bottom'
						invalid='Wrong format'
						placeholder='Invalid Bottom'
					/>
					<FInput
						emptyLabel
						invalid='*'
						name='input'
						invalidType='right'
						placeholder='Invalid Right'
					/>
				</div>
				<sp />
				<div className='wrapMargin flex flex-wrap justify-start'>
					<div>
						Inline Input:{' '}
						<span>
							<input
								{...css({
									'::placeholder': {
										userSelect: 'none',
										color: config.replaceAlpha(
											styles.colors.black,
											global.nightMode ? 0.25 : 0.5
										),
									},
								})}
								type='email'
								placeholder='someone@gmail.com'
							></input>
						</span>
					</div>
					{desktop && <FInput placeholder='Full width' style={{ flexGrow: 1 }}></FInput>}
				</div>
				<sp />
				<div className='wrapMargin flex flex-wrap justify-start'>
					<FInput
						style={{ width: '100%', minHeight: 50 }}
						label='Text Area'
						textArea
					></FInput>
				</div>
				<sp />
				<sp />
				<div className='wrapMargin flex flex-wrap justify-start'>
					<FInput label='Date' datePicker />
					<FInput label='Time' timeInput />
					<FInput
						type='number'
						label='Format Number'
						formatNumber={{
							prefix: '$ ',
							suffix: ' / m²',
						}}
						placeholder='USD per m²'
					/>
					<FInput
						label='Icon'
						style={{ width: 100 }}
						rightChild={
							<div className='flex' style={{ marginLeft: 5, marginRight: 7.5 }}>
								{searchIcon()}
							</div>
						}
					/>
					<div className='flex items-end'>
						<FInput
							label='Inner Button'
							style={{
								width: 200,
							}}
							rightChild={
								<FButton
									onClick={(e) => {
										e.stopPropagation()
									}}
									appearance='primary'
									style={{
										minWidth: 30,
										minHeight: 22.5,
										marginLeft: 3,
										marginRight: 3,
										padding: '0px 7px',
									}}
								>
									Search
								</FButton>
							}
						></FInput>
					</div>
					<div className='flex items-end'>
						<FInput
							label='Outer Button'
							style={{
								width: 100,
								borderTopRightRadius: 0,
								borderBottomRightRadius: 0,
							}}
						></FInput>
						<FButton
							style={{
								minWidth: 40,
								borderTopLeftRadius: 0,
								borderBottomLeftRadius: 0,
							}}
						>
							Add
						</FButton>
					</div>
					<FInput
						labelStyle={{ display: 'flex', width: '100%' }}
						label={
							<div className='flex items-center justify-between'>
								<div style={{ marginRight: 5 }}>Tooltip</div>
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
						}
					/>
					<FInput
						label='Debounced'
						style={{ width: 100 }}
						bufferedInput
						onChange={(e) => setDebounced(e as string)}
					/>
					<div style={{ alignSelf: 'end' }}>{debounced}</div>
				</div>
			</div>
			<sp />
			<sp />
			{appearanceDropdown()}
			<sp />
			<sp />
			<div style={{ maxWidth: 1100 }} className='wrapMarginBig flex flex-wrap justify-start'>
				<div>
					<tag>Normal</tag>
					<hsp />
					<div style={appearanceStyle}>
						<div className='wrapMargin flex flex-wrap justify-start'>
							<FInput
								label='Label'
								appearance={inputAppearance}
								placeholder='Default'
							/>
							<FInput
								label='Label'
								appearance={inputAppearance}
								eventOverride='hover'
								placeholder='Hover'
							/>
							<FInput
								label='Label'
								appearance={inputAppearance}
								eventOverride='focus'
								placeholder='Focus'
							/>
							<FInput
								label='Label'
								isDisabled
								appearance={inputAppearance}
								placeholder='Disabled'
							/>
							<FInput
								label='Label'
								isDisabled
								simpleDisabled
								appearance={inputAppearance}
								placeholder='Simple Disabled'
							/>
						</div>
					</div>
				</div>
				<div>
					<tag>Invalid</tag>
					<hsp />
					<div style={appearanceStyle}>
						<div className='wrapMargin flex flex-wrap justify-start'>
							<FInput
								label='Label'
								name='input'
								invalid='*'
								appearance={inputAppearance}
								placeholder='Default'
							/>
							<FInput
								label='Label'
								name='input'
								invalid='*'
								appearance={inputAppearance}
								eventOverride='hover'
								placeholder='Hover'
							/>
							<FInput
								label='Label'
								name='input'
								invalid='*'
								appearance={inputAppearance}
								eventOverride='focus'
								placeholder='Focus'
							/>
						</div>
					</div>
				</div>
			</div>
		</Section>
	)
}

const searchIcon = () => (
	<svg width='15' height='15' viewBox='0 0 15 15' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path
			d='M14.8167 13.9332L10.5511 9.66765C11.3774 8.64705 11.8749 7.35017 11.8749 5.9377C11.8749 2.66398 9.21114 0.000244141 5.93742 0.000244141C2.6637 0.000244141 0 2.66395 0 5.93767C0 9.21138 2.66373 11.8751 5.93745 11.8751C7.34993 11.8751 8.6468 11.3776 9.66741 10.5514L13.933 14.817C14.0549 14.9388 14.2149 15.0001 14.3749 15.0001C14.5349 15.0001 14.6949 14.9388 14.8168 14.817C15.0611 14.5726 15.0611 14.1776 14.8167 13.9332ZM5.93745 10.6251C3.35247 10.6251 1.25 8.52265 1.25 5.93767C1.25 3.35268 3.35247 1.25021 5.93745 1.25021C8.52244 1.25021 10.6249 3.35268 10.6249 5.93767C10.6249 8.52265 8.52241 10.6251 5.93745 10.6251Z'
			fill={config.replaceAlpha(styles.colors.black, 0.75)}
		/>
	</svg>
)
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
