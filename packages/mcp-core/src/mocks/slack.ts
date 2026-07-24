import { createMockServer } from '../mock-factory.js';

export function createSlackMock() {
  return createMockServer(
    'slack-mock',
    'Slack MCP — search and summarize conversations',
    [
      {
        name: 'messages.search',
        description: 'Search recent Slack messages',
        handler: (args) => ({
          query: args.query,
          results: [
            {
              channel: '#atlas',
              text: 'SLA credit structure pending finance confirmation.',
              from: 'Sofia Bianchi',
            },
          ],
        }),
      },
      {
        name: 'messages.summarize',
        description: 'Summarize a Slack thread',
        handler: (args) => ({
          channel: args.channel ?? '#atlas',
          summary:
            'Team aligned on data residency; finance still needs to confirm SLA credits before Thursday.',
        }),
      },
      {
        name: 'messages.send',
        description: 'Send a Slack message',
        mutating: true,
        requiresApproval: true,
        handler: (args) => ({
          sent: true,
          channel: args.channel,
          text: args.text,
        }),
      },
    ],
    { authentication: { type: 'oauth2', scopes: ['chat:write', 'channels:history'] } },
  );
}
