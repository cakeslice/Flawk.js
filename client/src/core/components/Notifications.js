/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get, post } from 'core/api'
import React, { Component } from 'react'
import Avatar from './Avatar'
import OutsideAlerter from './OutsideAlerter'

var Parser = require('html-react-parser')
var styles = require('core/styles').default

export default class Notifications extends Component {
	state = {
		open: false,

		data: undefined,
		unreadNotifications: 0,

		readNotifications: false,
	}

	async componentDidMount() {
		await this.fetchNotifications()
	}

	async readNotification(notificationID) {
		if (
			this.state.data &&
			this.state.unreadNotifications > 0 &&
			!this.state.readNotifications
		) {
			var res = await post('client/read_notifications', { notificationID: notificationID })
			if (res.ok) {
				await this.fetchNotifications()
			}
		}
	}
	async fetchNotifications() {
		// TODO: Pagination
		var res = await get('client/notifications')
		if (res.ok) {
			this.setState({
				data: res.body.notifications,
				unreadNotifications: res.body.unreadCount,
			})
		}
	}

	render() {
		var unread = false
		if (
			this.state.data &&
			this.state.unreadNotifications > 0 &&
			!this.state.readNotifications
		) {
			unread = true
		}

		// TODO: Multiple notification types will have different templates and data

		return (
			<OutsideAlerter
				clickedOutside={() => {
					this.setState({ open: false })
				}}
			>
				{
					<div>
						<div
							onClick={() => {
								this.setState(
									{ open: !this.state.open },
									async () => await this.fetchNotifications()
								)
							}}
							style={{ cursor: 'pointer', userSelect: 'none' }}
						>
							{bell(
								this.state.open
									? styles.colors.main
									: global.nightMode
									? 'rgba(116,116,116,1)'
									: 'rgba(176,176,176,1)',
								unread ? styles.colors.red : 'transparent'
							)}
						</div>

						{this.state.open && (
							<div style={{ maxWidth: 0, maxHeight: 0 }}>
								<div
									style={{
										position: 'relative',
										zIndex: 5,
										top: 15,
										minWidth: 300,
									}}
								>
									<div
										style={{
											...styles.card,
											...{
												overflow: 'hidden',
												padding: 5,
												paddingBottom: 0,
												boxShadow: styles.strongerShadow,
											},
										}}
									>
										<div
											style={{
												width: '100%',
												height: 400,
												overflow: 'scroll',
											}}
										>
											<div>
												{this.state.data &&
													this.state.data.map((n) => (
														<div
															key={n._id}
															style={{ cursor: 'pointer' }}
															onClick={async () => {
																await this.readNotification(n._id)
															}}
														>
															<div
																style={{
																	padding: 10,
																	marginBottom: 3,
																	display: 'flex',
																	minHeight: 60,
																	alignItems: 'center',
																}}
															>
																<div
																	style={{
																		minWidth: 7.5,
																		minHeight: 7.5,
																		marginRight: 7.5,
																		borderRadius: '50%',
																		background:
																			!n.isRead &&
																			styles.colors.main,
																	}}
																></div>
																<Avatar
																	style={{
																		width: 30,
																		height: 30,
																	}}
																	src={n.imageURL}
																></Avatar>

																{Parser(
																	n
																		? '<p style="max-width: 230px; margin-left:10px">' +
																				n.message +
																				'</p>'
																		: '<p>N/A</p>'
																)}
															</div>
														</div>
													))}
											</div>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				}
			</OutsideAlerter>
		)
	}
}

const bell = (bellColor, unreadColor) => (
	<svg width='28' height='28' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path
			d='M10 20H14C14 20.5304 13.7893 21.0391 13.4142 21.4142C13.0391 21.7893 12.5304 22 12 22C11.4696 22 10.9609 21.7893 10.5858 21.4142C10.2107 21.0391 10 20.5304 10 20ZM18 16V10C17.9986 8.58312 17.4958 7.21247 16.5806 6.13077C15.6655 5.04908 14.3971 4.32615 13 4.09V3C13 2.73478 12.8946 2.48043 12.7071 2.29289C12.5196 2.10536 12.2652 2 12 2C11.7348 2 11.4804 2.10536 11.2929 2.29289C11.1054 2.48043 11 2.73478 11 3V4.09C9.60294 4.32615 8.33452 5.04908 7.41939 6.13077C6.50425 7.21247 6.00144 8.58312 6 10V16L4 18H20L18 16Z'
			fill={bellColor}
		/>
		<circle cx='19' cy='3' r='2.5' fill={unreadColor}></circle>
	</svg>
)
