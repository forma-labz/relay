import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { haptics } from '@/lib/haptics';
import type { SecureRelayRegion, SecureRelayStatus } from '@/lib/types';

const REGION_META: Record<
  SecureRelayRegion,
  { label: string; latencyBase: number; gateway: string }
> = {
  us: { label: 'US East', latencyBase: 18, gateway: 'gw-us-east-1' },
  eu: { label: 'EU West', latencyBase: 42, gateway: 'gw-eu-west-1' },
  apac: { label: 'APAC', latencyBase: 68, gateway: 'gw-apac-1' },
};

interface SecureRelayState {
  status: SecureRelayStatus;
  region: SecureRelayRegion;
  splitTunneling: boolean;
  latencyMs: number;
  bandwidthMbps: number;
  connectedDevices: number;
  connecting: boolean;
  setRegion: (region: SecureRelayRegion) => void;
  setSplitTunneling: (value: boolean) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
}

function jitter(base: number) {
  return base + Math.floor(Math.random() * 8);
}

export const useSecureRelayStore = create<SecureRelayState>()(
  persist(
    (set, get) => ({
      status: 'disconnected',
      region: 'us',
      splitTunneling: true,
      latencyMs: 0,
      bandwidthMbps: 0,
      connectedDevices: 0,
      connecting: false,
      setRegion: (region) => {
        const meta = REGION_META[region];
        const { status } = get();
        set({
          region,
          latencyMs: status === 'protected' ? jitter(meta.latencyBase) : 0,
        });
      },
      setSplitTunneling: (splitTunneling) => set({ splitTunneling }),
      connect: async () => {
        if (get().connecting) return;
        set({ connecting: true, status: 'limited', latencyMs: 0, bandwidthMbps: 0 });
        haptics.medium();
        await new Promise((r) => setTimeout(r, 900));
        const meta = REGION_META[get().region];
        set({
          connecting: false,
          status: 'protected',
          latencyMs: jitter(meta.latencyBase),
          bandwidthMbps: 120 + Math.floor(Math.random() * 80),
          connectedDevices: 1 + Math.floor(Math.random() * 3),
        });
        haptics.success();
      },
      disconnect: () => {
        haptics.light();
        set({
          connecting: false,
          status: 'disconnected',
          latencyMs: 0,
          bandwidthMbps: 0,
          connectedDevices: 0,
        });
      },
    }),
    {
      name: 'relay-secure-relay',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        status: s.status,
        region: s.region,
        splitTunneling: s.splitTunneling,
        latencyMs: s.latencyMs,
        bandwidthMbps: s.bandwidthMbps,
        connectedDevices: s.connectedDevices,
      }),
    },
  ),
);

export function secureRelayRegionLabel(region: SecureRelayRegion): string {
  return REGION_META[region].label;
}

export function secureRelayGateway(region: SecureRelayRegion): string {
  return REGION_META[region].gateway;
}
