const { exec } = require('child_process')
const crypto = require('crypto')
const fs = require('fs')

// Input and output file paths
const headerFilePath = 'build-tasks/compile_header'
const inputFilePath = 'assets/scss/kick.scss'
const outputFilePath = 'dist/userscript/kick-temp.min.css'

// Compile Sass
// exec(`sass --watch ${inputFilePath}:${outputFilePath} -s compressed --no-source-map`, (error, stdout, stderr) => {
exec(`sass -s compressed --no-source-map ${inputFilePath}:${outputFilePath}`, (error, stdout, stderr) => {
	if (error) {
		console.error(`Error: ${error.message}`)
		return
	}
	if (stderr) {
		console.error(`Sass Error: ${stderr}`)
		return
	}

	const hash = crypto.createHash('md5').update(fs.readFileSync(outputFilePath)).digest('hex').slice(0, 8)
	console.log(`Hash: ${hash}`)

	// Read the header file
	fs.readFile(headerFilePath, 'utf8', (err, data) => {
		if (err) {
			console.error(`Error reading header file: ${err}`)
			return
		}

		// @resource KICK_CSS https://raw.githubusercontent.com/Xzensi/NipahTV/master/dist/userscript/kick-1817026f.min.css
		const oldCSSFilename = data.match(/dist\/userscript\/(kick-\S{0,8}\.min\.css)$/m)[1]
		const updatedHeader = data.replace(
			/(dist\/userscript\/kick-\S{0,8}\.min\.css)$/m,
			`dist/userscript/kick-${hash}.min.css`
		)

		console.log(`Old CSS: ${oldCSSFilename}`)

		if (fs.existsSync(`dist/userscript/${oldCSSFilename}`)) fs.unlinkSync(`dist/userscript/${oldCSSFilename}`)

		// Write the updated header back to the file
		fs.writeFile(headerFilePath, updatedHeader, 'utf8', err => {
			if (err) {
				console.error(`Error writing header file: ${err}`)
				return
			}
			console.log('Header file updated successfully.')

			fs.renameSync(outputFilePath, `dist/userscript/kick-${hash}.min.css`)
		})
	})
})
