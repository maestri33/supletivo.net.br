import { defineConfig, devices } from '@playwright/test';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Resolves local or container Chromium binaries when default cache differs across build environments.
 * {@link https://github.com/microsoft/playwright/issues/24838}
 */
function resolveChromium(): string | undefined {
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
    return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  }
  const home = process.env.HOME || '/root';
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || join(home, '.cache', 'ms-playwright');
  const candidates: string[] = [];
  if (existsSync(root)) {
    for (const name of readdirSync(root)) {
      if (/^chromium-\d+$/.test(name)) {
        const p = join(root, name, 'chrome-linux64', 'chrome');
        if (existsSync(p)) candidates.push(p);
      }
    }
  }
  if (candidates.length) return candidates.sort().reverse()[0];
  for (const sys of ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome']) {
    if (existsSync(sys)) return sys;
  }
  return undefined;
}

const PORT = Number(process.env.PORT) || 4321;
const BASE = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: BASE,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Pixel 7'],
        launchOptions: {
          ...(resolveChromium() ? { executablePath: resolveChromium() } : {}),
          args: ['--no-sandbox', '--disable-dev-shm-usage'],
        },
      },
    },
  ],
  webServer: {
    // `tools/preview-server.mjs` lê PORT da env, escolhe uma porta livre
    // começando em PORT (sobe 1 se já estiver ocupada) e escreve em
    // `.preview-port` para outros tools saberem onde está.
    // Requer `npm run build` antes (CI faz; local: npm run build && npm run test:e2e).
    command: 'node tools/preview-server.mjs',
    url: BASE,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 60_000,
  },
});
