CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"description" text NOT NULL,
	"actor" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);