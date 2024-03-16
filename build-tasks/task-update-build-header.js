const { exec } = require('child_process')
const semver = require('semver')
const fs = require('fs')

const headerFilePath = 'build-tasks/compile_header'

fs.readFile(headerFilePath, 'utf8', (err, headerContent) => {
	if (err) {
		console.error(`Error reading header file: ${err}`)
		return
	}

	fs.readFile('src/app.ts', 'utf8', (err, appContent) => {
		if (err) {
			console.error(`Error reading header file: ${err}`)
			return
		}

		const version = appContent.match(/VERSION:\s['"]([0-9.]+)['"]/m)[1]
		const branch = appContent.match(/RELEASE_BRANCH:\s['"](\S+)['"]/m)[1]

		// const newVersion = semver.inc(version, 'patch')
		// console.log(newVersion)

		let updatedHeader = headerContent
			.replace(/(@version\s)[0-9.]+$/m, `$1${version}`)
			.replace(/(Xzensi\/NipahTV\/)\S+(\/dist.+)$/gm, `$1${branch}$2`)

		fs.writeFile(headerFilePath, updatedHeader, 'utf8', err => {
			if (err) {
				console.error(`Error writing header file: ${err}`)
				return
			}
			console.log('Header file updated successfully.')
		})
	})
})
