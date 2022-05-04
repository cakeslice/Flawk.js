/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Capacitor } from '@capacitor/core'
import logo from 'core/assets/images/logo.svg'
import Anchor from 'core/components/Anchor'
import { Lang } from 'core/components/CodeBlock'
import Dashboard, { DashboardRoute } from 'core/components/Dashboard'
import lightOn from 'core/components/viewer/assets/lightbulb.svg'
import lightOff from 'core/components/viewer/assets/lightbulb_off.svg'
import config from 'core/config'
import styles from 'core/styles'
import { css } from 'glamor'
import React, { Component } from 'react'
import MediaQuery from 'react-responsive'
import CodeCollapse from './common/CodeCollapse'
import cssModule from './ComponentsViewer.module.scss'

const Start = React.lazy(() => import('core/components/viewer/Start'))
const Layout = React.lazy(() => import('core/components/viewer/Layout'))
const Misc = React.lazy(() => import('core/components/viewer/Misc'))
const Inputs = React.lazy(() => import('core/components/viewer/Inputs'))
const Style = React.lazy(() => import('core/components/viewer/Style'))
const Backend = React.lazy(() => import('core/components/viewer/Backend'))
const API = React.lazy(() => import('core/components/viewer/API'))

const iconWrapper = (icon: (color: string) => React.ReactNode, active: boolean, size?: number) => (
	<div
		className='flex items-center justify-center'
		style={{
			width: 20,
			height: 20,
		}}
	>
		<div className='flex items-center justify-center' style={{ width: size || 25 }}>
			{icon(active ? styles.colors.main : styles.colors.black)}
		</div>
	</div>
)

export default class ComponentsViewer extends Component {
	state = {
		horizontalDashboard: false,
	}

	componentDidMount() {
		if (global.localStorage.getItem('horizontalDashboard') === 'true')
			this.setState({ horizontalDashboard: true })
	}

