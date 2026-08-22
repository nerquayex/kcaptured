CREATE TABLE "testimonials" (
	"id" text PRIMARY KEY NOT NULL,
	"client_name" text NOT NULL,
	"client_role" text,
	"content" text NOT NULL,
	"video_url" text,
	"video_public_id" text,
	"image_url" text,
	"rating" integer DEFAULT 5 NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);