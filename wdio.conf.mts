import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config: WebdriverIO.Config = {
    //
    // ====================
    // Runner Configuration
    // ====================
    //
    runner: 'local',
    //
    // ==================
    // Specify Test Files
    // ==================
    //
    specs: [
        './e2e/**/*.e2e.ts'
    ],
    //
    // ============
    // Capabilities
    // ============
    //
    maxInstances: 1,
    capabilities: [{
        browserName: 'obsidian',
        // 'earliest' uses minAppVersion from manifest.json (1.11.4)
        // This ensures we verify the "specified dependency version" works.
        browserVersion: 'earliest',
        'wdio:obsidianOptions': {
            // 'earliest' uses the oldest installer compatible with the browserVersion
            // This ensures maximum compatibility coverage.
            installerVersion: 'earliest',
            vault: path.join(__dirname, 'example'),
            plugins: ['.'], // Install the current plugin
        }
    }],
    //
    // ===================
    // Test Configurations
    // ===================
    //
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://localhost',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: ['obsidian'],
    framework: 'mocha',
    reporters: ['obsidian'],
    // wdio-obsidian-service will download Obsidian versions into this directory
    cacheDir: path.resolve(__dirname, ".obsidian-cache"),
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    }
}
