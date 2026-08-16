import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  json,
} from "drizzle-orm/pg-core";

// Portfolio items table definition for Drizzle
export const portfolioItems = pgTable("portfolio_items", {
  id: text("id").primaryKey(),
  public_id: text("public_id").notNull(),
  cloudinary_url: text("cloudinary_url").notNull(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  caption: text("caption"),
  sort_order: integer("sort_order").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  width: integer("width"),
  height: integer("height"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
// Packages table definitions for Drizzle
export const packages = pgTable("packages", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  name: text("name").notNull(),
  duration: text("duration"),
  price: integer("price").notNull().default(0),
  features: json("features").$type<string[]>().notNull().default([]),
  sample_url: text("sample_url"),
  sort_order: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
// Testimonials table definition for Drizzle
export const testimonials = pgTable("testimonials", {
  id: text("id").primaryKey(),
  client_name: text("client_name").notNull(),
  client_role: text("client_role").notNull(),
  content: text("content"),
  video_url: text("video_url"),
  video_public_id: text("video_public_id"),
  image_url: text("image_url"),
  active: boolean("active").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
// Bookings table definition for Drizzle
export const bookings = pgTable("bookings", {
  id: text("id").primaryKey(),
  client_name: text("client_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  session_type: text("session_type"),
  requested_at: timestamp("requested_at").notNull(),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  admin_note: text("admin_note"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
// Site settings table definition for Drizzle
export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey(),
  business_name: text("business_name").default("KCAPTURED"),
  email: text("email"),
  instagram_url: text("instagram_url"),
  tiktok_url: text("tiktok_url"),
  cash_app: text("cash_app"),
  zelle_email: text("zelle_email"),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