	render() {
		let routes: Array<DashboardRoute> = [
			{
				id: 'logo',
				desktopTab: true,
				notRoute: true,
				tab: (props) =>
					this.state.horizontalDashboard ? (
						<div
							className='flex items-center h-full'
							style={{
								minWidth: 90,
							}}
						>
							<button
								type='button'
								style={{ display: 'flex', alignItems: 'center' }}
								onClick={() => global.routerHistory().push('/')}
							>
								<img
									style={{
										objectFit: 'contain',
										maxHeight: 25,
										minHeight: 25,
									}}
									src={logo}
								></img>
							</button>
						</div>
					) : (
						<>
							<div className='flex justify-center items-center'>
								<div
									className='flex items-center'
									style={{
										height: 120,
									}}
								>
									<button
										type='button'
										onClick={() => global.routerHistory().push('/')}
									>
										<img
											style={{
												objectFit: 'contain',
												maxHeight: props.isOpen ? 50 : 30,
												minHeight: props.isOpen ? 50 : 30,
												transition: `min-height 500ms, max-height 500ms`,
											}}
											src={logo}
										></img>
									</button>
								</div>
							</div>
							<div
								style={{
									height: 1,
									background: styles.colors.lineColor,
									width: '100%',
								}}
							></div>
							<div style={{ minHeight: 20 }}></div>
						</>
					),
			},
			{
				defaultRoute: true,
				name: 'Get Started',
				customIcon: (active) => iconWrapper(startLogo, active, 22),
				id: 'start',
				page: Start,
			},
			{
				name: 'Style',
				customIcon: (active) => iconWrapper(styleLogo, active, 22),
				id: 'style',
				page: Style,
			},
			{
				name: 'Layout',
				customIcon: (active) => iconWrapper(layoutLogo, active),
				id: 'layout',
				page: Layout,
			},
			{
				name: 'Inputs',
				customIcon: (active) => iconWrapper(inputsLogo, active, 27),
				id: 'inputs',
				page: Inputs,
			},
			{
				name: 'Misc',
				customIcon: (active) => iconWrapper(miscLogo, active, 20),
				id: 'misc',
				page: Misc,
			},
			{
				customIcon: (active) => iconWrapper(backendLogo, active, 18),
				name: 'Backend',
				id: 'backend',
				notExact: true, // Support for routes inside the component
				subRoutes: [
					{
						name: 'Auth',
						id: 'auth',
						page: Backend,
						defaultRoute: true,
					},
					{
						name: 'API',
						id: 'api',
						page: API,
					},
				],
			},
			{
				id: 'desktop_space',
				notRoute: true,
				tab: (props) => <div style={{ flexGrow: 1, minHeight: 20 }} />,
				desktopTab: true,
			},
			{
				id: 'line',
				desktopTab: true,
				notRoute: true,
				tab: (props) => (
					<div
						style={{
							height: 1,
							background: styles.colors.lineColor,
							width: '100%',
							opacity: this.state.horizontalDashboard ? 0 : 1,
						}}
					></div>
				),
			},
			{
				id: 'middle',
				notRoute: true,
				desktopTab: true,
				tab: (props) => <div style={{ height: 20 }} />,
			},
			{
				id: 'middle_mobile',
				notRoute: true,
				mobileTab: true,
				tab: (props) => <div className='grow' style={{ height: 40 }} />,
			},
			{
				name: (!global.nightMode ? 'Dark' : 'Light') + ' mode',
				notRoute: true,
				justIcon: true,
				style: { linkStyle: { opacity: 0.75 } },
				onClick: () => global.toggleNightMode(),
				customIcon: (active) => (
					<div
						{...css({
							width: 20,
							overflow: 'visible',
							padding: 0,
						})}
					>
						<img
							style={{
								maxHeight: 30,
								width: 25,
								position: 'relative',
								left: -2,
							}}
							src={global.nightMode ? lightOff : lightOn}
						></img>
					</div>
				),
				id: 'dark_mode',
			},
			{
				name: 'Flawk.js',
				notRoute: true,
				mobileTab: true,
				style: { linkStyle: { opacity: 0.75 } },
				onClick: () =>
					Capacitor.isNativePlatform()
						? window.open('https://flawk.cakeslice.dev', '_blank')
						: global.routerHistory().push('/'),
				customIcon: (active) => (
					<div
						{...css({
							display: 'flex',
							width: 20,
							padding: 0,
						})}
					>
						<img
							style={{
								width: 20,
								position: 'relative',
								top: -1,
							}}
							src={logo}
						></img>
					</div>
				),
				id: 'flawk_link',
			},
		]

		if (this.state.horizontalDashboard)
			routes = [
				{
					id: 'top_space',
					notRoute: true,
					tab: (props) => <div style={{ minWidth: '5%' }} />,
					desktopTab: true,
				},
				...routes,
				{
					id: 'bottom_space',
					notRoute: true,
					tab: (props) => <div style={{ minWidth: '5%' }} />,
					desktopTab: true,
				},
			]
		else
			routes.push({
				id: 'bottom',
				notRoute: true,
				desktopTab: true,
				tab: (props) => <div style={{ height: 40 }} />,
			})

		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<Dashboard
						horizontal={this.state.horizontalDashboard}
						horizontalHeight={50}
						path={'/components/'}
						style={{ background: styles.colors.white }}
						linkStyle={{
							...(this.state.horizontalDashboard && desktop && { height: 40 }),
							':selected': { color: styles.colors.black },
						}}
						logo={logo}
						drawerTitle={'Overview'}
						wrapperComponent={Wrapper}
						routes={routes}
						pageProps={{
							horizontalDashboard: this.state.horizontalDashboard,
							toggleDashboardLayout: () => {
								global.localStorage.setItem(
									'horizontalDashboard',
									!this.state.horizontalDashboard ? 'true' : 'false'
								)
								this.setState({
									horizontalDashboard: !this.state.horizontalDashboard,
								})
							},
						}}
					></Dashboard>
				)}
			</MediaQuery>
		)
	}
}

