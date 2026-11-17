import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const root = process.cwd();
const requiredPackages = ['tsx', 'vite', 'express', 'jszip'];
const missing = requiredPackages.some(
  (pkg) => !fs.existsSync(path.join(root, 'node_modules', pkg))
);

if (missing) {
  console.log('[ScholarSpark AI] First-time setup: installing npm dependencies...');
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const install = spawnSync(npmCmd, ['install'], {
    cwd: root,
    stdio: 'inherit',
    shell: true,
  });
  if (install.status !== 0) {
    console.error('[ScholarSpark AI] npm install failed. Please run "npm.cmd install" manually.');
    process.exit(install.status ?? 1);
  }
}

const envPath = path.join(root, '.env');
if (!fs.existsSync(envPath) && !process.env.GEMINI_API_KEY) {
  const starterEnv = [
    '# Local VS Code Development Environment',
    'GEMINI_API_KEY=""',
    'PORT="3000"',
    'NODE_ENV="development"',
    '',
  ].join('\n');
  fs.writeFileSync(envPath, starterEnv, 'utf8');
  console.log(
    '[ScholarSpark AI] Created local .env file. Add your GEMINI_API_KEY in .env to enable live Gemini AI features.'
  );
}
