import { McpExecutor } from './executor.js';
import { createCalendarMock } from './mocks/calendar.js';
import { createContactsMock } from './mocks/contacts.js';
import { createDriveMock } from './mocks/drive.js';
import { createGmailMock } from './mocks/gmail.js';
import { createNotionMock } from './mocks/notion.js';
import { createSlackMock } from './mocks/slack.js';
import { McpRegistry } from './registry.js';

export function createDefaultRegistry(): { registry: McpRegistry; executor: McpExecutor } {
  const registry = new McpRegistry();
  const mocks = [
    createGmailMock(),
    createSlackMock(),
    createCalendarMock(),
    createDriveMock(),
    createNotionMock(),
    createContactsMock(),
  ];
  for (const mock of mocks) {
    registry.register(mock.descriptor, mock.handlers);
  }
  return { registry, executor: new McpExecutor(registry) };
}
