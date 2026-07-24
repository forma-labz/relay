import { createMockServer } from '../mock-factory.js';

const DOCS = [
  {
    id: 'kb1',
    title: 'Client follow-up SOP',
    excerpt: 'Follow up within 3 business days after sending a proposal.',
  },
  {
    id: 'kb2',
    title: 'Email tone guide',
    excerpt: 'Warm, concise, no jargon. Sign as Jordan.',
  },
];

export function createNotionMock() {
  return createMockServer(
    'notion-mock',
    'Notion / Knowledge MCP — retrieval with citations',
    [
      {
        name: 'knowledge.search',
        description: 'Semantic search over company knowledge',
        handler: (args) => ({
          query: args.query,
          results: DOCS,
        }),
      },
      {
        name: 'knowledge.qa',
        description: 'Answer a question with citations',
        handler: (args) => ({
          answer:
            'Per the client follow-up SOP, send a reminder three business days after a proposal goes out.',
          citations: [{ id: 'kb1', title: 'Client follow-up SOP' }],
          question: args.question,
        }),
      },
    ],
    { authentication: { type: 'oauth2', scopes: ['notion.read'] } },
  );
}
