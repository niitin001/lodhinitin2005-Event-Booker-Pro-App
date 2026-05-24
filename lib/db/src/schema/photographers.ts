import { pgTable, text, serial, timestamp, boolean, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const photographersTable = pgTable("photographers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  city: text("city").notNull().default(""),
  specializations: text("specializations").array().notNull().default([]),
  rating: real("rating").notNull().default(0),
  totalReviews: integer("total_reviews").notNull().default(0),
  totalBookings: integer("total_bookings").notNull().default(0),
  startingPrice: real("starting_price").notNull().default(0),
  coverImageUrl: text("cover_image_url"),
  avatarUrl: text("avatar_url"),
  isAvailable: boolean("is_available").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  isVerified: boolean("is_verified").notNull().default(false),
  isApproved: boolean("is_approved").notNull().default(false),
  yearsOfExperience: integer("years_of_experience"),
  equipment: text("equipment"),
  instagramHandle: text("instagram_handle"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPhotographerSchema = createInsertSchema(photographersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPhotographer = z.infer<typeof insertPhotographerSchema>;
export type Photographer = typeof photographersTable.$inferSelect;
