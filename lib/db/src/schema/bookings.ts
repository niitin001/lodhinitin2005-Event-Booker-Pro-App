import { pgTable, text, serial, timestamp, integer, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { photographersTable } from "./photographers";
import { packagesTable } from "./packages";

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending", "confirmed", "rejected", "completed", "cancelled", "in_progress"
]);

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => usersTable.id),
  photographerId: integer("photographer_id").notNull().references(() => photographersTable.id),
  packageId: integer("package_id").references(() => packagesTable.id),
  eventType: text("event_type").notNull(),
  eventDate: text("event_date").notNull(),
  eventEndDate: text("event_end_date"),
  city: text("city").notNull(),
  venue: text("venue"),
  totalAmount: real("total_amount").notNull().default(0),
  advanceAmount: real("advance_amount").notNull().default(0),
  remainingAmount: real("remaining_amount").notNull().default(0),
  status: bookingStatusEnum("status").notNull().default("pending"),
  notes: text("notes"),
  referenceImages: text("reference_images").array().notNull().default([]),
  selectedAddons: text("selected_addons").array().notNull().default([]),
  rejectionReason: text("rejection_reason"),
  cancellationReason: text("cancellation_reason"),
  couponCode: text("coupon_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
