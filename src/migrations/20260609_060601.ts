import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_rels" ADD COLUMN "users_id" integer;
  ALTER TABLE "tickets" ADD COLUMN "attendee_name" varchar NOT NULL;
  ALTER TABLE "tickets" ADD COLUMN "attendee_email" varchar;
  ALTER TABLE "tickets" ADD COLUMN "attendee_phone" varchar;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_rels_users_id_idx" ON "users_rels" USING btree ("users_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_rels" DROP CONSTRAINT "users_rels_users_fk";
  
  DROP INDEX "users_rels_users_id_idx";
  ALTER TABLE "users_rels" DROP COLUMN "users_id";
  ALTER TABLE "tickets" DROP COLUMN "attendee_name";
  ALTER TABLE "tickets" DROP COLUMN "attendee_email";
  ALTER TABLE "tickets" DROP COLUMN "attendee_phone";`)
}
