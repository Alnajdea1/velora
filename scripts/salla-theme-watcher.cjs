const path = require('node:path');
const { spawn } = require('node:child_process');
const ThemeWatcher = require('@salla.sa/twilight/watcher.js');

class SallaThemeWatcher extends ThemeWatcher {
  constructor(params = {}) {
    super(params);
    this.syncTimers = new Map();
    this.syncProcesses = new Map();
  }

  addToQ(file) {
    const absoluteFile = path.isAbsolute(file) ? file : path.resolve(file);
    const relativeFile = path.relative(process.cwd(), absoluteFile);

    if (!relativeFile || relativeFile.startsWith('..') || path.isAbsolute(relativeFile)) {
      console.error(`[Velora sync] Refusing file outside the theme root: ${file}`);
      return;
    }

    const existingTimer = this.syncTimers.get(relativeFile);
    if (existingTimer) clearTimeout(existingTimer);

    this.syncTimers.set(relativeFile, setTimeout(() => {
      this.syncTimers.delete(relativeFile);
      this.syncFile(relativeFile);
    }, 700));
  }

  syncFile(relativeFile) {
    if (!this.theme_id || !this.store_id || !this.draft_id || !this.upload_url) {
      console.error('[Velora sync] Missing Salla preview context; restart `salla theme preview`.');
      return;
    }

    const cliEntry = path.resolve('node_modules', '@salla.sa', 'cli', 'dist', 'salla.js');
    const args = [
      cliEntry,
      'theme',
      'sync',
      '-f',
      relativeFile,
      '-i',
      String(this.theme_id),
      '--store_id',
      String(this.store_id),
      '--draft_id',
      String(this.draft_id),
      '--upload_url',
      String(this.upload_url),
    ];

    const running = this.syncProcesses.get(relativeFile);
    if (running) running.kill();

    console.log(`[Velora sync] Uploading ${relativeFile.split(path.sep).join('/')}...`);
    const child = spawn(process.execPath, args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
      windowsHide: true,
    });

    this.syncProcesses.set(relativeFile, child);
    child.on('error', error => {
      this.syncProcesses.delete(relativeFile);
      console.error(`[Velora sync] Could not start the local Salla CLI: ${error.message}`);
    });
    child.on('close', code => {
      this.syncProcesses.delete(relativeFile);
      if (code !== 0) {
        console.error(`[Velora sync] Upload failed for ${relativeFile}; watcher remains active.`);
      }
    });
  }
}

module.exports = SallaThemeWatcher;
