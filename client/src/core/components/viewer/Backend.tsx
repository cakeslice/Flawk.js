/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { post } from 'core/api'
import Avatar from 'core/components/Avatar'
import CodeBlock from 'core/components/CodeBlock'
import FButton from 'core/components/FButton'
import FTable from 'core/components/FTable'
import Notifications from 'core/components/Notifications'
import config from 'core/config'
import styles from 'core/styles'
import { Form, Formik } from 'formik'
import { fetchStructures, fetchUser } from 'project/redux/AppReducer'
import { useStoreDispatch, useStoreSelector } from 'project/redux/_store'
import React from 'react'
import { useMediaQuery } from 'react-responsive'
import { lock, Next, Section } from './ComponentsViewer'

//

const Login = React.lazy(() => import('core/components/viewer/backend/Login'))
const Register = React.lazy(() => import('core/components/viewer/backend/Register'))
const Forgot = React.lazy(() => import('core/components/viewer/backend/Forgot'))
const Settings = React.lazy(() => import('core/components/viewer/backend/Settings'))
const Admin = React.lazy(() => import('core/components/viewer/backend/Admin'))

//

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
			<Section title='Authentication' top>
				<div className={desktop ? 'wrapMarginBig flex flex-wrap justify-start' : undefined}>
					<div>
						<tag>Signup</tag>
						<hsp />
						<Register {...reduxProps} desktop={desktop}></Register>
					</div>
					{!desktop && <sp />}
					{!desktop && <sp />}
					<div>
						<tag>Login</tag>
						<hsp />
						<Login {...reduxProps} desktop={desktop}></Login>
					</div>
					{!desktop && <sp />}
					{!desktop && <sp />}
					<div>
						<tag>Forgot password</tag>
						<hsp />
						<Forgot {...reduxProps} desktop={desktop}></Forgot>
					</div>
				</div>
			</Section>

			<Section title='Account & Logout'>
				{user ? (
					<div className={desktop ? 'wrapMargin flex flex-wrap justify-start' : ''}>
						<Formik
							enableReinitialize
							initialValues={{}}
							onSubmit={async (values, { setSubmitting }) => {
								setSubmitting(true)
								const res = await post('client/logout', {})
								setSubmitting(false)

								if (res.ok) {
									await fetchUser(dispatch)
								}
							}}
						>
							{({ isSubmitting, errors }) => {
								return (
									<Form noValidate>
										<div className='flex flex-wrap items-center justify-center'>
											<button
												type='button'
												style={{
													fontSize: styles.defaultFontSize,
													padding: 0,
													display: 'flex',
													alignItems: 'center',
													color: styles.colors.black,
												}}
											>
												<Avatar
													src={
														user &&
														user.personal &&
														user.personal.photoURL
													}
													style={{
														width: 30,
														height: 30,
														marginRight: 5,
													}}
												></Avatar>
												{user && (
													<p
														style={{
															fontSize: styles.defaultFontSize,
															maxWidth: 100,
															marginLeft: 10,
															textOverflow: 'ellipsis',
															overflow: 'hidden',
															whiteSpace: 'nowrap',
														}}
													>
														{user.personal && user.personal.firstName}
													</p>
												)}
											</button>
											<sp />
											<sp />
											{user && (
												<FButton
													type='submit'
													formErrors={errors}
													isLoading={isSubmitting || fetchingUser}
													appearance='secondary'
												>
													{'Logout'}
												</FButton>
											)}
										</div>
									</Form>
								)
							}}
						</Formik>
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

			<Section title='Settings'>
				{user ? (
					<div>
						<Settings {...reduxProps} desktop={desktop}></Settings>
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

			<Section title='Notifications'>
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
				<Section title='Admin'>
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

			<Section title='Remote data'>
				<div style={{ maxWidth: 700 }} className='flex-col justify-center'>
					{structures &&
						Object.keys(structures).map((result: string, j) => (
							<div key={result}>
								<tag>{result}</tag>
								<hsp />
								<FTable
									height={'250px'}
									hideHeader
									keySelector={'_id'}
									expandContent={(data) => (
										<CodeBlock
											lang='json'
											data={JSON.stringify({
												...data,
												id: undefined,
												__v: undefined,
											})}
										/>
									)}
									columns={[
										{
											name: 'Name',
											selector: 'name',

											cell: (c) => (
												<div>{c && config.localize(c as string)}</div>
											),
										},
										{
											name: 'Code',
											selector: 'code',
										},
									]}
									data={structures && structures[result]}
								></FTable>
								<sp />
							</div>
						))}
				</div>
			</Section>

			<Section title='Websockets' tags={['global.socket.emit()']}>
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
