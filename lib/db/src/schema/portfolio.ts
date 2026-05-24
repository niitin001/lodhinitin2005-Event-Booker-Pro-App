import { pgTable, text, serial, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { photographersTable } from "./photographers";

export const portfolioMediaTypeEnum = pgEnum("portfolio_media_type", ["photo", "video", "reel"]);

export const portfolioItemsTable = pgTable("portfolio_items", {
  id: serial("id").primaryKey(),
  photographerId: integer("photographer_id").notNull().references(() => photographersTable.id, { onDelete: "cascade" }),
  mediaUrl: text("media_url").notNull(),
  mediaType: portfolioMediaTypeEnum("media_type").notNull().default("photo"),
  title: text("title"),
  eventType: text("event_type"),
  isApproved: boolean("is_approved").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPortfolioItemSchema = createInsertSchema(portfolioItemsTable).omit({ id: true, createdAt: true });
export type InsertPortfolioItem = z.infer<typeof insertPortfolioItemSchema>;
export type PortfolioItem = typeof portfolioItemsTable.$inferSelect;
