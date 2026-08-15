import { pgTable, text, integer, boolean, timestamp, json } from 'drizzle-orm/pg-core'

// Portfolio items table definition for Drizzle
export const portfolioItems = pgTable('portfolio_items', {
	id: text('id').primaryKey(),
	public_id: text('public_id').notNull(),
	cloudinary_url: text('cloudinary_url').notNull(),
	category: text('category').notNull(),
	title: text('title').notNull(),
	caption: text('caption'),
	sort_order: integer('sort_order').notNull().default(0),
	featured: boolean('featured').notNull().default(false),
	active: boolean('active').notNull().default(true),
	width: integer('width'),
	height: integer('height'),
	created_at: timestamp('created_at').defaultNow().notNull(),
	updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const packages = pgTable('packages', {
	id: text('id').primaryKey(),
	category: text('category').notNull(),
	name: text('name').notNull(),
	duration: text('duration'),
	price: integer('price').notNull().default(0),
	features: json('features').$type<string[]>().notNull().default([]),
	sample_url: text('sample_url'),
	sort_order: integer('sort_order').notNull().default(0),
	active: boolean('active').notNull().default(true),
	created_at: timestamp('created_at').defaultNow().notNull(),
	updated_at: timestamp('updated_at').defaultNow().notNull(),
})

