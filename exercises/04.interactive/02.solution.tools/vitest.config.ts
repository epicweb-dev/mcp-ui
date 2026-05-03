/// <reference types="vitest" />
/// <reference types="vitest/config" />

import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		globalSetup: './test/globalSetup.ts',
		testTimeout: 30_000,
	},
})
