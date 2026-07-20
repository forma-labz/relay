#!/usr/bin/env node
/**
 * Start Expo Go behind a personal ngrok tunnel.
 *
 * Requires NGROK_AUTHTOKEN from https://dashboard.ngrok.com/get-started/your-authtoken
 *
 * Usage (from repo root):
 *   NGROK_AUTHTOKEN=... npm run start:go:ngrok
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const port = Number(process.env.PORT || 8081);
const mobileRoot = fileURLToPath(new URL('..', import.meta.url));

function fail(message) {
  console.error(`\n[start-go-ngrok] ${message}\n`);
  process.exit(1);
}

if (!process.env.NGROK_AUTHTOKEN) {
  fail(
    'NGROK_AUTHTOKEN is required.\n' +
      '  1. Create a free token: https://dashboard.ngrok.com/get-started/your-authtoken\n' +
      '  2. Rerun: NGROK_AUTHTOKEN=your_token npm run start:go:ngrok\n\n' +
      "Expo's shared ngrok account often hits session limits (ERR_NGROK_108), so a personal token is needed.",
  );
}

let ngrokBin;
try {
  ngrokBin = require.resolve('@expo/ngrok-bin-linux-x64/ngrok');
} catch {
  try {
    // Workspace / nested @expo/ngrok install
    ngrokBin = require.resolve('@expo/ngrok/node_modules/@expo/ngrok-bin-linux-x64/ngrok');
  } catch {
    fail('Could not find the ngrok binary. Run: npm install -w @relay/mobile -D @expo/ngrok');
  }
}

const children = [];

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

async function waitForNgrokUrl(timeoutMs = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch('http://127.0.0.1:4040/api/tunnels');
      if (res.ok) {
        const data = await res.json();
        const https = (data.tunnels || []).find((t) => t.public_url?.startsWith('https://'));
        if (https?.public_url) return https.public_url;
      }
    } catch {
      // still booting
    }
    await sleep(400);
  }
  return null;
}

// Persist token for the @expo/ngrok v2 agent (also honors NGROK_AUTHTOKEN in newer agents).
const ngrokDir = join(homedir(), '.ngrok2');
mkdirSync(ngrokDir, { recursive: true });
writeFileSync(join(ngrokDir, 'ngrok.yml'), `authtoken: ${process.env.NGROK_AUTHTOKEN}\n`, {
  mode: 0o600,
});

console.log(`[start-go-ngrok] Starting ngrok on port ${port}...`);
const ngrok = spawn(ngrokBin, ['http', String(port), '--log=stdout'], {
  env: { ...process.env },
  stdio: ['ignore', 'pipe', 'pipe'],
});
children.push(ngrok);

ngrok.stdout.on('data', (buf) => process.stdout.write(buf));
ngrok.stderr.on('data', (buf) => process.stderr.write(buf));
ngrok.on('exit', (code) => {
  if (code && code !== 0) fail(`ngrok exited with code ${code}`);
});

const publicUrl = await waitForNgrokUrl();
if (!publicUrl) {
  fail(
    'Timed out waiting for ngrok public URL. Check NGROK_AUTHTOKEN and https://status.ngrok.com',
  );
}

const host = publicUrl.replace(/^https?:\/\//, '');
console.log(`[start-go-ngrok] Tunnel ready: ${publicUrl}`);
console.log(`[start-go-ngrok] Starting Expo Go...`);

const expo = spawn('npx', ['expo', 'start', '--go', '--port', String(port)], {
  cwd: mobileRoot,
  env: {
    ...process.env,
    EXPO_PACKAGER_PROXY_URL: publicUrl,
    REACT_NATIVE_PACKAGER_HOSTNAME: host,
  },
  stdio: 'inherit',
});
children.push(expo);

expo.on('exit', (code) => shutdown(code ?? 0));
