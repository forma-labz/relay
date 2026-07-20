import { jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const memoryScopeEnum = pgEnum('memory_scope', ['personal', 'company', 'conversation']);
export const approvalStatusEnum = pgEnum('approval_status', [
  'pending',
  'approved',
  'rejected',
  'executed',
]);

export const mcpServers = pgTable('mcp_servers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  version: text('version').notNull().default('1.0.0'),
  descriptor: jsonb('descriptor').notNull(),
  health: text('health').notNull().default('healthy'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const aiMemories = pgTable('ai_memories', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  scope: memoryScopeEnum('scope').notNull(),
  key: text('key').notNull(),
  content: jsonb('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const aiConversations = pgTable('ai_conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const aiMessages = pgTable('ai_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => aiConversations.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  content: text('content').notNull(),
  meta: jsonb('meta'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const aiApprovals = pgTable('ai_approvals', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  conversationId: uuid('conversation_id'),
  server: text('server').notNull(),
  tool: text('tool').notNull(),
  arguments: jsonb('arguments').notNull(),
  description: text('description').notNull(),
  status: approvalStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
