import { calendarAgent } from './calendar-agent.js';
import { communicationAgent } from './communication-agent.js';
import { documentAgent } from './document-agent.js';
import { emailAgent } from './email-agent.js';
import { knowledgeAgent } from './knowledge-agent.js';
import type { Agent } from './types.js';

export function createAgentRegistry(): Map<string, Agent> {
  const agents: Agent[] = [
    emailAgent,
    communicationAgent,
    calendarAgent,
    documentAgent,
    knowledgeAgent,
  ];
  return new Map(agents.map((a) => [a.id, a]));
}

export { calendarAgent, communicationAgent, documentAgent, emailAgent, knowledgeAgent };
