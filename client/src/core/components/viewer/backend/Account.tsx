/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { post } from 'core/api'
import Avatar from 'core/components/Avatar'
import FButton from 'core/components/FButton'
import config from 'core/config'
import styles from 'core/styles'
import { Form, Formik } from 'formik'
import { ReduxProps } from 'project-types'
import { useMediaQuery } from 'react-responsive'

export default function Account(props: ReduxProps) {
	const desktop = useMediaQuery({ minWidth: config.mobileWidthTrigger })

	const { fetchingUser, fetchUser, user } = props

	return (
		<div className={desktop ? 'wrapMargin flex flex-wrap justify-start' : ''}>
			<Formik
				enableReinitialize
				initialValues={{}}
				onSubmit={async (values, { setSubmitting }) => {
					setSubmitting(true)
					const res = await post('client/logout', {})
					setSubmitting(false)

					if (res.ok) {
						await fetchUser()
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
										src={user && user.personal && user.personal.photoURL}
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
	)
}
