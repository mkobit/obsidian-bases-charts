import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		coverage: {
			provider: 'v8',
			reporter: ['text',
				'json-summary',
				'json',
				'html'],
			reportOnFailure: true,
			include: ['src/**/*.ts'],
			exclude: ['src/main.ts',
				'src/**/*.d.ts',
				'tests/**',
				'src/settings.ts',
				'src/views/base-chart-view.ts'], // exclude files with parse errors in coverage-v8
		},
	},
});
