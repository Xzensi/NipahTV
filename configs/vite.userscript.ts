import { name as pkgName, displayName as pkgDisplayName, version as pkgVersion } from '../package.json'
import type { ConfigEnv, UserConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import solidPlugin from 'vite-plugin-solid'
import devtools from 'solid-devtools/vite'
import monkey from 'vite-plugin-monkey'
import { Features } from 'lightningcss'

export default async ({ command, mode, isPreview }: ConfigEnv): Promise<UserConfig> => {
	const isDev = mode !== 'production'
	const branch = 'master'

	return {
		appType: 'custom',
		envDir: 'configs',
		define: {
			__USERSCRIPT__: true,
			__EXTENSION__: false,
			__CHROMIUM_MV3__: false,
			__FIREFOX_MV3__: false
		},
		plugins: [
			devtools(),
			tsconfigPaths(),
			solidPlugin(),
			monkey({
				entry: 'src/index.tsx',
				userscript: {
					version: pkgVersion,
					name: isDev ? pkgDisplayName + ' Dev' : pkgDisplayName,
					downloadURL: `https://raw.githubusercontent.com/Xzensi/NipahTV/${branch}/dist/userscript/client.user.js`,
					updateURL: `https://raw.githubusercontent.com/Xzensi/NipahTV/${branch}/dist/userscript/client.user.js`,
					homepageURL: 'https://github.com/Xzensi/NipahTV',
					supportURL: 'https://github.com/Xzensi/NipahTV/issues',
					icon: 'https://nipahtv.com/img/NTV_icon_128.png',
					namespace: `com.${pkgName}.userscript`,
					match: ['https://www.google.com/'],
					$extra: [['tag', ['emotes', 'chatting']]]
				},
				server: {
					open: false
				}
			})
		],
		server: {
			port: 3000
		},
		build: {
			target: 'esnext',
			minify: 'esbuild',
			sourcemap: isDev,
			outDir: isDev ? 'dist/userscript-dev' : 'dist/userscript'
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
			conditions: ['browser', mode === 'production' ? 'production' : 'development']
		}
	}
}
