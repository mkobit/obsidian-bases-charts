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
        './e2e/**/*.test.ts'
    ],
    //
    // ============
    // Capabilities
    // ============
    //
    maxInstances: 1,
    capabilities: [{
        // The service will handle the app launching
        browserName: 'chrome',
        'goog:chromeOptions': {
            // Electron specific options if needed, but the service likely handles binary paths
            args: ['--no-sandbox', '--disable-gpu']
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
    services: [
        ['obsidian', {
            vault: path.join(__dirname, 'example'),
        }]
    ],
    framework: 'mocha',
    reporters: ['obsidian'],
    // wdio-obsidian-service will download Obsidian versions into this directory
    cacheDir: path.resolve(__dirname, ".obsidian-cache"),
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
    autoCompileOpts: {
        autoCompile: true,
        tsNodeOpts: {
            transpileOnly: true,
            project: 'tsconfig.json'
        }
    }
}
