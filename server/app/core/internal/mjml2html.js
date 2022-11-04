const fs = require('fs')
const mjml2html = require('mjml')

const compileEmailTemplates = (path) => {
	const root = './'
	fs.rmSync(root + '/compiled', { recursive: true, force: true })

	fs.readdirSync(root + path).forEach((file) => {
		if (!file.includes('.mjml')) return

		const fileData = fs.readFileSync(root + path + '/' + file).toString()
		const html = mjml2html(fileData, { beautify: true }).html

		const outPath = root + '/compiled' + path
		fs.mkdir(outPath, { recursive: true }, (err) => {
			if (err) throw err

			const fileSplit = file.split('.')
			const fileName = fileSplit[fileSplit.length - 2]

			// eslint-disable-next-line
			fs.writeFile(outPath + '/' + fileName + '.hbs', html, (err) => {
				if (err) console.error(err)
			})
		})
	})
}
compileEmailTemplates('')
