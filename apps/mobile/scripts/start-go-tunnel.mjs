#!/usr/bin/env node
/**
 * Start Expo Go behind a Cloudflare quick tunnel (no account required).
 *
 * Useful on remote/cloud VMs where LAN QR codes cannot reach the phone.
 *
 * Usage (from repo root):
 *   npm run start:go:tunnel
 *
 * Optional:
 *   PORT=8081 npm run start:go:tunnel
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const port = Number(process.env.PORT || 8081);
const mobileRoot = fileURLToPath(new URL('..', import.meta.url));
const children = [];

function fail(message) {
  console.error(`\n[start-go-tunnel] ${message}\n`);
  process.exit(1);
}

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

function resolveCloudflared() {
  const fromEnv = process.env.CLOUDFLARED_BIN;
  if (fromEnv) return fromEnv;
  // Prefer PATH; common install locations as fallback.
  return 'cloudflared';
}

async function waitForTunnelUrl(proc, timeoutMs = 45000) {
  const started = Date.now();
  let buffer = '';

  return new Promise((resolve, reject) => {
    const onData = (buf) => {
      const text = buf.toString();
      buffer += text;
      process.stderr.write(text);
      const match = buffer.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
      if (match) {
        cleanup();
        resolve(match[0]);
      }
    };
    const onExit = (code) => {
      cleanup();
      reject(new Error(`cloudflared exited early (code ${code})`));
    };
    const timer = setInterval(() => {
      if (Date.now() - started >= timeoutMs) {
        cleanup();
        reject(new Error('Timed out waiting for Cloudflare tunnel URL'));
      }
    }, 500);

    function cleanup() {
      clearInterval(timer);
      proc.stdout?.off('data', onData);
      proc.stderr?.off('data', onData);
      proc.off('exit', onExit);
    }

    proc.stdout?.on('data', onData);
    proc.stderr?.on('data', onData);
    proc.on('exit', onExit);
  });
}

const cloudflared = resolveCloudflared();
console.log(`[start-go-tunnel] Starting Cloudflare tunnel → http://127.0.0.1:${port}`);

const tunnel = spawn(
  cloudflared,
  ['tunnel', '--url', `http://127.0.0.1:${port}`, '--no-autoupdate'],
  {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  },
);
children.push(tunnel);

tunnel.on('error', (err) => {
  fail(
    `Could not start cloudflared (${err.message}).\n` +
      'Install: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/',
  );
});

let publicUrl;
try {
  publicUrl = await waitForTunnelUrl(tunnel);
} catch (err) {
  fail(err.message);
}

const host = publicUrl.replace(/^https?:\/\//, '');
console.log(`[start-go-tunnel] Tunnel ready: ${publicUrl}`);
console.log(`[start-go-tunnel] Starting Expo Go (demo mode via .env.local)...`);

// Brief pause so the edge route is fully up before Metro advertises the URL.
await sleep(800);

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
