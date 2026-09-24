import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  providerId: integer("provider_id").notNull(),
  eventDate: timestamp("event_date").notNull(),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
