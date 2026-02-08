
import { relations } from "drizzle-orm";
import { pgTable, text, uuid, timestamp, jsonb, uniqueIndex} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkId: text("clerk_id").notNull().unique(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export const communities = pgTable("communities", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    createdBy: uuid("created_by").notNull().references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export const communityMembers = pgTable("community_members", {
    id: uuid("id").defaultRandom().primaryKey(),
    communityId: uuid("community_id").notNull().references(() => communities.id),
    userId: uuid("user_id").notNull().references(() => users.id),
    joinedAt: timestamp("joined_at").defaultNow().notNull()
})

export const learningGoals = pgTable("learning_goals", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    communityId: uuid("community_id").notNull().references(() => communities.id),
    userId: uuid("user_id").notNull().references(() => users.id),
    tags: jsonb("tags").$type<string[]>().default([]).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export const matches = pgTable("matches", 
    {
        id: uuid("id").defaultRandom().primaryKey(),
        communityId: uuid("community_id").notNull().references(() => communities.id),
        userAId: uuid("user_a_id").notNull().references(() => users.id),
        userBId: uuid("user_b_id").notNull().references(() => users.id),
        status: text("status").default("pending").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    }
)

export const conversations = pgTable('conversations', {
    id: uuid('id').defaultRandom().primaryKey(),
    matchId: uuid('match_id').notNull().references(() => matches.id),
    lastMessageAt: timestamp('last_message_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const messages = pgTable("messages", {
    id: uuid("id").defaultRandom().primaryKey(),
    content: text("content").notNull(),
    senderId: uuid("sender_id").notNull().references(() => users.id),
    conversationId: uuid("conversation_id").notNull().references(() => conversations.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const conversationSummaries = pgTable("conversation_summaries", {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
        .references(() => conversations.id)
        .notNull(),
    summary: text("summary").notNull(),
    actionItems: jsonb("action_items").$type<string[]>().default([]).notNull(),
    keyPoints: jsonb("key_points").$type<string[]>().default([]).notNull(),
    nextSteps: jsonb("next_steps").$type<string[]>().default([]).notNull(),
    generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    learningGoals: many(learningGoals),
    communityMemberships: many(communityMembers),
    sentMessages: many(messages),
}));

export const communitiesRelations = relations(communities, ({ one, many }) => ({
    createdBy: one(users, {
        fields: [communities.createdBy],
        references: [users.id],
    }),
    members: many(communityMembers),
    learningGoals: many(learningGoals),
    matches: many(matches),
}));

export const learningGoalsRelations = relations(learningGoals, ({ one }) => ({
    user: one(users, {
        fields: [learningGoals.userId],
        references: [users.id],
    }),
    community: one(communities, {
        fields: [learningGoals.communityId],
        references: [communities.id],
    }),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
    user1: one(users, {
        fields: [matches.userAId],
        references: [users.id],
    }),
    user2: one(users, {
        fields: [matches.userBId],
        references: [users.id],
    }),
    community: one(communities, {
        fields: [matches.communityId],
        references: [communities.id],
    }),
    conversation: many(conversations),
}));

export const conversationsRelations = relations(
    conversations,
    ({ one, many }) => ({
        match: one(matches, {
        fields: [conversations.matchId],
        references: [matches.id],
        }),
        messages: many(messages),
        summaries: many(conversationSummaries),
    })
);

export const messagesRelations = relations(messages, ({ one }) => ({
    conversation: one(conversations, {
        fields: [messages.conversationId],
        references: [conversations.id],
    }),
    sender: one(users, {
        fields: [messages.senderId],
        references: [users.id],
    }),
}));

export const conversationSummariesRelations = relations(
    conversationSummaries,
    ({ one }) => ({
        conversation: one(conversations, {
        fields: [conversationSummaries.conversationId],
        references: [conversations.id],
        }),
    })
);