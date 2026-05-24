import { pgTable, text, serial, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { bookingsTable } from "./bookings";

export const deliverableMediaTypeEnum = pgEnum("deliverable_media_type", ["photo", "video"]);

export const deliverablesTable = pgTable("deliverables", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookingsTable.id, { onDelete: "cascade" }),
  mediaUrl: text("media_url").notNull(),
  mediaType: deliverableMediaTypeEnum("media_type").notNull().default("photo"),
  caption: text("caption"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDeliverableSchema = createInsertSchema(deliverablesTable).omit({ id: true, uploadedAt: true });
export type InsertDeliverable = z.infer<typeof insertDeliverableSchema>;
export type Deliverable = typeof deliverablesTable.$inferSelect;
