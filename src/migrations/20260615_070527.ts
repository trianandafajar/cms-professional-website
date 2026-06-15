import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_event_reports_reason" AS ENUM('spam', 'fraud', 'harassment', 'unsafe', 'wrong_info', 'other');
  CREATE TYPE "public"."enum_event_reports_status" AS ENUM('open', 'reviewing', 'resolved', 'dismissed');
  ALTER TYPE "public"."enum_notifications_type" ADD VALUE 'like' BEFORE 'system';
  CREATE TABLE "event_reports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_id" integer NOT NULL,
  	"organizer_id" integer,
  	"reporter_id" integer,
  	"reporter_name" varchar NOT NULL,
  	"reporter_email" varchar NOT NULL,
  	"reason" "enum_event_reports_reason" NOT NULL,
  	"details" varchar NOT NULL,
  	"source_path" varchar,
  	"user_agent" varchar,
  	"status" "enum_event_reports_status" DEFAULT 'open',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users" ADD COLUMN "banner_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "event_reports_id" integer;
  ALTER TABLE "event_reports" ADD CONSTRAINT "event_reports_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_reports" ADD CONSTRAINT "event_reports_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_reports" ADD CONSTRAINT "event_reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "event_reports_event_idx" ON "event_reports" USING btree ("event_id");
  CREATE INDEX "event_reports_organizer_idx" ON "event_reports" USING btree ("organizer_id");
  CREATE INDEX "event_reports_reporter_idx" ON "event_reports" USING btree ("reporter_id");
  CREATE INDEX "event_reports_updated_at_idx" ON "event_reports" USING btree ("updated_at");
  CREATE INDEX "event_reports_created_at_idx" ON "event_reports" USING btree ("created_at");
  ALTER TABLE "users" ADD CONSTRAINT "users_banner_id_media_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_event_reports_fk" FOREIGN KEY ("event_reports_id") REFERENCES "public"."event_reports"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_banner_idx" ON "users" USING btree ("banner_id");
  CREATE INDEX "payload_locked_documents_rels_event_reports_id_idx" ON "payload_locked_documents_rels" USING btree ("event_reports_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "event_reports" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "event_reports" CASCADE;
  ALTER TABLE "users" DROP CONSTRAINT "users_banner_id_media_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_event_reports_fk";
  
  ALTER TABLE "notifications" ALTER COLUMN "type" SET DATA TYPE text;
  ALTER TABLE "notifications" ALTER COLUMN "type" SET DEFAULT 'order'::text;
  DROP TYPE "public"."enum_notifications_type";
  CREATE TYPE "public"."enum_notifications_type" AS ENUM('order', 'checkin', 'finance', 'comment', 'system');
  ALTER TABLE "notifications" ALTER COLUMN "type" SET DEFAULT 'order'::"public"."enum_notifications_type";
  ALTER TABLE "notifications" ALTER COLUMN "type" SET DATA TYPE "public"."enum_notifications_type" USING "type"::"public"."enum_notifications_type";
  DROP INDEX "users_banner_idx";
  DROP INDEX "payload_locked_documents_rels_event_reports_id_idx";
  ALTER TABLE "users" DROP COLUMN "banner_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "event_reports_id";
  DROP TYPE "public"."enum_event_reports_reason";
  DROP TYPE "public"."enum_event_reports_status";`)
}
