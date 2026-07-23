#!/usr/bin/env node
/**
 * Start Expo Go behind a Cloudflare quick tunnel (no Cloudflare account required).
 *
 * Useful on remote/cloud VMs where LAN QR codes cannot reach the phone.
 *
 * Usage (from repo root):
 *   npm run start:go:tunnel
 *
 * Tips for reliability:
 * - Set EXPO_TOKEN (or place it in ~/.expo-token) so Expo never blocks on
 *   the interactive "Log in / Proceed anonymously" prompt when Expo Go connects.
 * - This script pre-warms the iOS + Android Hermes bundles so the phone does
 *   not hit Expo Go's request timeout on the first cold Metro compile.
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
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

function loadExpoToken() {
  if (process.env.EXPO_TOKEN?.trim()) return process.env.EXPO_TOKEN.trim();
  const tokenPath = join(homedir(), '.expo-token');
  if (existsSync(tokenPath)) {
    const token = readFileSync(tokenPath, 'utf8').trim();
    if (token) return token;
  }
  return null;
}

function resolveCloudflared() {
  return process.env.CLOUDFLARED_BIN || 'cloudflared';
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

async function waitForMetro(timeoutMs = 90000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/status`);
      if (res.ok) return;
    } catch {
      // still booting
    }
    await sleep(500);
  }
  fail(`Metro did not become ready on port ${port}`);
}

async function warmPlatform(platform) {
  const manifestRes = await fetch(`http://127.0.0.1:${port}/`, {
    headers: {
      'expo-platform': platform,
      accept: 'application/expo+json,application/json',
    },
  });
  if (!manifestRes.ok) {
    throw new Error(`manifest ${platform} HTTP ${manifestRes.status}`);
  }
  const manifest = await manifestRes.json();
  const bundleUrl = manifest?.launchAsset?.url;
  if (!bundleUrl) throw new Error(`No launchAsset.url for ${platform}`);

  // Prefer localhost for the heavy compile; Metro cache then serves tunnel hits fast.
  const localBundleUrl = bundleUrl.replace(/^https?:\/\/[^/]+/i, `http://127.0.0.1:${port}`);
  const started = Date.now();
  const bundleRes = await fetch(localBundleUrl, {
    headers: { 'expo-platform': platform },
  });
  if (!bundleRes.ok) {
    throw new Error(`bundle ${platform} HTTP ${bundleRes.status}`);
  }
  // Drain body so Metro finishes writing the full transform.
  const bytes = (await bundleRes.arrayBuffer()).byteLength;
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `[start-go-tunnel] Warmed ${platform} bundle (${(bytes / 1e6).toFixed(1)} MB in ${secs}s)`,
  );
}

const expoToken = loadExpoToken();
if (!expoToken) {
  console.warn(
    '[start-go-tunnel] WARNING: No EXPO_TOKEN found. Expo may block on an interactive login prompt when Expo Go connects.\n' +
      '  Set EXPO_TOKEN or write it to ~/.expo-token',
  );
} else {
  console.log('[start-go-tunnel] Using EXPO_TOKEN for non-interactive Expo auth');
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

/** @type {string} */
let publicUrl;
try {
  publicUrl = await waitForTunnelUrl(tunnel);
} catch (err) {
  fail(err instanceof Error ? err.message : String(err));
}

const host = publicUrl.replace(/^https?:\/\//, '');
console.log(`[start-go-tunnel] Tunnel ready: ${publicUrl}`);
console.log(`[start-go-tunnel] Starting Expo Go (demo mode via .env.local)...`);

await sleep(800);

const expoEnv = {
  ...process.env,
  EXPO_PACKAGER_PROXY_URL: publicUrl,
  REACT_NATIVE_PACKAGER_HOSTNAME: host,
  EXPO_NO_TELEMETRY: '1',
};
if (expoToken) {
  expoEnv.EXPO_TOKEN = expoToken;
  // Keep Metro watch/reload enabled when authenticated.
  delete expoEnv.CI;
} else {
  // Without a token, CI mode avoids an interactive login prompt (no reload).
  expoEnv.CI = process.env.CI || '1';
}

const expo = spawn('npx', ['expo', 'start', '--go', '--port', String(port)], {
  cwd: mobileRoot,
  env: expoEnv,
  stdio: 'inherit',
});
children.push(expo);
expo.on('exit', (code) => shutdown(code ?? 0));

try {
  await waitForMetro();
  console.log('[start-go-tunnel] Metro is up — pre-warming Hermes bundles for Expo Go...');
  await warmPlatform('ios');
  await warmPlatform('android');
  // Verify tunnel serves a warm hit quickly.
  const probeStarted = Date.now();
  const probe = await fetch(publicUrl, {
    headers: {
      'expo-platform': 'ios',
      accept: 'application/expo+json,application/json',
    },
  });
  const probeMs = Date.now() - probeStarted;
  console.log(`[start-go-tunnel] Tunnel manifest OK (HTTP ${probe.status} in ${probeMs}ms)`);
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[start-go-tunnel] Pre-warm warning: ${message}`);
}

const loadingUrl = `${publicUrl}/_expo/loading`;
console.log('\n========================================');
console.log(' Expo Go is ready — open this on your phone:');
console.log(`   exp://${host}`);
console.log(`   ${loadingUrl}`);
console.log(' Demo mode: any sign-in works (EXPO_PUBLIC_DEMO_MODE=true)');
console.log('========================================\n');
