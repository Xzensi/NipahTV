const esbuild = require('esbuild')
const fs = require('fs')
const sass = require('sass')
const { exec } = require('child_process')
const { hashElement } = require('folder-hash')

const { log, error, group } = console

const args = {}
process.argv.slice(2).forEach(arg => {
	const [key, value] = arg.split('=')
	args[key] = value || true
})
log('Build arguments:', args)

if (!args.target) {
	error('No platform target specified. Exiting...')
	process.exit(1)
}

const TARGET = args.target
const TARGET_CHROME = TARGET === 'chrome'
const TARGET_FIREFOX = TARGET === 'firefox'

if (!['chrome', 'firefox'].includes(TARGET)) {
	error('Invalid platform target specified. Exiting...')
	process.exit(1)
}

let manifestFile
switch (TARGET) {
	case 'chrome':
		manifestFile = 'manifest-chrome-v3.json'
		break
	case 'firefox':
		manifestFile = 'manifest-firefox-v2.json'
		break
}

const outdir = `dist/${TARGET}/`
const outfile = outdir + 'index.js'

function updateDirectory(source, destination) {
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(destination)) {
			fs.cpSync(source, destination, { recursive: true }, err => {
				if (err) {
					throw new Error(`Error copying ${source}: ${err}`)
				}
			})
			resolve(true)
			return
		}

		// Compare hashes of source and destination directories
		let sourceHash, destinationHash
		Promise.allSettled([hashElement(source), hashElement(destination)])
			.then(([res1, res2]) => {
				sourceHash = res1.value.hash
				destinationHash = res2.value.hash
			})
			.then(() => {
				if (sourceHash === destinationHash) {
					resolve(false)
				} else {
					fs.rmSync(destination, { recursive: true })

					fs.cpSync(source, destination, { recursive: true }, err => {
						if (err) {
							throw new Error(`Error copying ${source}: ${err}`)
						}
					})
					resolve(true)
				}
			})
	})
}

esbuild
	.build({
		entryPoints: ['src/app.ts'],
		// entryPoints: ['src/**/*.ts'],
		outfile: outfile,
		// outdir: outdir,
		outbase: 'src',
		allowOverwrite: true,
		bundle: true,
		minify: false,
		sourcemap: true,
		format: 'esm',
		tsconfig: 'tsconfig.json',
		define: {
			__LOCAL__: args.is_local ? 'true' : 'false',
			__USERSCRIPT__: 'false',
			__EXTENSION__: 'true',
			__CHROMIUM_M2__: 'false',
			__CHROMIUM_M3__: TARGET_CHROME ? 'true' : 'false',
			__FIREFOX_MV2__: TARGET_FIREFOX ? 'true' : 'false'
		}
	})
	.then(async () => {
		const appContent = fs.readFileSync('src/app.ts', 'utf8')
		const version = appContent.match(/VERSION:\s['"]([0-9.]+)['"]/m)[1]
		const branch = appContent.match(/RELEASE_BRANCH:\s['"](\S+)['"]/m)[1]
		log('Version:', version)
		log('Branch:', branch)

		const manifestContent = fs.readFileSync(manifestFile, 'utf8').replace('{{VERSION}}', version)

		fs.writeFileSync(outdir + 'manifest.json', manifestContent, 'utf8', err => {
			if (err) {
				throw new Error(`Error writing manifest file: ${err}`)
			}
			log('Patched manifest file.')
		})

		// Copy image assets if they don't exist or if they are out of date
		const updateAssetsPromise = updateDirectory('assets/img', outdir + 'assets/img').then(updated => {
			if (updated) {
				log('Updated image assets.')
			} else {
				log('Image assets already up to date.')
			}
		})

		const updateVendorPromise = updateDirectory('vendor', outdir + 'vendor').then(updated => {
			if (updated) {
				log('Updated vendor scripts.')
			} else {
				log('Vendor scripts already up to date.')
			}
		})

		const compileSassPromise = new Promise((resolve, reject) => {
			const result = sass.compile('assets/scss/kick.scss', {
				outputStyle: 'compressed'
				// sourceMap: true
			})
			fs.writeFileSync(outdir + 'style.min.css', result.css)
			log('Compiled Sass.')
			resolve()
		})

		await Promise.allSettled([updateAssetsPromise, updateVendorPromise, compileSassPromise])

		log('\n⚡ Bundle build complete ⚡')
	})
	.catch(err => {
		error('Build failed:', err)
		process.exit(1)
	})

esbuild
	.build({
		entryPoints: ['src/Background/serviceWorker.ts'],
		outfile: outdir + 'service-worker.js',
		bundle: true,
		allowOverwrite: true,
		minify: false,
		sourcemap: false,
		format: 'esm',
		tsconfig: 'tsconfig.json',
		define: {}
	})
	.then(async () => {
		log('\n⚡ Service worker build complete ⚡')
	})
	.catch(err => {
		error('Service worker build failed:', err)
		process.exit(1)
	})

esbuild
	.build({
		entryPoints: ['src/ContentScripts/page.ts'],
		outfile: outdir + 'page.js',
		bundle: true,
		allowOverwrite: true,
		minify: false,
		sourcemap: false,
		format: 'esm',
		tsconfig: 'tsconfig.json',
		define: {}
	})
	.then(async () => {
		log('\n⚡ Page build complete ⚡')
	})
	.catch(err => {
		error('Page build failed:', err)
		process.exit(1)
	})