class Wrapper extends Component<{ children: React.ReactNode }> {
	render() {
		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div
						style={{
							padding: desktop ? '5%' : '5%',
							...(!desktop && { paddingTop: 40, paddingBottom: 40 }),
							//
							paddingTop: desktop ? 80 : 40,
							maxWidth: 1700,
							paddingBottom: 160,
						}}
					>
						{this.props.children}
					</div>
				)}
			</MediaQuery>
		)
	}
}

export const Section: React.FC<{
	title: string
	top?: boolean
	tags?: string[]
	code?: string
	lang?: Lang
	description?: React.ReactNode
}> = ({ children, title, top, tags, code, lang, description }) => {
	const id = title.replaceAll(' ', '_').toLowerCase()

	const d = description && (
		<div
			className={cssModule.section}
			style={{
				padding: '10px 15px',
				borderRadius: 5,
				border: '1px solid ' + styles.colors.lineColor,
				borderLeft: '6px solid ' + config.replaceAlpha(styles.colors.black, 0.1),
				fontSize: 13.5,
				lineHeight: '19px',
				//width: 'fit-content',
				color: config.replaceAlpha(styles.colors.black, 0.85),
				background: config.replaceAlpha(styles.colors.white, 0.5),
			}}
		>
			{description}
		</div>
	)
	return (
		<MediaQuery minWidth={880}>
			{(tablet) => (
				<>
					{!top && <sp />}
					{!top && <sp />}
					{!top && <sp />}
					{!top && <sp />}
					<Anchor id={id} updateHash>
						<div className={(tablet ? 'flex' : 'flex-col') + ' w-full'}>
							<div className={code && 'grow'}>
								<div className='flex'>
									<h3>{title}</h3>
									{tags && (
										<div
											className={!tablet ? 'grow' : ''}
											style={{ minWidth: 15 }}
										/>
									)}
									{tags && (
										<div
											className={
												'wrapMargin flex flex-wrap ' +
												(tablet ? 'justify-start' : 'justify-end')
											}
										>
											{tags.map((tag) => (
												<div
													key={id + '_' + tag}
													style={{
														display: 'flex',
														position: 'relative',
														top: 3,
													}}
												>
													<tag
														style={{
															fontFamily: 'monospace',
															color: styles.colors.main,
															letterSpacing: 0,
															opacity: 1,
															padding: '1px 5px',
															background: config.replaceAlpha(
																styles.colors.main,
																0.15
															),
														}}
													>
														{tag}
													</tag>
												</div>
											))}
										</div>
									)}
								</div>
								{code && (
									<>
										{!tags ? <hsp /> : <sp />}
										{!tags && d && <hsp />}
										{d}
										{d && <sp />}
										{!tags && !d && <hsp />} <hsp />
										{children}
									</>
								)}
							</div>
							{code && (
								<div
									className={tablet ? 'flex justify-end' : 'w-full'}
									style={{
										marginTop: !tablet ? 25 : 0,
										justifySelf: !tablet ? 'flex-end' : undefined,
									}}
								>
									<CodeCollapse
										containerStyle={{
											width: tablet ? 450 : undefined,
											maxHeight: '100%',
											//height: desktop ? 600 : undefined,
										}}
										codeStyle={{
											marginLeft: tablet ? 25 : undefined,
										}}
										data={code}
										lang={lang || 'tsx'}
									></CodeCollapse>
								</div>
							)}
						</div>
					</Anchor>
					{!code && (
						<>
							{!tags ? <hsp /> : <sp />}
							{!tags && d && <hsp />}
							{d}
							{d && <sp />}
							{!tags && !d && <hsp />} <hsp />
							{children}
						</>
					)}
				</>
			)}
		</MediaQuery>
	)
}

