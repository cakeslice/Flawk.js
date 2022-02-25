/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config'
import { AppState, EmailTrack } from 'core/database'
import crypto from 'crypto'
import { Obj } from 'flawk-types'
import moment from 'moment'
import nodemailer from 'nodemailer'
import hbs from 'nodemailer-express-handlebars'
import { htmlToText } from 'nodemailer-html-to-text'
import postmark from 'postmark'
import { Client } from 'project/database'

const postmarkClient = config.postmarkKey
	? new postmark.ServerClient(config.postmarkKey)
	: undefined
let nodemailerClient: nodemailer.Transporter<unknown> | undefined = undefined
function setupNodemailer() {
	const port = config.nodemailerPort || 465
	nodemailerClient = nodemailer.createTransport({
		host: config.nodemailerHost,
		port: port,
		secure: port != 465 ? false : true, // eslint-disable-line
		auth: {
			user: config.nodemailerUser,
			pass: config.nodemailerPass,
		},
		requireTLS: true,
	})
	const dir = './app/project/email_templates/'
	nodemailerClient.use(
		'compile',
		hbs({
			viewEngine: {
				partialsDir: dir + 'partials',
				layoutsDir: dir + 'layouts',
				defaultLayout: 'main',
				extname: '.hbs',
			},
			extName: '.hbs',
			viewPath: dir,
		})
	)
	nodemailerClient.use('compile', htmlToText())
}

type EmailData = { subject: string; substitutions: Obj }
type EmailBulkData = { subject: string; substitutions: Obj } & {
	email: string
}
type EmailBody = {
	TemplateAlias: string
	TemplateModel: Obj & { subject: string }
	From: string
	ReplyTo?: string
	To: string
	MessageStream?: string
}

export async function sendEmail(
	email: string,
	data: EmailData,
	template: string,
	options?: { marketing: boolean }
) {
	const { marketing } = {
		marketing: false,
		...options,
	}

	const body: EmailBody = {
		TemplateAlias: template,
		TemplateModel: {
			...data.substitutions,
			subject: !config.prod ? '[TEST] ' + data.subject : data.subject,
		},
		From: config.emailFrom,
		ReplyTo: config.replyTo,
		To: email,
		MessageStream: marketing ? 'marketing' : undefined,
	}

	if (process.env.noEmails === 'true') {
		console.log('Skipped e-mail: ' + JSON.stringify(body))
		return false
	}
	if (!template) {
		console.log('No template provided! Skipped e-mail: ' + JSON.stringify(body))
		return false
	}

	if (config.jest) return true

	console.log('Sending e-mail: ' + JSON.stringify(body))
	if (postmarkClient) {
		const response = await postmarkClient.sendEmailWithTemplate(body)
		if (response.ErrorCode === 0) {
			console.log('E-mail sent! (202)')
			return true
		} else {
			console.log(template + ': ' + JSON.stringify(response))
			return false
		}
	} else if (nodemailerClient) {
		const client = await Client.findOne({ email: body.To }).select('_id')

		const emailHash = crypto.createHash('md5').update(body.To).digest('hex')
		const emailTrack = new EmailTrack({
			emailHash: emailHash,
			timestamp: new Date(),
			template: template,
			subject: body.TemplateModel.subject,
			client: client ? client._id : undefined,
		})
		const emailTrackID = emailTrack._id

		// @ts-ignore
		const info = (await nodemailerClient.sendMail({
			from: body.From,
			replyTo: body.ReplyTo,
			to: body.To,
			subject: body.TemplateModel.subject,

			//text: 'Hello world?',
			//html: '<b>Hello world?</b>',
			// @ts-ignore
			template: template,

			context: {
				email: body.To,
				...data.substitutions,
				...(process.env.emailTrackingURL && {
					_tracking_:
						process.env.emailTrackingURL +
						'?email=' +
						encodeURIComponent(body.To) +
						'&template=' +
						template +
						'&_id=' +
						emailTrackID,
				}),
			},

			headers: {
				'X-PM-Tag': template,
			},
		})) as Obj

		await emailTrack.save()

		console.log(
			'Message sent: %s',
			info && info.messageId ? (info.messageId as string) : 'UNKNOWN'
		)
		return true
	} else {
		console.log('Skipped sending e-mail, no e-mail service!')
		return false
	}
}
export async function sendBulkEmails(array: [EmailBulkData], template: string) {
	const bodies: EmailBody[] = []
	array.forEach((a) => {
		bodies.push({
			TemplateAlias: template,
			TemplateModel: {
				...a.substitutions,
				subject: !config.prod ? '[TEST-BULK] ' + a.subject : a.subject,
			},
			From: config.emailFrom,
			ReplyTo: config.replyTo,
			To: a.email,
			MessageStream: 'marketing',
		})
	})
	if (process.env.noEmails === 'true') {
		console.log('------------ Skipped batch e-mails ------------')
		return false
	}
	if (!template) {
		console.log('No template provided! Skipped batch e-mails')
		return false
	}

	if (config.jest) return true

	console.log('------------ Sending batch e-mails ------------')
	if (postmarkClient) {
		const response = await postmarkClient.sendEmailBatchWithTemplates(bodies)

		let errorFound = false
		response.forEach((r) => {
			if (r.ErrorCode !== 0) {
				console.log(JSON.stringify(r))
				errorFound = true
			}
		})
		return errorFound ? false : true
	} else {
		console.log('Skipped sending e-mails, no e-mail service!')
		return false
	}
}
export async function sendAdminEmail(data: EmailData, template = 'generic', developer = false) {
	let adminEmails = ''
	for (let i = 0; i < config.adminEmails.length; i++) {
		if (i === config.adminEmails.length - 1) adminEmails += config.adminEmails[i]
		else adminEmails += config.adminEmails[i].email + ', '
	}
	const pre = config.appName + ' Admin: '
	const to = !config.prod || (developer && config.prod) ? config.developerEmail : adminEmails
	const body: EmailBody = {
		TemplateAlias: template,
		TemplateModel: {
			email: to,
			...data.substitutions,
			subject: !config.prod ? '[TEST-ADMIN] ' + pre + data.subject : pre + data.subject,
		},
		From: config.emailFrom,
		ReplyTo: config.replyTo,
		To: to,
	}
	if (process.env.noEmails === 'true') {
		console.log('Skipped e-mail: ' + JSON.stringify(body))
		return false
	}
	if (!template) {
		console.log('No template provided! Skipped e-mail: ' + JSON.stringify(body))
		return false
	}

	if (config.jest) return true

	console.log('Sending e-mail: ' + JSON.stringify(body))

	if (postmarkClient) {
		const response = await postmarkClient.sendEmailWithTemplate(body)
		if (response.ErrorCode === 0) {
			console.log('E-mail sent! (202)')
			return true
		} else {
			console.log(JSON.stringify(response))
			return false
		}
	} else if (nodemailerClient) {
		// @ts-ignore
		const info = (await nodemailerClient.sendMail({
			from: body.From,
			replyTo: body.ReplyTo,
			to: body.To,
			subject: body.TemplateModel.subject,

			//text: 'Hello world?',
			//html: '<b>Hello world?</b>',
			// @ts-ignore
			template: template,

			context: {
				...data.substitutions,
			},
		})) as Obj

		console.log(
			'Message sent: %s',
			info && info.messageId ? (info.messageId as string) : 'UNKNOWN'
		)
		return true
	} else {
		console.log('Skipped sending e-mail, no e-mail service!')
		return false
	}
}

