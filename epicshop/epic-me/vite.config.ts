import { cloudflare } from '@cloudflare/vite-plugin'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import devtoolsJson from 'vite-plugin-devtools-json'
import tsconfigPaths from 'vite-tsconfig-paths'

const port = 7787

export default defineConfig({
	server: { port },
	optimizeDeps: {
		include: ['@epic-web/invariant', '@mcp-ui/client'],
	},
	plugins: [
		{
			name: 'log-server-start',
			configureServer(server) {
				server.httpServer?.on('listening', () => {
					console.log(`EpicMeApp running at http://localhost:${port}`)
				})
			},
		},
		{
			name: 'strip-typegen-imports',
			enforce: 'pre',
			resolveId(id) {
				if (id.includes('+types/')) return id
			},
			load(id) {
				if (id.includes('+types/')) return 'export {}'
			},
		},
		cloudflare({ viteEnvironment: { name: 'ssr' }, inspectorPort: false }),
		tailwindcss(),
		reactRouter(),
		tsconfigPaths(),
		devtoolsJson(),
	],
})
