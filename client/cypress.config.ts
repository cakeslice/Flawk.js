import { defineConfig } from 'cypress'

export default defineConfig({
	e2e: {
		specPattern: 'src/__tests__/**/*.cy.{js,ts,jsx,tsx}',
	},
	component: {
		devServer: {
			framework: 'react',
			bundler: 'vite',
		},
		specPattern: '**/*.cy.ct.{js,ts,jsx,tsx}',
	},
})
