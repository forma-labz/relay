/** Core domain types for Relay. */

export type ChannelType = 'chat' | 'email';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  avatarColor: string;
  initials: string;
  tags: string[];
  notes?: string;
  favorite: boolean;
  lastInteraction: string; // ISO
}

export type MessageKind = 'chat' | 'email' | 'voice' | 'event' | 'attachment';

export interface Attachment {
  id: string;
  name: string;
  size: string;
  kind: 'pdf' | 'image' | 'doc' | 'sheet' | 'zip';
}

export interface Message {
  id: string;
  conversationId: string;
  kind: MessageKind;
  fromMe: boolean;
  authorId: string;
  body: string;
  subject?: string; // for emails
  timestamp: string; // ISO
  status?: 'sent' | 'delivered' | 'read';
  encrypted?: boolean;
  durationSec?: number; // voice notes
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  contactId: string;
  channel: ChannelType;
  lastPreview: string;
  lastTimestamp: string; // ISO
  unread: number;
  pinned: boolean;
  encrypted: boolean;
  muted: boolean;
}

export type FileKind = 'pdf' | 'image' | 'doc' | 'sheet' | 'zip' | 'folder';

export interface StoredFile {
  id: string;
  name: string;
  kind: FileKind;
  size: string;
  owner: string;
  modified: string; // ISO
  shared: boolean;
  versions: number;
  parentId?: string;
}

export type AiActionType = 'summary' | 'draft' | 'rewrite' | 'tasks' | 'notes' | 'reply';

export interface AiSuggestion {
  id: string;
  type: AiActionType;
  title: string;
  detail: string;
}

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  body: string;
  timestamp: string;
  /** Light plan/tool trace from the Relay orchestrator, e.g. "Used Email + Calendar". */
  traceLabel?: string;
}

export type NotificationType = 'email' | 'message' | 'task' | 'calendar';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export interface ConnectedAccount {
  id: string;
  provider: 'gmail' | 'outlook' | 'imap';
  email: string;
  status: 'connected' | 'syncing' | 'error';
}

export type InboxFilter = 'all' | 'unread' | 'chat' | 'email' | 'pinned';
export type ThemePref = 'dark' | 'light' | 'system';
