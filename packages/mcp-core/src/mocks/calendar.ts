import { createMockServer } from '../mock-factory.js';

export function createCalendarMock() {
  return createMockServer(
    'calendar-mock',
    'Google Calendar MCP — find times and schedule meetings',
    [
      {
        name: 'events.find_free_times',
        description: 'Find mutual free meeting slots',
        handler: (args) => ({
          attendees: args.attendees ?? [],
          slots: [
            { start: '2026-07-23T14:00:00Z', end: '2026-07-23T14:30:00Z', tz: 'UTC' },
            { start: '2026-07-24T16:00:00Z', end: '2026-07-24T16:30:00Z', tz: 'UTC' },
          ],
        }),
      },
      {
        name: 'events.create',
        description: 'Create a calendar invite',
        mutating: true,
        requiresApproval: true,
        handler: (args) => ({
          eventId: `evt_${Date.now()}`,
          title: args.title ?? 'Meeting',
          start: args.start,
          end: args.end,
          attendees: args.attendees ?? [],
        }),
      },
      {
        name: 'events.cancel',
        description: 'Cancel an event',
        mutating: true,
        requiresApproval: true,
        handler: (args) => ({ cancelled: true, eventId: args.eventId }),
      },
    ],
    { authentication: { type: 'oauth2', scopes: ['calendar.events'] } },
  );
}
