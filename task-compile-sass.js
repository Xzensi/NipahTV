const { exec } = require('child_process')
const crypto = require('crypto')
const fs = require('fs')

// Input and output file paths
const headerFilePath = 'compile_header.md'
const inputFilePath = 'src/scss/kick.scss'
const outputFilePath = 'dist/css/kick.min.css'

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

		// Replace the placeholder with the actual filename
		const updatedHeader = data.replace(/(dist\/css\/kick-\S{0,8}\.min\.css)$/m, `dist/css/kick-${hash}.min.css`)

		// Write the updated header back to the file
		fs.writeFile(headerFilePath, updatedHeader, 'utf8', err => {
			if (err) {
				console.error(`Error writing header file: ${err}`)
				return
			}
			console.log('Header file updated successfully.')
		})
	})
})
