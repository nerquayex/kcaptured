ALTER TABLE "bookings" ADD COLUMN "idempotency_key" text;
CREATE UNIQUE INDEX "bookings_idempotency_key_unique" ON "bookings" ("idempotency_key") WHERE "idempotency_key" IS NOT NULL;