import { createRequestHandler } from 'react-router'
import { type Env, type EpicExecutionContext } from '#types/helpers'
import { DB } from './db/index.ts'

const requestHandler = createRequestHandler(
	() => import('virtual:react-router/server-build'),
	import.meta.env.MODE,
)

const defaultHandler = {
	async fetch(request: Request, env: Env, ctx: EpicExecutionContext) {
		// hard coded for this workshop which does not have auth...
		ctx.props.userId = '1'
		return requestHandler(request, {
			db: await DB.getInstance(env),
			cloudflare: { env, ctx },
		})
	},
}

export default defaultHandler
