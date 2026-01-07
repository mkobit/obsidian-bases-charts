const fs = require('fs');
const path = require('path');

const coveragePath = path.resolve(process.cwd(), 'coverage/coverage-summary.json');

if (!fs.existsSync(coveragePath)) {
    console.log('No coverage report found.');
    // We don't exit with error to avoid failing the workflow step if coverage is just missing
    process.exit(0);
}

try {
    const coverage = require(coveragePath);
    const total = coverage.total;

    const summary = `
## Coverage Summary
| File | Stmts | Branch | Funcs | Lines |
|---|---|---|---|---|
| Total | ${total.statements.pct}% | ${total.branches.pct}% | ${total.functions.pct}% | ${total.lines.pct}% |
`;

    // Append to GITHUB_STEP_SUMMARY if available
    if (process.env.GITHUB_STEP_SUMMARY) {
        fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
    } else {
        console.log(summary);
    }
} catch (error) {
    console.error('Error reading coverage report:', error);
    process.exit(1);
}
