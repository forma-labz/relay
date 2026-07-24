/**
 * Relay design tokens — Apple × Linear × Superhuman navy / electric blue.
 * Prefer these over ad-hoc hex values in screens.
 */
export const colors = {
  background: '#070B17',
  backgroundElevated: '#101728',
  surface: '#101728',
  surface2: '#151D33',
  card: '#151D33',
  foreground: '#FFFFFF',
  muted: '#A4B0C4',
  border: 'rgba(255,255,255,0.06)',
  brand: '#2D6BFF',
  brandSecondary: '#6B4EFF',
  brandPurple: '#8B5CF6',
  brandPink: '#A78BFA',
  sky: '#38BDF8',
  success: '#16C784',
  warning: '#F5A524',
  error: '#F04438',
  glass: 'rgba(21, 29, 51, 0.72)',
  glassBorder: 'rgba(255,255,255,0.06)',
  glowBrand: 'rgba(45, 107, 255, 0.45)',
  glowPurple: 'rgba(139, 92, 246, 0.4)',
} as const;

export const gradients = {
  brand: ['#2D6BFF', '#8B5CF6'] as [string, string],
  brandSoft: ['#2D6BFF', '#6B4EFF'] as [string, string],
  hero: ['#070B17', '#101728', '#070B17'] as [string, string, string],
  bubble: ['#2D6BFF', '#8B5CF6'] as [string, string],
  ellipsis: ['#38BDF8', '#8B5CF6'] as [string, string],
} as const;

export const radii = {
  input: 16,
  md: 16,
  button: 18,
  lg: 20,
  xl: 24,
  sheet: 28,
  full: 999,
} as const;
