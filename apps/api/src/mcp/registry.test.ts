import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createDefaultRegistry } from '@relay/mcp-core';

describe('mcp registry', () => {
  it('invokes non-mutating tools without approval', async () => {
    const { executor } = createDefaultRegistry();
    const result = await executor.invoke({
      userId: 'demo-user',
      server: 'drive-mock',
      tool: 'files.search',
      arguments: { query: 'proposal' },
    });
    assert.equal(result.ok, true);
    const data = result.data as { results: { name: string }[] };
    assert.ok(data.results.some((f) => f.name.includes('Proposal')));
  });

  it('requires approval for mutating calendar create', async () => {
    const { executor } = createDefaultRegistry();
    const blocked = await executor.invoke({
      userId: 'demo-user',
      server: 'calendar-mock',
      tool: 'events.create',
      arguments: { title: 'Sync', start: '2026-07-23T14:00:00Z', end: '2026-07-23T14:30:00Z' },
    });
    assert.equal(blocked.needsApproval, true);
    assert.equal(blocked.ok, false);

    const allowed = await executor.invoke({
      userId: 'demo-user',
      server: 'calendar-mock',
      tool: 'events.create',
      arguments: { title: 'Sync', start: '2026-07-23T14:00:00Z', end: '2026-07-23T14:30:00Z' },
      approved: true,
    });
    assert.equal(allowed.ok, true);
  });
});
