// PostToolUse hook: format files Claude edits with the project's Prettier config.
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

let input = '';
for await (const chunk of process.stdin) input += chunk;

const filePath = JSON.parse(input).tool_input?.file_path;
if (!filePath || !/\.(ts|html|css|scss|json)$/.test(filePath)) process.exit(0);

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const prettierBin = join(projectDir, 'node_modules', 'prettier', 'bin', 'prettier.cjs');

try {
  // Run Prettier through node directly (no shell) so paths with spaces stay intact.
  execFileSync(process.execPath, [prettierBin, '--write', '--log-level', 'warn', filePath], {
    cwd: projectDir,
    stdio: ['ignore', 'ignore', 'pipe'],
  });
} catch (err) {
  // Report but never block the edit.
  process.stderr.write(`prettier failed on ${filePath}: ${err.stderr ?? err.message}\n`);
}
