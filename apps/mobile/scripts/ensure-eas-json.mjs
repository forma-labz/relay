import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const mobileRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const easJson = join(mobileRoot, 'eas.json');

if (!existsSync(easJson)) {
  console.error(
    `\n[eas] Missing ${easJson}\n` +
      'Run EAS commands from apps/mobile (or via npm run eas:* from the repo root).\n' +
      'Do not run `eas build:configure` at the monorepo root — that creates a broken /eas.json.\n',
  );
  process.exit(1);
}

// Prevent accidental use of a stub eas.json at repo root.
const rootStub = join(mobileRoot, '..', '..', 'eas.json');
if (existsSync(rootStub)) {
  console.error(
    `\n[eas] Found a root eas.json at ${rootStub}.\n` +
      'Remove it and use apps/mobile/eas.json only (monorepo).\n',
  );
  process.exit(1);
}

console.log(`[eas] Using ${easJson}`);
