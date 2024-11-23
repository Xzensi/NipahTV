import { name as pkgName, displayName as pkgDisplayName, version as pkgVersion } from '../package.json'
import type { ConfigEnv, UserConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import devtools from 'solid-devtools/vite'
import monkey from 'vite-plugin-monkey'

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
		resolve: {
			conditions: ['browser', mode === 'production' ? 'production' : 'development']
		}
	}
}
