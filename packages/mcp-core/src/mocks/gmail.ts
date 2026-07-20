import { createMockServer } from '../mock-factory.js';

const INBOX = [
  {
    id: 'm1',
    from: 'Amara Okafor',
    subject: 'Revised brand deck',
    urgency: 'medium',
    unread: true,
  },
  {
    id: 'm2',
    from: 'Sofia Bianchi',
    subject: 'MSA redlines',
    urgency: 'high',
    unread: true,
  },
  {
    id: 'm3',
    from: 'Marcus Lee',
    subject: 'BrightPath API tier',
    urgency: 'low',
    unread: false,
  },
];

export function createGmailMock() {
  return createMockServer(
    'gmail-mock',
    'Gmail MCP — draft, reply, prioritize, and label email',
    [
      {
        name: 'inbox.list',
        description: 'List recent inbox messages with urgency signals',
        handler: () => ({ messages: INBOX }),
      },
      {
        name: 'inbox.prioritize',
        description: 'Return prioritized inbox highlights',
        handler: () => ({
          highlights: INBOX.filter((m) => m.unread).sort((a, b) =>
            a.urgency === 'high' ? -1 : b.urgency === 'high' ? 1 : 0,
          ),
        }),
      },
      {
        name: 'email.draft',
        description: 'Draft an email to a contact',
        mutating: false,
        handler: (args) => {
          const to = String(args.to ?? 'recipient@example.com');
          const topic = String(args.topic ?? 'follow-up');
          const attachment = args.attachment ? String(args.attachment) : undefined;
          return {
            to,
            subject: `Re: ${topic}`,
            body: [
              `Hi ${to.split('@')[0]?.split('.')[0] ?? 'there'},`,
              '',
              `Sharing an update on ${topic}.${attachment ? ` I've attached ${attachment}.` : ''}`,
              '',
              'Best,',
              'Jordan',
            ].join('\n'),
            attachment,
          };
        },
      },
      {
        name: 'email.send',
        description: 'Send an email',
        mutating: true,
        requiresApproval: true,
        permissions: ['email:send'],
        handler: (args) => ({
          sent: true,
          to: args.to,
          subject: args.subject,
          messageId: `msg_${Date.now()}`,
        }),
      },
      {
        name: 'email.label',
        description: 'Apply AI labels to a message',
        mutating: true,
        handler: (args) => ({
          messageId: args.messageId,
          labels: args.labels ?? ['AI'],
        }),
      },
    ],
    {
      authentication: { type: 'oauth2', scopes: ['gmail.modify'] },
      permissions: ['email:read', 'email:send'],
    },
  );
}
