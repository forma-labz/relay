import { createMockServer } from '../mock-factory.js';

const FILES = [
  {
    id: 'f_proposal',
    name: 'BrightPath_Proposal_v3.pdf',
    kind: 'pdf',
    path: '/Clients/BrightPath/BrightPath_Proposal_v3.pdf',
    modified: '2026-07-18T10:00:00Z',
  },
  {
    id: 'f_msa',
    name: 'Atlas_MSA_Redlines.docx',
    kind: 'doc',
    path: '/Legal/Atlas_MSA_Redlines.docx',
    modified: '2026-07-17T15:30:00Z',
  },
];

export function createDriveMock() {
  return createMockServer(
    'drive-mock',
    'Google Drive / Relay Vault MCP — search and summarize documents',
    [
      {
        name: 'files.search',
        description: 'Semantic search across files',
        handler: (args) => {
          const q = String(args.query ?? '').toLowerCase();
          const results = FILES.filter(
            (f) =>
              f.name.toLowerCase().includes(q) ||
              f.path.toLowerCase().includes(q) ||
              q.includes('proposal'),
          );
          return { results: results.length ? results : FILES.slice(0, 1) };
        },
      },
      {
        name: 'files.summarize',
        description: 'Summarize a document',
        handler: (args) => ({
          fileId: args.fileId ?? 'f_proposal',
          summary:
            'Proposal covers API tier pricing, 30-day onboarding, and SOC2-aligned data residency options.',
        }),
      },
      {
        name: 'files.extract',
        description: 'Extract tables/invoices from a document',
        handler: (args) => ({
          fileId: args.fileId,
          tables: [{ name: 'Pricing', rows: 3 }],
        }),
      },
    ],
    { authentication: { type: 'oauth2', scopes: ['drive.readonly'] } },
  );
}
