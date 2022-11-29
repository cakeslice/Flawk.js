import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { imagetools } from 'vite-imagetools'
import macrosPlugin from 'vite-plugin-babel-macros'
import checker from 'vite-plugin-checker'
import tsconfigPaths from 'vite-tsconfig-paths'

const image = 'fit=inside&webp&quality=100&'
const iconImage = image + 'w=75&h=75'
const thumbImage = image + 'w=350&h=350'
const defaultImage = image + 'w=800&h=800'
const imageProcessor = {
	original: new URLSearchParams('fit=inside&webp&quality=100'),
	icon: new URLSearchParams(iconImage),
	thumb: new URLSearchParams(thumbImage),
	default: new URLSearchParams(defaultImage),
}

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
			imagetools({
				include: '**/*.{heic,heif,avif,jpeg,jpg,png,tiff,webp,gif}*',
				defaultDirectives: (id) => {
					if (id.search === '') {
						if (id.pathname.includes('img_original/')) {
							return imageProcessor.original
						}
						if (id.pathname.includes('img_thumb/')) {
							return imageProcessor.thumb
						}
						if (id.pathname.includes('img_icon/')) {
							return imageProcessor.icon
						}
						return imageProcessor.default
					}
					return id.searchParams
				},
			}),
			checker({
				typescript: {
					buildMode: false,
				},
			}),
		],
		define: {
			'process.env.NODE_ENV': `"${m}"`,
		},
		server: {
			port: 4020,
		},
	})
}