export const arrow = (color: string) => (
	<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path d='M21 21H3L12 3L21 21Z' fill={color} />
	</svg>
)
export const lock = (color: string) => (
	<svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path
			d='M5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V11C21 10.4696 20.7893 9.96086 20.4142 9.58579C20.0391 9.21071 19.5304 9 19 9H17V7C17 5.67392 16.4732 4.40215 15.5355 3.46447C14.5979 2.52678 13.3261 2 12 2C10.6739 2 9.40215 2.52678 8.46447 3.46447C7.52678 4.40215 7 5.67392 7 7V9H5C4.46957 9 3.96086 9.21071 3.58579 9.58579C3.21071 9.96086 3 10.4696 3 11V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22ZM12 17.5C11.6044 17.5 11.2178 17.3827 10.8889 17.1629C10.56 16.9432 10.3036 16.6308 10.1522 16.2654C10.0009 15.8999 9.96126 15.4978 10.0384 15.1098C10.1156 14.7219 10.3061 14.3655 10.5858 14.0858C10.8655 13.8061 11.2219 13.6156 11.6098 13.5384C11.9978 13.4613 12.3999 13.5009 12.7654 13.6522C13.1308 13.8036 13.4432 14.06 13.6629 14.3889C13.8827 14.7178 14 15.1044 14 15.5C14 16.0304 13.7893 16.5391 13.4142 16.9142C13.0391 17.2893 12.5304 17.5 12 17.5ZM9 9V7C9 6.20435 9.31607 5.44129 9.87868 4.87868C10.4413 4.31607 11.2044 4 12 4C12.7956 4 13.5587 4.31607 14.1213 4.87868C14.6839 5.44129 15 6.20435 15 7V9H9Z'
			fill={color}
		/>
	</svg>
)

const styleLogo = (color: string) => (
	<svg
		width='48px'
		height='48px'
		viewBox='0 0 48 48'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
	>
		<rect width='48' height='48' fill='white' fillOpacity='0.01' />
		<path
			d='M32 6H42V16'
			stroke={color}
			strokeWidth='4'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M17 32L19.1875 27M31 32L28.8125 27M19.1875 27L24 16L28.8125 27M19.1875 27H28.8125'
			stroke={color}
			strokeWidth='4'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M16 6H6V16'
			stroke={color}
			strokeWidth='4'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M32 42H42V32'
			stroke={color}
			strokeWidth='4'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M16 42H6V32'
			stroke={color}
			strokeWidth='4'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
)

