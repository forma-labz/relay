import { formatDuration, relativeTime } from '@/lib/utils';

describe('formatDuration', () => {
  it('formats seconds as minutes and padded seconds', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(3_599)).toBe('59:59');
  });
});

describe('relativeTime', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-10T17:00:00.000Z'));
  });

  afterEach(() => jest.useRealTimers());

  it('formats recent timestamps compactly', () => {
    expect(relativeTime('2026-07-10T16:59:30.000Z')).toBe('now');
    expect(relativeTime('2026-07-10T16:48:00.000Z')).toBe('12m');
    expect(relativeTime('2026-07-10T14:00:00.000Z')).toBe('3h');
  });
});
