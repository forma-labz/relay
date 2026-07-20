/**
 * Relay cyber-neon design tokens — match the MCP 2.0 product mockups.
 * Prefer these over ad-hoc hex values in screens.
 */
export const colors = {
  background: '#0A0A0A',
  backgroundElevated: '#111118',
  surface: '#16161F',
  surface2: '#1E1E2A',
  foreground: '#F8FAFC',
  muted: '#94A3B8',
  border: 'rgba(148, 163, 184, 0.16)',
  brand: '#6366F1',
  brandPurple: '#A855F7',
  brandPink: '#C084FC',
  sky: '#38BDF8',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  glass: 'rgba(22, 22, 31, 0.72)',
  glassBorder: 'rgba(148, 163, 184, 0.18)',
  glowIndigo: 'rgba(99, 102, 241, 0.55)',
  glowPurple: 'rgba(168, 85, 247, 0.45)',
} as const;

export const gradients = {
  brand: ['#6366F1', '#A855F7'] as [string, string],
  brandSoft: ['#4F46E5', '#7C3AED'] as [string, string],
  hero: ['#0A0A0A', '#12101F', '#0A0A0A'] as [string, string, string],
  bubble: ['#6366F1', '#8B5CF6'] as [string, string],
};

export const radii = {
  md: 16,
  lg: 20,
  xl: 24,
  full: 999,
} as const;
