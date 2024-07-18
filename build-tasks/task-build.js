const esbuild = require('esbuild')
const fs = require('fs')
const prependFile = require('prepend-file')

const { log, error, group } = console

const args = {}
process.argv.slice(2).forEach(arg => {
	const [key, value] = arg.split('=')
	args[key] = value || true
})
log('Build arguments:', args)

const outfile = `dist/userscript/${args.is_local ? 'debug' : 'client'}.user.js`

esbuild
	.build({
		entryPoints: ['src/app.ts'],
		outfile: outfile,
		bundle: true,
		minify: false,
		sourcemap: false,
		format: 'esm',
		tsconfig: 'tsconfig.json',
		define: {
			__LOCAL__: args.is_local ? 'true' : 'false',
			__USERSCRIPT__: 'true',
			__EXTENSION__: 'false',
			__CHROMIUM_M2__: 'false',
			__CHROMIUM_M3__: 'false',
			__FIREFOX_MV2__: 'false'
		}
	})
	.then(() => {
		// Read the header file and prepend it to the outfile
		let header = fs.readFileSync(`build-tasks/${args.is_local ? 'debug_' : ''}compile_header`, 'utf8')

		// Update the version and branch in the header for production builds
		if (!args.is_local) {
			const appContent = fs.readFileSync('src/app.ts', 'utf8')
			const version = appContent.match(/VERSION\s=\s['"]([0-9.]+)['"]/m)[1]
			const branch = appContent.match(/RELEASE_BRANCH:\s['"](\S+)['"]/m)[1]
			log('Version:', version)
			log('Branch:', branch)

			header = header.replace('{{VERSION}}', version).replaceAll('{{BRANCH}}', branch)

			// TODO build this to /dist/extensions instead of in-place
			// const manifestContent = fs.readFileSync('manifest.json', 'utf8')
			// const updatedManifest = manifestContent.replace(/("version":\s?")[0-9.]+/m, `$1${version}`)

			// fs.writeFile('manifest.json', updatedManifest, 'utf8', err => {
			// 	if (err) {
			// 		console.error(`Error writing manifest file: ${err}`)
			// 		return
			// 	}
			// 	console.log('Manifest file updated successfully.')
			// })
		}

		prependFile.sync(outfile, header)

		log('\n⚡ Bundle build complete ⚡')
	})
	.catch(err => {
		error('Build failed:', err)
		process.exit(1)
	})
