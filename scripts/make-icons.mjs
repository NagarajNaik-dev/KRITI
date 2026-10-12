import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDir = path.resolve(__dirname, '../frontend');
const scriptPath = path.resolve(frontendDir, 'scripts/make-icons.mjs');

const child = spawn(process.execPath, [scriptPath], {
  cwd: frontendDir,
  stdio: 'inherit'
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