const layoutLogo = (color: string) => (
	<svg
		width='24px'
		height='24px'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
	>
		<path
			fillRule='evenodd'
			clipRule='evenodd'
			d='M13 21V13H21V21H13ZM15 15H19L19 19H15V15Z'
			fill={color}
		/>
		<path
			fillRule='evenodd'
			clipRule='evenodd'
			d='M3 11L3 3L11 3V11H3ZM5 5L9 5V9L5 9L5 5Z'
			fill={color}
		/>
		<path d='M18 6V12H16V8L12 8V6L18 6Z' fill={color} />
		<path d='M12 18H6L6 12H8L8 16H12V18Z' fill={color} />
	</svg>
)
const inputsLogo = (color: string) => (
	<svg
		width='76px'
		height='76px'
		viewBox='0 0 76 76'
		xmlns='http://www.w3.org/2000/svg'
		version='1.1'
		baseProfile='full'
		enableBackground='new 0 0 76.00 76.00'
	>
		<path
			fill={color}
			fillOpacity='1'
			strokeWidth='0.2'
			strokeLinejoin='round'
			d='M 15.8333,23.75L 40.7708,23.75L 36.0208,28.5L 17.4166,28.5L 17.4166,47.5L 58.5833,47.5L 58.5833,28.5L 50.2708,28.5L 55.0208,23.75L 60.1667,23.75C 61.9156,23.75 63.3333,25.1678 63.3333,26.9167L 63.3333,49.0833C 63.3333,50.8322 61.9156,52.25 60.1667,52.25L 15.8333,52.25C 14.0844,52.25 12.6667,50.8322 12.6667,49.0833L 12.6667,26.9167C 12.6667,25.1678 14.0844,23.75 15.8333,23.75 Z M 55.0621,16.1879C 55.5053,16.6596 55.727,17.1679 55.727,17.7128L 55.5562,18.515L 55.0621,19.2378L 45.5648,28.735L 43.1676,31.1322L 40.868,33.4318L 38.8094,35.4905L 37.0953,37.1954L 35.8663,38.4153L 35.2563,39.0253L 34.2651,39.9311L 32.8621,41.0382L 31.3281,41.9715C 30.8075,42.2317 30.344,42.3618 29.9373,42.3618C 29.6201,42.3618 29.366,42.2663 29.1749,42.0751C 28.9837,41.884 28.8882,41.6238 28.8882,41.2944C 28.8882,40.8877 29.0183,40.4272 29.2786,39.9128L 30.2118,38.3787L 31.3098,36.9758L 32.2064,35.9937L 52.0122,16.1879L 52.735,15.6938L 53.5372,15.523C 54.0821,15.523 54.5904,15.7447 55.0621,16.1879 Z M 27.6499,42.0751L 29.1749,43.6001L 26.125,45.125L 27.6499,42.0751 Z '
		/>
	</svg>
)
const miscLogo = (color: string) => (
	<svg
		width='30.171px'
		height='30.171px'
		viewBox='-1.59 0 30.171 30.171'
		id='_06_-_Setting'
		data-name='06 - Setting'
		xmlns='http://www.w3.org/2000/svg'
	>
		<path
			id='Path_225'
			data-name='Path 225'
			d='M29.5,8.714a3,3,0,0,0-1.753-2.728l-10.5-4.8a3,3,0,0,0-2.494,0l-10.5,4.8A3,3,0,0,0,2.5,8.714V23.286a3,3,0,0,0,1.753,2.728l10.5,4.8a3,3,0,0,0,2.494,0l10.5-4.8A3,3,0,0,0,29.5,23.286V8.714Zm-2,0V23.286a1,1,0,0,1-.584.909l-10.5,4.8a1.006,1.006,0,0,1-.832,0l-10.5-4.8a1,1,0,0,1-.584-.909V8.714A1,1,0,0,1,5.085,7.8L15.584,3a1.006,1.006,0,0,1,.832,0l10.5,4.8A1,1,0,0,1,27.5,8.714Z'
			transform='translate(-2.501 -0.914)'
			fill={color}
			fillRule='evenodd'
		/>
		<path
			id='Path_226'
			data-name='Path 226'
			d='M16,10.715A5.285,5.285,0,1,0,21.285,16,5.287,5.287,0,0,0,16,10.715Zm0,2A3.285,3.285,0,1,1,12.715,16,3.287,3.287,0,0,1,16,12.715Z'
			transform='translate(-2.501 -0.914)'
			fillRule='evenodd'
			fill={color}
		/>
	</svg>
)
const backendLogo = (color: string) => (
	<svg
		version='1.1'
		id='Capa_1'
		xmlns='http://www.w3.org/2000/svg'
		width='20px'
		height='20px'
		viewBox='0 0 487 487'
	>
		<g>
			<path
				fill={color}
				d='M397.7,24.6C356.3,8.7,301.5,0,243.5,0S130.7,8.7,89.3,24.6C43.8,42.1,18.8,66.9,18.8,94.5v298c0,27.6,25,52.4,70.5,69.9
		c41.4,15.9,96.2,24.6,154.2,24.6s112.8-8.7,154.2-24.6c45.5-17.4,70.5-42.3,70.5-69.9v-298C468.2,66.9,443.2,42.1,397.7,24.6z
		 M441.2,392.5c0,15.2-19.9,31.9-53.2,44.7c-38.4,14.7-89.7,22.8-144.5,22.8S137.4,451.9,99,437.2c-33.3-12.8-53.2-29.5-53.2-44.7
		v-51.4c11.2,8.8,25.8,16.7,43.5,23.4c41.4,15.9,96.2,24.6,154.2,24.6s112.8-8.7,154.2-24.6c17.7-6.8,32.3-14.7,43.5-23.4V392.5z
		 M441.2,294.7c0,15.2-19.9,31.9-53.2,44.7c-38.4,14.7-89.7,22.8-144.5,22.8S137.4,354.1,99,339.4c-33.3-12.8-53.2-29.5-53.2-44.7
		v-52.9c11.2,8.8,25.8,16.7,43.5,23.4c41.4,15.9,96.2,24.6,154.2,24.6s112.8-8.7,154.2-24.6c17.7-6.8,32.3-14.7,43.5-23.4V294.7z
		 M441.2,195.3c0,15.2-19.9,31.9-53.2,44.7c-38.4,14.7-89.7,22.8-144.5,22.8S137.4,254.7,99,240c-33.3-12.8-53.2-29.5-53.2-44.7
		v-1.5v-52.9c11.2,8.8,25.8,16.7,43.5,23.4c41.4,15.9,96.2,24.6,154.2,24.6s112.8-8.7,154.2-24.6c17.7-6.8,32.3-14.7,43.5-23.4
		V195.3z M388,139.1c-38.4,14.7-89.7,22.8-144.5,22.8S137.4,153.8,99,139.1c-33.3-12.8-53.2-29.5-53.2-44.7S65.7,62.5,99,49.7
		c38.4-14.7,89.7-22.8,144.5-22.8S349.6,35,388,49.7c33.3,12.8,53.2,29.5,53.2,44.7S421.3,126.4,388,139.1z'
			/>
		</g>
		<g></g>
		<g></g>
		<g></g>
		<g></g>
		<g></g>
		<g></g>
		<g></g>
		<g></g>
		<g></g>
		<g></g>
		<g></g>
		<g></g>
		<g></g>
		<g></g>
		<g></g>
	</svg>
)

