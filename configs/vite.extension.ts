import { version as pkgVersion } from '../package.json'
import type { ConfigEnv, UserConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import solidPlugin from 'vite-plugin-solid'
import devtools from 'solid-devtools/vite'
import zipPack from 'vite-plugin-zip-pack'
import { crx } from '@crxjs/vite-plugin'
import { Features } from 'lightningcss'

export default async ({ command, mode, isPreview }: ConfigEnv): Promise<UserConfig> => {
	const buildTarget = process.env.BUILD_TARGET as 'chrome' | 'firefox'
	const isDev = mode !== 'production'

	const outDir = isDev ? `dist/${buildTarget}-dev` : 'dist/' + buildTarget

	const [sharedManifest, targetManifest] = await Promise.all([
		import(`./manifest.json`),
		import(`./manifest.${buildTarget}.v3.json`)
	])
	const manifest = { ...sharedManifest, ...targetManifest }
	manifest.version = pkgVersion
	manifest.name = isDev ? `${manifest.name} Dev` : manifest.name

	const plugins = [devtools(), solidPlugin(), crx({ manifest, browser: buildTarget }), tsconfigPaths()]
	if (!isDev) {
		plugins.push(
			zipPack({
				inDir: `dist/${buildTarget}`,
				outFileName: `${buildTarget}_v${pkgVersion}.zip`,
				outDir: 'dist'
			})
		)
	}

	return {
		plugins,
		appType: 'custom',
		envDir: 'configs',
		envPrefix: 'NTV_',

		define: {
			__USERSCRIPT__: false,
			__EXTENSION__: true,
			__CHROMIUM_MV3__: buildTarget === 'chrome',
			__FIREFOX_MV3__: buildTarget === 'firefox'
		},
		server: {
			port: 3000
		},
		build: {
			target: 'esnext',
			minify: 'esbuild',
			sourcemap: isDev,
			outDir: outDir,
			rollupOptions: {
				output: {
					entryFileNames: `[name].js`,
					chunkFileNames: `[name].js`,
					assetFileNames: `[name].[ext]`
				}
			}
		},
		css: {
			devSourcemap: isDev,
			preprocessorMaxWorkers: 2,
			// https://vite.dev/config/shared-options.html#css-transformer
			transformer: 'lightningcss',
			// https://vite.dev/guide/features#postcss
			lightningcss: {
				include: Features.Nesting
			}
		},
		resolve: {
			conditions: ['browser', isDev ? 'development' : 'production']
		}
	}
}
