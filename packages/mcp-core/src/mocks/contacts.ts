import { createMockServer } from '../mock-factory.js';

const CONTACTS = [
  {
    id: 'c_john',
    name: 'John Carter',
    email: 'john.carter@brightpath.io',
    company: 'BrightPath',
    role: 'VP Engineering',
    tags: ['Client', 'Proposal'],
  },
  {
    id: 'c_marcus',
    name: 'Marcus Lee',
    email: 'marcus@brightpath.io',
    company: 'BrightPath',
    role: 'CTO',
    tags: ['Lead'],
  },
  {
    id: 'c_sofia',
    name: 'Sofia Bianchi',
    email: 'sofia@atlas.legal',
    company: 'Atlas',
    role: 'Partner',
    tags: ['Legal'],
  },
];

export function createContactsMock() {
  return createMockServer(
    'crm-mock',
    'Lightweight CRM MCP — find contacts and relationship context',
    [
      {
        name: 'contacts.find',
        description: 'Find a contact by name or email',
        handler: (args) => {
          const q = String(args.query ?? '').toLowerCase();
          const match =
            CONTACTS.find(
              (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
            ) ?? CONTACTS[0];
          return { contact: match };
        },
      },
      {
        name: 'contacts.list',
        description: 'List known contacts',
        handler: () => ({ contacts: CONTACTS }),
      },
    ],
  );
}
