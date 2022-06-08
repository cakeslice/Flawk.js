import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { imagetools } from 'vite-imagetools'
import macrosPlugin from 'vite-plugin-babel-macros'
import checker from 'vite-plugin-checker'
import tsconfigPaths from 'vite-tsconfig-paths'

export default ({ mode }) => {
	const m = mode as string
	return defineConfig({
		assetsInclude: ['**/*.md'],
		build: {
			outDir: 'build',
		},
		plugins: [
			react({
				fastRefresh: process.env.NODE_ENV !== 'test',
			}),
			tsconfigPaths(),
			macrosPlugin(),
			imagetools(),
			checker({
				typescript: {
					buildMode: false,
				},
			}),
		],
		define: {
			'process.env.NODE_ENV': `"${m}"`,
		},
	})
}
