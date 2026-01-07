import * as fs from 'fs';
import * as path from 'path';

const coveragePath = path.resolve(process.cwd(), 'coverage/coverage-summary.json');

if (!fs.existsSync(coveragePath)) {
    console.error('Error: No coverage report found at', coveragePath);
    process.exit(1);
}

try {
    const content = fs.readFileSync(coveragePath, 'utf-8');
    const coverage = JSON.parse(content);
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
        fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
    }
} catch (error) {
    console.error('Error reading coverage report:', error);
    process.exit(1);
}
