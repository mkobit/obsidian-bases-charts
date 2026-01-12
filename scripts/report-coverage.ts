import * as fs from 'fs';
import * as path from 'path';

const coveragePath = path.resolve(
	process.cwd(),
	'coverage/coverage-summary.json',
);

if (!fs.existsSync(coveragePath)) {
	console.error(
		'Error: No coverage report found at',
		coveragePath,
	);
	process.exit(1);
}

interface CoverageMetric {
	pct: number;
}

interface CoverageTotal {
	statements: CoverageMetric;
	branches: CoverageMetric;
	functions: CoverageMetric;
	lines: CoverageMetric;
}

interface CoverageReport {
	total: CoverageTotal;
}

function isCoverageMetric(data: unknown): data is CoverageMetric {
	return (
		typeof data === 'object' &&
		data !== null &&
		'pct' in data &&
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		typeof (data as CoverageMetric).pct === 'number'
	);
}

function isCoverageTotal(data: unknown): data is CoverageTotal {
	if (typeof data !== 'object' || data === null) {
		return false;
	}
	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	const total = data as Record<string, unknown>;
	return (
		isCoverageMetric(total['statements']) &&
		isCoverageMetric(total['branches']) &&
		isCoverageMetric(total['functions']) &&
		isCoverageMetric(total['lines'])
	);
}

function isCoverageReport(data: unknown): data is CoverageReport {
	if (typeof data !== 'object' || data === null) {
		return false;
	}
	// Basic check for existence, we can trust the coverage report format if it's there
	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	return 'total' in data && isCoverageTotal((data as CoverageReport).total);
}

try {
	const content = fs.readFileSync(
		coveragePath,
		'utf-8',
	);
	const coverage: unknown = JSON.parse(content);

	if (!isCoverageReport(coverage)) {
		console.error('Invalid coverage report format');
		process.exit(1);
	}

	const total = coverage.total;

	const summary = `
## Coverage Summary
| File | Stmts | Branch | Funcs | Lines |
|---|---|---|---|---|
| Total | ${total.statements.pct}% | ${total.branches.pct}% | ${total.functions.pct}% | ${total.lines.pct}% |
`;

	// Always print to console for visibility in logs
	console.log(summary);

	// Append to GITHUB_STEP_SUMMARY if available
	if (process.env.GITHUB_STEP_SUMMARY) {
		fs.appendFileSync(
			process.env.GITHUB_STEP_SUMMARY,
			summary,
		);
	}
} catch (error) {
	console.error(
		'Error reading coverage report:',
		error,
	);
	process.exit(1);
}