if (!config.postmarkKey && config.nodemailerHost) {
	setupNodemailer()

	setInterval(
		() => {
			void (async function () {
				const sevenDaysAgo = moment().subtract(7, 'days').toDate()
				const emailTracks = await EmailTrack.find({
					timestamp: { $gt: sevenDaysAgo },
				})
					.select('read template')
					.lean()

				let count = 0
				let openedCount = 0
				const stats: {
					template: string
					count: number
					openedCount: number
				}[] = []
				emailTracks.forEach((e) => {
					count++
					if (e.read) openedCount++

					const temp = e.template || 'unknown'
					const found = stats.find((s) => s.template === temp)
					if (!found)
						stats.push({
							template: temp,
							count: 1,
							openedCount: e.read ? 1 : 0,
						})
					else {
						found.count++
						if (e.read) found.openedCount++
					}
				})
				const openedPercent = !count ? 0 : (openedCount / count) * 100

				if (!process.env.emailTrackingURL)
					console.log(
						'[E-mail Tracking] No emailTrackingURL is set, e-mail opens will not be tracked!'
					)
				console.log(
					'\n[Email Tracking] Last 7 days: ' +
						count +
						' sent (' +
						openedPercent.toFixed(1) +
						'% opened)\n'
				)

				//

				let appState = await AppState.findOne({}).select('lastEmailReport')
				if (!appState) {
					appState = new AppState({})
				}
				if (
					!appState.lastEmailReport ||
					new Date(appState.lastEmailReport).getTime() < sevenDaysAgo.getTime()
				) {
					await sendAdminEmail({
						subject: 'Weekly E-mail Report',
						substitutions: {
							text:
								'In the last week, we sent <b>' +
								count +
								' e-mails</b> and about <b>' +
								openedPercent.toFixed(1) +
								'%</b> of them were opened.<br/><br/>Template statistics:<br/>' +
								stats
									.map(
										(s) =>
											'<b>' +
											s.template +
											'</b>' +
											': ' +
											s.count +
											' sent, ' +
											s.openedCount +
											' read'
									)
									.join('<br/>'),
						},
					})
					appState.lastEmailReport = new Date()
					await appState.save()
				}
			})()
		},
		config.prod || config.staging ? 60000 * 60 : 30000
	)
}
