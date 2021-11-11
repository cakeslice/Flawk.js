/*
 * Copyright (c) 2020 José Guerreiro. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import config from 'core/config_'
import { Obj } from 'flawk-types'
import nodemailer from 'nodemailer'
import hbs from 'nodemailer-express-handlebars'
import { htmlToText } from 'nodemailer-html-to-text'
import postmark from 'postmark'

//

const postmarkClient = config.postmarkKey
	? new postmark.ServerClient(config.postmarkKey)
	: undefined
let nodemailerClient: nodemailer.Transporter<unknown> | undefined = undefined
function setupNodemailer() {
	nodemailerClient = nodemailer.createTransport({
		host: config.nodemailerHost,
		port: config.nodemailerPort || 465,
		secure: config.nodemailerPort != 465 ? false : true, // eslint-disable-line
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
if (!config.postmarkKey && config.nodemailerHost) setupNodemailer()

type EmailData = { subject: string; substitutions: Obj }
type EmailBulkData = { subject: string; substitutions: Obj } & { email: string }
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
export async function sendAdminEmail(data: EmailData, template: string, developer = false) {
	let adminEmails = ''
	for (let i = 0; i < config.adminEmails.length; i++) {
		if (i === config.adminEmails.length - 1) adminEmails += config.adminEmails[i]
		else adminEmails += config.adminEmails[i].email + ', '
	}
	const body: EmailBody = {
		TemplateAlias: template,
		TemplateModel: {
			...data.substitutions,
			subject: !config.prod ? '[TEST-ADMIN] ' + data.subject : data.subject,
		},
		From: config.emailFrom,
		ReplyTo: config.replyTo,
		To: !config.prod || (developer && config.prod) ? config.developerEmail : adminEmails,
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
