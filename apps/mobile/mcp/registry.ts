/**
 * Client-side MCP registry mirror.
 * In production this hydrates from GET /v1/mcp/servers on the Relay API.
 * Each entry is a discoverable capability the Orchestrator can route to.
 */

export type McpHealth = 'healthy' | 'degraded' | 'down' | 'disconnected';

export interface McpServerUi {
  id: string;
  name: string;
  description: string;
  category: 'email' | 'calendar' | 'chat' | 'files' | 'crm' | 'knowledge' | 'automation';
  health: McpHealth;
  iconColor: string;
}

export const MCP_SERVERS: McpServerUi[] = [
  {
    id: 'gmail-mock',
    name: 'Gmail',
    description: 'Draft, send, prioritize inbox',
    category: 'email',
    health: 'healthy',
    iconColor: '#EA4335',
  },
  {
    id: 'calendar-mock',
    name: 'Google Calendar',
    description: 'Find times and schedule meetings',
    category: 'calendar',
    health: 'healthy',
    iconColor: '#4285F4',
  },
  {
    id: 'slack-mock',
    name: 'Slack',
    description: 'Search and summarize channels',
    category: 'chat',
    health: 'healthy',
    iconColor: '#E01E5A',
  },
  {
    id: 'drive-mock',
    name: 'Google Drive',
    description: 'Semantic file search & summaries',
    category: 'files',
    health: 'healthy',
    iconColor: '#34A853',
  },
  {
    id: 'notion-mock',
    name: 'Notion',
    description: 'Knowledge retrieval with citations',
    category: 'knowledge',
    health: 'healthy',
    iconColor: '#FFFFFF',
  },
  {
    id: 'crm-mock',
    name: 'HubSpot',
    description: 'Contacts, deals, relationship context',
    category: 'crm',
    health: 'disconnected',
    iconColor: '#FF7A59',
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Enterprise CRM sync',
    category: 'crm',
    health: 'disconnected',
    iconColor: '#00A1E0',
  },
  {
    id: 'automation',
    name: 'n8n',
    description: 'Workflows and webhooks',
    category: 'automation',
    health: 'disconnected',
    iconColor: '#EA4B71',
  },
];

export function connectedMcpServers(): McpServerUi[] {
  return MCP_SERVERS.filter((s) => s.health === 'healthy' || s.health === 'degraded');
}
