CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"client_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"package_name" text NOT NULL,
	"preferred_date" timestamp with time zone,
	"request_date" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" text PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"name" text NOT NULL,
	"duration" text,
	"price" integer DEFAULT 0 NOT NULL,
	"features" json DEFAULT '[]'::json NOT NULL,
	"sample_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_items" (
	"id" text PRIMARY KEY NOT NULL,
	"public_id" text NOT NULL,
	"cloudinary_url" text NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"caption" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"width" integer,
	"height" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" text PRIMARY KEY DEFAULT 'site-settings' NOT NULL,
	"studio_name" text DEFAULT 'KCAPTURED' NOT NULL,
	"email" text,
	"phone" text,
	"instagram_handle" text,
	"booking_email" text,
	"max_concurrent_bookings" integer DEFAULT 10 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
