import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Made idempotent: 20260609_041000_ticket_design_presets already created the presets table, enum and design_* columns.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN
    CREATE TYPE "public"."enum_events_ticket_types_design_source" AS ENUM('designer', 'preset');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  ALTER TYPE "public"."enum_notifications_type" ADD VALUE IF NOT EXISTS 'comment' BEFORE 'system';
  CREATE TABLE IF NOT EXISTS "ticket_design_presets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"owner_id" integer NOT NULL,
  	"design_key" varchar NOT NULL,
  	"owner_design_key" varchar,
  	"name" varchar NOT NULL,
  	"config" jsonb NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "events_ticket_types" ADD COLUMN IF NOT EXISTS "design_source" "enum_events_ticket_types_design_source" DEFAULT 'designer';
  ALTER TABLE "events_ticket_types" ADD COLUMN IF NOT EXISTS "design_id" varchar;
  ALTER TABLE "events_ticket_types" ADD COLUMN IF NOT EXISTS "design_config" jsonb;
  ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "parent_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "ticket_design_presets_id" integer;
  DO $$ BEGIN
    ALTER TABLE "ticket_design_presets" ADD CONSTRAINT "ticket_design_presets_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE INDEX IF NOT EXISTS "ticket_design_presets_owner_idx" ON "ticket_design_presets" USING btree ("owner_id");
  CREATE INDEX IF NOT EXISTS "ticket_design_presets_design_key_idx" ON "ticket_design_presets" USING btree ("design_key");
  CREATE UNIQUE INDEX IF NOT EXISTS "ticket_design_presets_owner_design_key_idx" ON "ticket_design_presets" USING btree ("owner_design_key");
  CREATE INDEX IF NOT EXISTS "ticket_design_presets_updated_at_idx" ON "ticket_design_presets" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "ticket_design_presets_created_at_idx" ON "ticket_design_presets" USING btree ("created_at");
  DO $$ BEGIN
    ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ticket_design_presets_fk" FOREIGN KEY ("ticket_design_presets_id") REFERENCES "public"."ticket_design_presets"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE INDEX IF NOT EXISTS "comments_parent_idx" ON "comments" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_ticket_design_presets_id_idx" ON "payload_locked_documents_rels" USING btree ("ticket_design_presets_id");
  ALTER TABLE "categories" DROP COLUMN IF EXISTS "icon";
  ALTER TABLE "locations" DROP COLUMN IF EXISTS "emoji";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ticket_design_presets" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "ticket_design_presets" CASCADE;
  ALTER TABLE "comments" DROP CONSTRAINT "comments_parent_id_comments_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_ticket_design_presets_fk";
  
  ALTER TABLE "notifications" ALTER COLUMN "type" SET DATA TYPE text;
  ALTER TABLE "notifications" ALTER COLUMN "type" SET DEFAULT 'order'::text;
  DROP TYPE "public"."enum_notifications_type";
  CREATE TYPE "public"."enum_notifications_type" AS ENUM('order', 'checkin', 'finance', 'system');
  ALTER TABLE "notifications" ALTER COLUMN "type" SET DEFAULT 'order'::"public"."enum_notifications_type";
  ALTER TABLE "notifications" ALTER COLUMN "type" SET DATA TYPE "public"."enum_notifications_type" USING "type"::"public"."enum_notifications_type";
  DROP INDEX "comments_parent_idx";
  DROP INDEX "payload_locked_documents_rels_ticket_design_presets_id_idx";
  ALTER TABLE "categories" ADD COLUMN "icon" varchar;
  ALTER TABLE "locations" ADD COLUMN "emoji" varchar;
  ALTER TABLE "events_ticket_types" DROP COLUMN "design_source";
  ALTER TABLE "events_ticket_types" DROP COLUMN "design_id";
  ALTER TABLE "events_ticket_types" DROP COLUMN "design_config";
  ALTER TABLE "comments" DROP COLUMN "parent_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "ticket_design_presets_id";
  DROP TYPE "public"."enum_events_ticket_types_design_source";`)
}
