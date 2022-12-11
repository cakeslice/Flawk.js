/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get } from 'core/api'
import logo from 'core/assets/images/logo.svg'
import Dropdown from 'core/components/Dropdown'
import { getSearch } from 'core/components/QueryParams'
import config from 'core/config'
import styles from 'core/styles'
import _find from 'lodash/find'
import _uniqBy from 'lodash/uniqBy'
import { useState, useMemo } from 'react'
import { useMediaQuery } from 'react-responsive'

const simpleOptions = [
	{
		value: 'yes',
		label: 'Yes',
	},
	{
		value: 'no',
		label: 'No',
	},
	{
		value: 'maybe',
		label: 'Maybe',
	},
]
const dropdownOptions = (function o() {
	const p = [
		{
			value: 'disabled',
			label: 'Disabled',
			isDisabled: true,
		},
	]
	p.push({
		value: 'long',
		label: 'Long option is very very long',
		isDisabled: false,
	})
	for (let i = 0; i < 60; i++) {
		p.push({
			value: 'option' + i.toString(),
			label: 'Option ' + i.toString(),
			isDisabled: false,
		})
	}
	return p
})()

export default function _Dropdown() {
	const [inputAppearance, setInputAppearance] = useState('default')
	const [usageBackground, setUsageBackground] = useState<string>()

	const appearanceStyle = useMemo(
		() => ({
			...styles.outlineCard,
			background: usageBackground,
			color: usageBackground && config.invertColor(usageBackground, styles.colors.whiteDay),
			maxWidth: 950,
		}),
		[usageBackground]
	)

	const appearanceDropdown = useMemo(() => {
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
	}, [])

	//

	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })

	return (
		<>
			<div style={{ ...styles.card, maxWidth: 783 }}>
				<div className='wrapMargin flex flex-wrap justify-start'>
					{desktop && (
						<Dropdown
							uncontrolled
							style={{ flexGrow: 1 }}
							isSearchable
							label='Full width'
							defaultValue='accept'
							options={dropdownOptions}
						/>
					)}
					<Dropdown
						uncontrolled
						isSearchable
						loadOptions={async (input, callback) => {
							const q = {
								q: input,
							}

							const link =
								'https://jsonplaceholder.typicode.com/todos?' + getSearch(q)

							const res = await get(link, {
								internal: false,
							})

							if (res.ok && res.body) {
								const items = res.body as unknown as {
									id: string
									title: string
								}[]
								const options =
									items.map((d) => {
										return {
											value: d.id,
											label: d.title,
										}
									}) || []
								callback(options)
							}
						}}
						label={'Async search'}
					/>
				</div>
				<sp />
				<div className='wrapMargin flex flex-wrap justify-start'>
					<Dropdown
						uncontrolled
						name='dropdown'
						label='Invalid Label'
						erasable
						placeholder='Long placeholder really long'
						invalid='*'
						options={dropdownOptions}
						isSearchable
					/>
					<Dropdown
						uncontrolled
						emptyLabel
						name='dropdown'
						defaultValue='accept'
						placeholder='Invalid Bottom'
						erasable
						invalidType='bottom'
						invalid='Not allowed'
						options={dropdownOptions}
						isSearchable
					/>

					<Dropdown
						uncontrolled
						emptyLabel
						name='dropdown'
						menuPlacement='top'
						placeholder='Invalid Right'
						erasable
						invalid='*'
						invalidType='right'
						options={dropdownOptions}
						isSearchable
					/>
				</div>
				<sp />
				<div className='wrapMargin flex flex-wrap justify-start'>
					<div className='flex items-center' style={{ paddingRight: 10 }}>
						<tag>Custom Input</tag>
						<hsp />
						<Dropdown
							customInput
							style={{ menu: { left: 0 } }}
							options={[
								{
									label: (
										<div className='flex items-center'>
											{searchIcon()}
											<hsp />
											Search
										</div>
									),
									value: 'search',
								},
								{
									label: 'Danger zone',
									options: [
										{
											value: 'edit',
											label: 'Edit',
										},
										{
											value: 'delete',
											label: 'Delete',
											style: {
												color: styles.colors.red,
												':hover': {
													background: config.replaceAlpha(
														styles.colors.red,
														0.15
													),
												},
											},
										},
									],
								},
							]}
						/>
					</div>
					<Dropdown
						button
						placeholder='Button'
						defaultValue='accept'
						options={dropdownOptions}
					/>
					<Dropdown
						uncontrolled
						dropdownIndicator={
							<div className='flex items-center justify-center'>
								<img style={{ height: 20 }} src={logo}></img>
							</div>
						}
						placeholder='Custom indicator'
						defaultValue='accept'
						options={dropdownOptions}
					/>
				</div>
			</div>
			<sp />
			<sp />
			{appearanceDropdown}
			<sp />
			<sp />
			<div style={{ maxWidth: 1100 }} className='wrapMarginBig flex flex-wrap justify-start'>
				<div>
					<tag>Normal</tag>
					<hsp />
					<div style={appearanceStyle}>
						<div className='wrapMargin flex flex-wrap justify-start'>
							<Dropdown
								uncontrolled
								label='Label'
								appearance={inputAppearance}
								placeholder='Default'
								options={simpleOptions}
								isSearchable
							/>
							<Dropdown
								uncontrolled
								label='Label'
								appearance={inputAppearance}
								eventOverride='hover'
								placeholder='Hover'
								options={simpleOptions}
								isSearchable
							/>
							<Dropdown
								uncontrolled
								label='Label'
								appearance={inputAppearance}
								eventOverride='focus'
								placeholder='Focus'
								options={simpleOptions}
								isSearchable
							/>
							<Dropdown
								uncontrolled
								label='Label'
								isDisabled
								appearance={inputAppearance}
								placeholder='Disabled'
								options={simpleOptions}
								isSearchable
							/>
							<Dropdown
								uncontrolled
								label='Label'
								isDisabled
								appearance={inputAppearance}
								placeholder='Simple Disabled'
								options={simpleOptions}
								isSearchable
								simpleDisabled
							/>
						</div>
					</div>
				</div>
				<div>
					<tag>Invalid</tag>
					<hsp />
					<div style={appearanceStyle}>
						<div className='wrapMargin flex flex-wrap justify-start'>
							<Dropdown
								uncontrolled
								label='Label'
								appearance={inputAppearance}
								name='input'
								invalid='*'
								placeholder='Default'
								options={simpleOptions}
								isSearchable
							/>
							<Dropdown
								uncontrolled
								label='Label'
								appearance={inputAppearance}
								name='input'
								invalid='*'
								eventOverride='hover'
								placeholder='Hover'
								options={simpleOptions}
								isSearchable
							/>
							<Dropdown
								uncontrolled
								label='Label'
								appearance={inputAppearance}
								name='input'
								invalid='*'
								eventOverride='focus'
								placeholder='Focus'
								options={simpleOptions}
								isSearchable
							/>
						</div>
					</div>
				</div>
			</div>
		</>
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
