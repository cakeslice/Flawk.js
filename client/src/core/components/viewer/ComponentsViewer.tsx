/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import logo from 'core/assets/images/logo.svg'
import Dashboard, { DashboardRoute } from 'core/components/Dashboard'
import config from 'core/config_'
import styles from 'core/styles'
import React, { Component } from 'react'
import MediaQuery from 'react-responsive'
import scrollToElement from 'scroll-to-element'

const Layout = React.lazy(() => import('core/components/viewer/Layout'))
const Misc = React.lazy(() => import('core/components/viewer/Misc'))
const Inputs = React.lazy(() => import('core/components/viewer/Inputs'))
const Style = React.lazy(() => import('core/components/viewer/Style'))
const Backend = React.lazy(() => import('core/components/viewer/Backend'))
const API = React.lazy(() => import('core/components/viewer/API'))

export default class ComponentsViewer extends Component {
	componentDidMount() {
		this.jumpToHash()
	}
	componentDidUpdate() {
		this.jumpToHash()
	}

	jumpToHash = () => {
		const hash = global.routerHistory().location.hash
		if (hash) {
			scrollToElement(hash, { offset: -120 })
		}
	}

	render() {
		const routes: Array<DashboardRoute> = [
			{
				id: 'logo',
				desktopTab: true,
				notRoute: true,
				tab: (props) => (
					<div>
						<div className='flex justify-center items-center'>
							<div
								className='flex items-center'
								style={{
									display: 'flex',
									alignItems: 'center',
									height: 120,
								}}
							>
								<button onClick={() => global.routerHistory().push('/')}>
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
					</div>
				),
			},
			{
				defaultRoute: true,
				name: 'Style',
				icon: logo,
				id: 'style',
				page: Style,
			},
			{
				name: 'Layout',
				icon: logo,
				id: 'layout',
				page: Layout,
			},
			{
				name: 'Inputs',
				icon: logo,
				id: 'inputs',
				page: Inputs,
			},
			{
				name: 'Misc',
				icon: logo,
				id: 'misc',
				page: Misc,
			},
			{
				name: 'Backend',
				icon: logo,
				id: 'backend',
				page: Backend,
			},
			{
				name: 'API',
				icon: logo,
				id: 'api',
				page: API,
			},
			{
				id: 'mobile_space',
				notRoute: true,
				tab: (props) => <div key={props.key} style={{ minHeight: '30%' }}></div>,
				mobileTab: true,
			},
			{
				id: 'desktop_space',
				notRoute: true,
				tab: (props) => <div key={props.key} style={{ flexGrow: 1 }} />,
				desktopTab: true,
			},
		]

		return (
			<Dashboard
				path={'/components/'}
				color={styles.colors.white}
				logo={logo}
				// Redux props
				pageProps={this.props}
				wrapperComponent={Wrapper}
				routes={routes}
			></Dashboard>
		)
	}
}
class Wrapper extends Component {
	render() {
		return (
			<MediaQuery minWidth={config.mobileWidthTrigger}>
				{(desktop) => (
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							padding: desktop ? 40 : 20,
							...(!desktop && { paddingTop: 40, paddingBottom: 40 }),
							//
							paddingTop: desktop ? 80 : 40,
						}}
					>
						<div
							style={{
								width: '100%',
								maxWidth: 1200,
								marginBottom: 160,
							}}
						>
							{this.props.children}
						</div>
					</div>
				)}
			</MediaQuery>
		)
	}
}

export const header = (title: string, top?: boolean) => (
	<div>
		{!top && <sp />}
		{!top && <sp />}
		{!top && <sp />}
		<h3>{title}</h3>
		<sp />
		<sp />
	</div>
)

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
