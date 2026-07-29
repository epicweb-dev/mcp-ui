import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDirectory = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	'..',
)
const eslintPath = path.join(
	rootDirectory,
	'node_modules',
	'eslint',
	'bin',
	'eslint.js',
)

function getChildDirectories(directory) {
	if (!existsSync(directory)) return []

	return readdirSync(directory, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => path.join(directory, entry.name))
}

const exerciseDirectories = getChildDirectories(
	path.join(rootDirectory, 'exercises'),
).flatMap(getChildDirectories)
const exampleDirectories = getChildDirectories(
	path.join(rootDirectory, 'examples'),
)

const lintTargets = [
	[
		'.',
		'--ignore-pattern',
		'exercises/**',
		'--ignore-pattern',
		'epicshop/**',
		'--ignore-pattern',
		'examples/**',
	],
	[
		'epicshop',
		'--ignore-pattern',
		'epicshop/epic-me/**',
		'--ignore-pattern',
		'epicshop/mcp-dev/**',
	],
	['epicshop/epic-me'],
	['epicshop/mcp-dev'],
	...exerciseDirectories.map((directory) => [
		path.relative(rootDirectory, directory),
	]),
	...exampleDirectories.map((directory) => [
		path.relative(rootDirectory, directory),
	]),
]

for (const target of lintTargets) {
	console.log(`\nLinting ${target[0]}...`)
	const result = spawnSync(
		process.execPath,
		['--max-old-space-size=3072', eslintPath, ...target],
		{
			cwd: rootDirectory,
			stdio: 'inherit',
		},
	)

	if (result.error) throw result.error
	if (result.status !== 0) process.exit(result.status ?? 1)
}
