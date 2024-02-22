const { exec } = require('child_process')
const semver = require('semver')
const fs = require('fs')

const headerFilePath = 'compile_header.md'

fs.readFile(headerFilePath, 'utf8', (err, headerContent) => {
	if (err) {
		console.error(`Error reading header file: ${err}`)
		return
	}

	fs.readFile('src/app.js', 'utf8', (err, appContent) => {
		if (err) {
			console.error(`Error reading header file: ${err}`)
			return
		}

		const version = appContent.match(/VERSION:\s['"]([0-9.]+)['"]/m)[1]
		console.log(version)

		// const newVersion = semver.inc(version, 'patch')
		// console.log(newVersion)

		// Replace the placeholder with the actual filename
		const updatedHeader = headerContent.replace(/(@version\s)[0-9.]+$/m, `$1${version}`)

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
