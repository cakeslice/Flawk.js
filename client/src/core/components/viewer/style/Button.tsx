/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import logo from 'core/assets/images/logo.svg'
import Dropdown from 'core/components/Dropdown'
import FButton from 'core/components/FButton'
import config from 'core/config'
import styles from 'core/styles'
import _find from 'lodash/find'
import _uniqBy from 'lodash/uniqBy'
import { useState } from 'react'

export default function Card() {
	const [buttonAppearance, setButtonAppearance] = useState('default')
	const [usageBackground, setUsageBackground] = useState<string>()

	const appearanceStyle = {
		...styles.outlineCard,
		background: usageBackground,
		color: usageBackground && config.invertColor(usageBackground, styles.colors.whiteDay),
		maxWidth: 950,
	}

	return (
		<>
			{' '}
			<div
				style={{
					...styles.card,
					maxWidth: 950,
				}}
			>
				<div className='wrapMargin flex flex-wrap justify-start'>
					<FButton style={{ minWidth: 50 }}>Default</FButton>
					<FButton
						appearance='primary'
						style={{
							minWidth: 50,
						}}
					>
						Primary
					</FButton>
					<FButton
						appearance='secondary'
						style={{
							minWidth: 50,
						}}
					>
						Secondary
					</FButton>
					{styles.buttonAppearances().map((e) => (
						<FButton key={'button_' + e.name} appearance={e.name}>
							{config.capitalizeAll(e.name.replaceAll('_', ' '))}
						</FButton>
					))}
				</div>
				<sp />
				<div className='wrapMargin flex flex-wrap justify-start items-center'>
					<FButton
						style={{
							minWidth: 100,
							justifyContent: 'space-between',
						}}
					>
						<div>Icon</div>
						<img style={{ maxHeight: 15, marginLeft: 7.5 }} src={logo}></img>
					</FButton>
					<FButton isLoading style={{ minWidth: 50 }}>
						Loading
					</FButton>
					<FButton checkbox='Checkbox'></FButton>
					<FButton target='_blank' href='https://github.com/cakeslice'>
						Link
					</FButton>
					<button type='button'>Basic</button>
					<FButton style={{ flexGrow: 1 }}>Full width</FButton>
				</div>
			</div>
			<sp />
			<sp />
			<Dropdown
				label='Appearance'
				value={buttonAppearance}
				onChange={(e) => {
					const appearance = _find(styles.buttonAppearances(), {
						name: e,
					})
					setButtonAppearance(e as string)
					setUsageBackground(appearance && appearance.usageBackground)
				}}
				options={_uniqBy(
					[
						{ label: 'Default', value: 'default' },
						{ label: 'Primary', value: 'primary' },
						{ label: 'Secondary', value: 'secondary' },
					].concat(
						styles.buttonAppearances().map((e) => {
							return {
								label: config.capitalizeAll(e.name.replaceAll('_', ' ')),
								value: e.name,
							}
						})
					),
					(e) => e.value
				)}
			></Dropdown>
			<sp />
			<sp />
			<div style={{ maxWidth: 1100 }} className='wrapMarginBig flex flex-wrap justify-start'>
				<div>
					<tag>Normal</tag>
					<hsp />
					<div style={appearanceStyle}>
						<div className='wrapMargin flex flex-wrap justify-start'>
							<FButton appearance={buttonAppearance} style={{ minWidth: 50 }}>
								Default
							</FButton>
							<FButton
								eventOverride='hover'
								appearance={buttonAppearance}
								style={{ minWidth: 50 }}
							>
								Hover
							</FButton>
							<FButton
								eventOverride='active'
								appearance={buttonAppearance}
								style={{ minWidth: 50 }}
							>
								Active
							</FButton>
							<FButton
								eventOverride='focus-visible'
								appearance={buttonAppearance}
								style={{ minWidth: 50 }}
							>
								Focus
							</FButton>
							<FButton
								isDisabled
								appearance={buttonAppearance}
								style={{ minWidth: 50 }}
							>
								Disabled
							</FButton>
							<FButton
								isDisabled
								simpleDisabled
								appearance={buttonAppearance}
								style={{ minWidth: 50 }}
							>
								Simple Disabled
							</FButton>
						</div>
						<sp />
						<div className='wrapMargin flex flex-wrap justify-start'>
							<div className='flex'>
								<FButton checkbox appearance={buttonAppearance} />
								<FButton
									checkbox='Default'
									defaultChecked={true}
									appearance={buttonAppearance}
								/>
							</div>{' '}
							<div className='flex'>
								<FButton
									checkbox
									eventOverride='hover'
									appearance={buttonAppearance}
								/>
								<FButton
									checkbox='Hover'
									defaultChecked={true}
									eventOverride='hover'
									appearance={buttonAppearance}
								/>
							</div>{' '}
							{/* <div className='flex'>
													<FButton
														checkbox
														eventOverride='focus'
														appearance={buttonAppearance}
													/>
													<FButton
														checkbox={'Focus'}
														defaultChecked={true}
														eventOverride='focus'
														appearance={buttonAppearance}
													/>
												</div>{' '} */}
							<div className='flex'>
								<FButton isDisabled checkbox appearance={buttonAppearance} />
								<FButton
									isDisabled
									checkbox='Disabled'
									defaultChecked={true}
									appearance={buttonAppearance}
								/>
							</div>{' '}
							<div className='flex'>
								<FButton
									isDisabled
									simpleDisabled
									checkbox
									appearance={buttonAppearance}
								/>
								<FButton
									isDisabled
									simpleDisabled
									checkbox='Simple Disabled'
									defaultChecked={true}
									appearance={buttonAppearance}
								/>
							</div>{' '}
						</div>
					</div>
				</div>

				<div>
					<tag>Invalid</tag>
					<hsp />
					<div style={appearanceStyle}>
						<div className='wrapMargin flex flex-wrap justify-start'>
							<div className='flex items-center'>
								<FButton
									name='checkbox'
									invalid='*'
									checkbox
									appearance={buttonAppearance}
								/>
								<FButton
									name='checkbox'
									invalid='*'
									checkbox='Default'
									defaultChecked={true}
									appearance={buttonAppearance}
								/>
							</div>{' '}
							<div className='flex items-center'>
								<FButton
									name='checkbox'
									invalid='*'
									checkbox
									eventOverride='hover'
									appearance={buttonAppearance}
								/>
								<FButton
									name='checkbox'
									invalid='*'
									checkbox='Hover'
									defaultChecked={true}
									eventOverride='hover'
									appearance={buttonAppearance}
								/>
							</div>
							{/* {' '}
												<div className='flex items-center'>
													<FButton
														name='checkbox'
														invalid='*'
														checkbox
														eventOverride='focus'
														appearance={buttonAppearance}
													/>
													<FButton
														name='checkbox'
														invalid='*'
														checkbox='Focus'
														defaultChecked={true}
														eventOverride='focus'
														appearance={buttonAppearance}
													/>
												</div> */}
						</div>
					</div>
				</div>

				<div>
					<tag>Loading</tag>
					<hsp />
					<div
						className='wrapMarginBig flex flex-wrap justify-start'
						style={appearanceStyle}
					>
						<div className='flex-col items-center'>
							<FButton
								isLoading
								appearance={buttonAppearance}
								style={{ minWidth: 50 }}
							>
								Default
							</FButton>
							<div style={{ minHeight: 5 }} />
							<div>Default</div>
						</div>
						<div className='flex-col items-center'>
							<FButton
								isLoading
								eventOverride='hover'
								appearance={buttonAppearance}
								style={{ minWidth: 50 }}
							>
								Hover
							</FButton>
							<div style={{ minHeight: 5 }} />
							<div>Hover</div>
						</div>
						<div className='flex-col items-center'>
							<FButton
								isLoading
								eventOverride='focus-visible'
								appearance={buttonAppearance}
								style={{ minWidth: 50 }}
							>
								Focus
							</FButton>
							<div style={{ minHeight: 5 }} />
							<div>Focus</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
