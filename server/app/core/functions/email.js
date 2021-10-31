const postmark = require('postmark')
const nodemailer = require('nodemailer')
//
const config = require('../config_')

//

const postmarkClient = config.postmarkKey
	? new postmark.ServerClient(config.postmarkKey)
	: undefined
let nodemailerClient = undefined
async function setupNodemailer() {
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
	var hbs = require('nodemailer-express-handlebars')
	var dir = './app/project/email_templates/'
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
	var htmlToText = require('nodemailer-html-to-text').htmlToText
	nodemailerClient.use('compile', htmlToText())
}
if (!config.postmarkKey && config.nodemailerHost) setupNodemailer()

module.exports = {
	/**
	 * @typedef emailOptions
	 * @property {boolean=} marketing
	 */
	/**
	 * @param {string} email
	 * @param {{subject: string, substitutions:object}} data
	 * @param {string} template
	 * @param {emailOptions=} options
	 */
	sendEmail: async function (email, data, template, { marketing = false } = {}) {
		var body = {
			TemplateAlias: template,
			TemplateModel: {
				...data.substitutions,
				subject: !config.prod ? '[TEST] ' + data.subject : data.subject,
			},
			From: config.emailFrom,
			ReplyTo: config.replyTo,
			To: email,
			MessageStream: marketing && 'marketing',
		}
		if (process.env.noEmails === 'true') {
			console.log('Skipped e-mail: ' + JSON.stringify(body))
			return false
		}
		if (!template) {
			console.log('No template provided! Skipped e-mail: ' + JSON.stringify(body))
			return false
		}
		console.log('Sending e-mail: ' + JSON.stringify(body))
		if (postmarkClient) {
			var response = await postmarkClient.sendEmailWithTemplate(body)
			if (response.ErrorCode === 0) {
				console.log('E-mail sent! (202)')
				return true
			} else {
				console.log(template + ': ' + JSON.stringify(response))
				return false
			}
		} else if (nodemailerClient) {
			let info = await nodemailerClient.sendMail({
				from: body.From,
				replyTo: body.ReplyTo,
				to: body.To,
				subject: body.TemplateModel.subject,

				//text: 'Hello world?',
				//html: '<b>Hello world?</b>',
				template: template,
				context: {
					...data.substitutions,
				},
			})

			console.log('Message sent: %s', info.messageId)
			return true
		} else {
			console.log('Skipped sending e-mail, no e-mail service!')
			return false
		}
	},
	/**
	 * @param {{subject: string, email:string,substitutions:object}[]} array
	 * @param {string} template
	 */
	sendBulkEmails: async function (array, template) {
		var bodies = []
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
			return
		}
		if (!template) {
			console.log('No template provided! Skipped batch e-mails')
			return
		}
		console.log('------------ Sending batch e-mails ------------')
		if (postmarkClient) {
			var response = await postmarkClient.sendEmailBatchWithTemplates(bodies)

			response.forEach((r) => {
				if (r.ErrorCode !== 0) console.log(JSON.stringify(r))
			})
		} else console.log('Skipped sending e-mails, no e-mail service!')
	},
	/**
	 * @param {{subject: string, substitutions:object}} data
	 * @param template
	 * @param {boolean} developer
	 */
	sendAdminEmail: async function (data, template, developer = false) {
		var adminEmails = ''
		for (var i = 0; i < config.adminEmails.length; i++) {
			if (i === config.adminEmails.length - 1) adminEmails += config.adminEmails[i]
			else adminEmails += config.adminEmails[i] + ', '
		}
		var body = {
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
			return
		}
		if (!template) {
			console.log('No template provided! Skipped e-mail: ' + JSON.stringify(body))
			return
		}
		console.log('Sending e-mail: ' + JSON.stringify(body))
		if (postmarkClient) {
			var response = await postmarkClient.sendEmailWithTemplate(body)
			if (response.ErrorCode === 0) console.log('E-mail sent! (202)')
			else console.log(JSON.stringify(response))
		} else if (nodemailerClient) {
			let info = await nodemailerClient.sendMail({
				from: body.From,
				replyTo: body.ReplyTo,
				to: body.To,
				subject: body.TemplateModel.subject,

				//text: 'Hello world?',
				//html: '<b>Hello world?</b>',
				template: template,
				context: {
					...data.substitutions,
				},
			})

			console.log('Message sent: %s', info.messageId)
		} else console.log('Skipped sending e-mail, no e-mail service!')
	},
}
