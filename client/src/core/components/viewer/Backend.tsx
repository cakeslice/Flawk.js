/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { post } from 'core/api'
import FButton from 'core/components/FButton'
import Notifications from 'core/components/Notifications'
import config from 'core/config'
import styles from 'core/styles'
import { fetchStructures, fetchUser } from 'project/redux/AppReducer'
import { useStoreDispatch, useStoreSelector } from 'project/redux/_store'
import { useMediaQuery } from 'react-responsive'
import { lock, Next, Section } from './ComponentsViewer'

// Can't use React.lazy() for anchor links to work

import Account from 'core/components/viewer/backend/Account'
import Admin from 'core/components/viewer/backend/Admin'
import Forgot from 'core/components/viewer/backend/auth/Forgot'
import Login from 'core/components/viewer/backend/auth/Login'
import Register from 'core/components/viewer/backend/auth/Register'
import RemoteData from 'core/components/viewer/backend/RemoteData'
import Settings from 'core/components/viewer/backend/Settings'

export default function Backend() {
	const { structures, fetchingStructures, user, fetchingUser, authError } = useStoreSelector(
		(state) => ({
			structures: state.app.structures,
			fetchingStructures: state.app.fetchingStructures,
			user: state.app.user,
			fetchingUser: state.app.fetchingUser,
			authError: state.app.authError,
		})
	)
	const dispatch = useStoreDispatch()

	const reduxProps = {
		structures,
		fetchingStructures,
		user,
		fetchingUser,
		authError,
		//
		fetchUser: async () => await fetchUser(dispatch),
		fetchStructures: async () => await fetchStructures(dispatch),
	}

	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })
	return (
		<div className='flex-col'>
			<Section
				title='Authentication'
				description='How to login, register and recover an account'
				top
				github='client/src/core/components/viewer/backend/auth'
			>
				<div className={desktop ? 'wrapMarginBig flex flex-wrap justify-start' : undefined}>
					<div>
						<tag>Signup</tag>
						<hsp />
						<Register {...reduxProps}></Register>
					</div>
					{!desktop && <sp />}
					{!desktop && <sp />}
					<div>
						<tag>Login</tag>
						<hsp />
						<Login {...reduxProps}></Login>
					</div>
					{!desktop && <sp />}
					{!desktop && <sp />}
					<div>
						<tag>Forgot password</tag>
						<hsp />
						<Forgot {...reduxProps}></Forgot>
					</div>
				</div>
			</Section>

			<Section
				title='Account & Logout'
				github='client/src/core/components/viewer/backend/Account.tsx'
				description='How to display account data and logout of the account'
			>
				{user ? (
					<Account {...reduxProps} />
				) : (
					<div>
						<span>
							{lock(
								config.replaceAlpha(
									styles.colors.black,
									global.nightMode ? 0.15 : 0.25
								)
							)}
						</span>
						<span> </span>
						<span style={{ verticalAlign: 'top' }}>Please login to view</span>
					</div>
				)}
			</Section>

			<Section
				title='Settings'
				github='client/src/core/components/viewer/backend/Settings.tsx'
				description='How to get and set account settings'
			>
				{user ? (
					<div>
						<Settings {...reduxProps}></Settings>
					</div>
				) : (
					<div>
						<span>
							{lock(
								config.replaceAlpha(
									styles.colors.black,
									global.nightMode ? 0.15 : 0.25
								)
							)}
						</span>
						<span> </span>
						<span style={{ verticalAlign: 'top' }}>Please login to view</span>
					</div>
				)}
			</Section>

			<Section
				title='Notifications'
				github='client/src/core/components/Notifications.tsx'
				description='Component that showcase the notifications system'
			>
				{user ? (
					<div className='flex' style={{ ...styles.card }}>
						<Notifications></Notifications>
						<sp />
						<FButton
							onClick={async () => {
								const res = await post('client/create_notification', {
									notificationType: 'Your video is ready',
									message: 'test.mp4 processing is complete',
								})
							}}
						>
							Test
						</FButton>
					</div>
				) : (
					<div>
						<span>
							{lock(
								config.replaceAlpha(
									styles.colors.black,
									global.nightMode ? 0.15 : 0.25
								)
							)}
						</span>
						<span> </span>
						<span style={{ verticalAlign: 'top' }}>Please login to view</span>
					</div>
				)}
			</Section>

			{!config.prod && (
				<Section title='Admin' github='client/src/core/components/viewer/backend/Admin.tsx'>
					{user && user.permission <= 10 ? (
						<Admin></Admin>
					) : (
						<div>
							<div>
								<span>
									{lock(
										config.replaceAlpha(
											styles.colors.black,
											global.nightMode ? 0.15 : 0.25
										)
									)}
								</span>
								<span> </span>
								<span style={{ verticalAlign: 'top' }}>
									Please login as Admin to view
								</span>
							</div>
							<div style={{ fontSize: 13, opacity: 0.5 }}>
								{'Check "permission" property in the Client document'}
							</div>
						</div>
					)}
				</Section>
			)}

			<Section
				title='Remote data'
				github='client/src/core/components/viewer/backend/RemoteData.tsx'
				description='How to get remote public data stored in the server'
			>
				<RemoteData {...reduxProps} />
			</Section>

			<Section
				title='Websockets'
				tags={['global.socket.emit()']}
				//description='Websockets notification system test'
			>
				{user ? (
					<div className='wrapMargin flex flex-wrap justify-start items-center'>
						<FButton
							onClick={async () => {
								const token = await global.storage.getItem('token')
								if (config.websocketSupport)
									global.socket.emit('test', { token: token })
							}}
						>
							Test
						</FButton>
					</div>
				) : (
					<div>
						<span>
							{lock(
								config.replaceAlpha(
									styles.colors.black,
									global.nightMode ? 0.15 : 0.25
								)
							)}
						</span>
						<span> </span>
						<span style={{ verticalAlign: 'top' }}>Please login to view</span>
					</div>
				)}
			</Section>

			<Next backName='Misc' backLink='misc' name='API' link='backend/api' />
		</div>
	)
}
