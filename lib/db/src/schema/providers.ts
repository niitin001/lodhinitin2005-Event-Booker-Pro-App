import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
export const providers = pgTable("providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  location: text("location").notNull(),
  price: integer("price").notNull().default(0),
  rating: integer("rating").notNull().default(5),
  phone: text("phone"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
