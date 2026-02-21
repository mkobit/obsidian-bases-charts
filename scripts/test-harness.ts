import path from 'path'
import { fileURLToPath } from 'url'
import { copyFileSync, mkdtempSync, readFileSync, rmSync } from 'fs'
import { spawn } from 'child_process'
import os from 'os'
import ObsidianLauncher from 'obsidian-launcher'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Read minAppVersion from manifest.json
const manifestPath = path.resolve(__dirname, '../manifest.json')
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const manifest: { id?: string, minAppVersion?: string } = JSON.parse(readFileSync(manifestPath, 'utf-8'))
const minAppVersion = manifest.minAppVersion || '0.12.8'
const pluginId = manifest.id || 'obsidian-bases-charts'

// Create launcher instance
const cacheDir = path.resolve(__dirname, '../.obsidian-cache')
const launcher = new ObsidianLauncher({ cacheDir })

// eslint-disable-next-line functional/functional-parameters
async function setup() {
  console.log(`Resolving Obsidian version (minAppVersion: ${minAppVersion})...`)

  // Resolve versions: 'earliest' means minAppVersion and oldest compatible installer
  const [appVersion, installerVersion] = await launcher.resolveVersion(minAppVersion, 'earliest')
  console.log(`Resolved versions: App=${appVersion}, Installer=${installerVersion}`)

  console.log(`Downloading installer for version ${installerVersion}...`)
  const installerPath = await launcher.downloadInstaller(installerVersion)
  console.log(`Installer downloaded to: ${installerPath}`)

  // Set up the test vault
  const exampleVaultPath = path.resolve(__dirname, '../example')
  console.log(`Setting up test vault at: ${exampleVaultPath}`)

  // Prepare plugin artifacts in a temp directory to avoid copying node_modules
  const tmpPluginPath = mkdtempSync(path.join(os.tmpdir(), 'obsidian-plugin-'))
  console.log(`Copying plugin artifacts to temporary directory: ${tmpPluginPath}`)

  const filesToCopy = ['main.js', 'manifest.json', 'styles.css']
  filesToCopy.forEach((file) => {
    const src = path.resolve(__dirname, '..', file)
    const dest = path.join(tmpPluginPath, file)
    try {
      copyFileSync(src, dest)
    }
    catch (e) {
      console.warn(`Could not copy ${file}: ${String(e)}`)
    }
  })

  // Use setupVault to ensure plugins are installed
  const vaultPath = await launcher.setupVault({
    vault: exampleVaultPath,
    copy: true, // Copy to a temp dir to avoid modifying source
    plugins: [tmpPluginPath],
  })
  console.log(`Test vault set up at: ${vaultPath}`)

  // Set up config directory (user-data-dir)
  // This is crucial for avoiding the "Trust this vault" modal and keeping the environment clean
  const configDir = await launcher.setupConfigDir({
    appVersion,
    installerVersion,
    vault: vaultPath,
  })
  console.log(`Config directory set up at: ${configDir}`)

  // Prepare environment variables
  const env = {
    ...process.env,
    OBSIDIAN_EXECUTABLE_PATH: installerPath,
    TEST_VAULT_PATH: vaultPath,
    OBSIDIAN_CONFIG_DIR: configDir,
    OBSIDIAN_VERSION: appVersion,
    PLUGIN_ID: pluginId,
  }

  console.log('--- STARTING PLAYWRIGHT ---')

  // Run playwright
  // Pass remaining arguments to playwright
  const rawArgs = process.argv.slice(2)
  const args = rawArgs.length === 0 ? ['test'] : rawArgs

  const child = spawn('bun', ['run', 'playwright', ...args], {
    stdio: 'inherit',
    env,
  })

  child.on('exit', (code) => {
    // Cleanup tmp plugin dir
    try {
      rmSync(tmpPluginPath, { recursive: true, force: true })
    }
    catch (e) {
      console.warn(`Failed to clean up temp plugin dir: ${String(e)}`)
    }
    process.exit(code ?? 0)
  })
}

setup().catch((err) => {
  console.error(err)
  process.exit(1)
})