const startLogo = (color: string) => (
	<svg
		version='1.1'
		id='Capa_1'
		xmlns='http://www.w3.org/2000/svg'
		x='0px'
		y='0px'
		viewBox='0 0 488.022 488.022'
		xmlSpace='preserve'
	>
		<g>
			<path
				fill={color}
				d='M471.563,173.778l-145.5-20.8l-64.4-132c-8-15.4-30-12.2-35.3,0l-64.4,132l-145.6,20.8c-16.4,1-21.6,20.9-10.4,33.2
		l105,102.9l-25,144.5c-2.9,17.8,16.7,27.8,28.1,20.8l129.9-68.6l129.9,67.6c13.6,7,29.8-2.8,28.1-19.7l-25-144.6l105-102.9
		C494.663,193.478,485.563,175.478,471.563,173.778z M342.663,288.078c-4.2,5.2-6.2,11.4-5.2,17.7l19.7,116.4l-103.9-55.1
		c-6.7-2.8-13-2.8-18.7,0l-103.9,55.1l19.7-116.4c1-7.3-1-13.5-5.2-17.7l-84.1-82.1l116.4-16.6c6.2-1,11.4-4.2,14.6-10.4l52-105
		l52,105c3.1,5.2,8.3,9.4,14.6,10.4l116.2,16.6L342.663,288.078z'
			/>
		</g>
		<g></g>
		<g></g>
		<g></g>
		<g></g>
		<g></g>
		<g></g>
		<g></g>
		<g></g>
		<g></g>
		<g></g>
		<g></g>
		<g></g>
		<g></g>
		<g></g>
		<g></g>
	</svg>
)
