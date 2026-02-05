import ObsidianLauncher from 'obsidian-launcher';
import path from 'path';
import fs from 'fs';

export interface TestEnvironment {
    executablePath: string;
    vaultPath: string;
    configDir: string;
    appVersion: string;
    installerVersion: string;
}

export async function prepareEnvironment(): Promise<TestEnvironment> {
    const launcher = new ObsidianLauncher({
        cacheDir: path.resolve('.obsidian-cache')
    });

    const manifestPath = path.resolve('manifest.json');
    if (!fs.existsSync(manifestPath)) {
        throw new Error('manifest.json not found');
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const minAppVersion = manifest.minAppVersion;

    console.log(`Resolving Obsidian version for minAppVersion: ${minAppVersion}`);
    const [appVersion, installerVersion] = await launcher.resolveVersion(minAppVersion, 'earliest');
    console.log(`Resolved: App ${appVersion}, Installer ${installerVersion}`);

    const executablePath = await launcher.downloadInstaller(installerVersion);
    console.log(`Executable: ${executablePath}`);

    const appPath = await launcher.downloadApp(appVersion);
    console.log(`App Source: ${appPath}`);

    // Create a unique vault path for this run
    const vaultPath = await launcher.setupVault({
        vault: path.resolve('example'),
        copy: true,
        plugins: [
            path.resolve('.')
        ]
    });
    console.log(`Test Vault: ${vaultPath}`);

    const configDir = await launcher.setupConfigDir({
        appVersion,
        installerVersion,
        appPath,
        vault: vaultPath
    });
    console.log(`Config Dir: ${configDir}`);

    return {
        executablePath,
        vaultPath,
        configDir,
        appVersion,
        installerVersion
    };
}

if (import.meta.main) {
    prepareEnvironment().catch(console.error);
}
