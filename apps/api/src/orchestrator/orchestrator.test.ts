import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { MemoryStore } from '../memory/store.js';
import { ModelRouter } from '../models/router.js';
import { RelayOrchestrator } from './index.js';
import { buildPlan, classifyIntent } from './planner.js';

describe('planner', () => {
  it('classifies multi-step proposal + meeting requests', () => {
    const intent = classifyIntent('Send John the latest proposal and arrange a meeting.');
    assert.equal(intent, 'multi_step');
    const plan = buildPlan('Send John the latest proposal and arrange a meeting.');
    assert.equal(plan.intent, 'multi_step');
    assert.ok(plan.steps.some((s) => s.server === 'crm-mock'));
    assert.ok(plan.steps.some((s) => s.server === 'drive-mock'));
    assert.ok(plan.steps.some((s) => s.tool === 'email.send'));
    assert.ok(plan.steps.some((s) => s.tool === 'events.create'));
  });
});

describe('orchestrator', () => {
  it('lists mock MCP servers from the registry', () => {
    const orch = new RelayOrchestrator(new MemoryStore(), new ModelRouter());
    const servers = orch.listServers();
    const names = servers.map((s) => s.name).sort();
    assert.deepEqual(names, [
      'calendar-mock',
      'crm-mock',
      'drive-mock',
      'gmail-mock',
      'notion-mock',
      'slack-mock',
    ]);
    for (const server of servers) {
      assert.equal(server.health, 'healthy');
      assert.ok(server.tools.length > 0);
    }
  });

  it('gates email.send behind approval', async () => {
    const memory = new MemoryStore();
    memory.seedDemo();
    const orch = new RelayOrchestrator(memory, new ModelRouter());
    const res = await orch.chat({
      message: 'Send John the latest proposal and arrange a meeting.',
      userId: 'demo-user',
      history: [],
    });

    assert.equal(res.intent, 'multi_step');
    assert.ok(res.pendingApprovals.length >= 1);
    assert.equal(res.pendingApprovals[0]?.tool, 'email.send');
    assert.ok(res.toolResults.some((r) => r.tool === 'email.draft' && r.ok));
    assert.ok(res.toolResults.some((r) => r.tool === 'files.search' && r.ok));
    assert.ok(res.trace.some((t) => t.status === 'needs_approval'));
  });

  it('executes approved send', async () => {
    const memory = new MemoryStore();
    memory.seedDemo();
    const orch = new RelayOrchestrator(memory, new ModelRouter());
    const first = await orch.chat({
      message: 'Send John the latest proposal and arrange a meeting.',
      userId: 'demo-user',
      history: [],
    });
    const approvalId = first.pendingApprovals[0]?.id;
    assert.ok(approvalId);

    const second = await orch.chat({
      message: 'approve',
      userId: 'demo-user',
      conversationId: first.conversationId,
      history: [],
      approveActionId: approvalId,
    });

    assert.ok(second.toolResults.some((r) => r.tool === 'email.send' && r.ok));
    assert.equal(second.pendingApprovals.length, 0);
  });

  it('handles summarize quick action', async () => {
    const memory = new MemoryStore();
    memory.seedDemo();
    const orch = new RelayOrchestrator(memory, new ModelRouter());
    const res = await orch.action({
      type: 'summary',
      label: 'Summarize inbox',
      userId: 'demo-user',
    });
    assert.equal(res.intent, 'summarize');
    assert.ok(res.message.length > 0);
    assert.ok(res.toolResults.some((r) => r.tool === 'inbox.prioritize'));
  });
});
