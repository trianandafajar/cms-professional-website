 import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_events_ticket_types_design_source" AS ENUM('designer', 'preset');

    ALTER TABLE "events_ticket_types"
      ADD COLUMN "design_source" "enum_events_ticket_types_design_source" DEFAULT 'designer',
      ADD COLUMN "design_id" varchar;

    CREATE TABLE "ticket_design_presets" (
      "id" serial PRIMARY KEY NOT NULL,
      "owner_id" integer NOT NULL,
      "design_key" varchar NOT NULL,
      "owner_design_key" varchar,
      "name" varchar NOT NULL,
      "config" jsonb NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "ticket_design_presets" ADD CONSTRAINT "ticket_design_presets_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    CREATE INDEX "ticket_design_presets_owner_idx" ON "ticket_design_presets" USING btree ("owner_id");
    CREATE INDEX "ticket_design_presets_design_key_idx" ON "ticket_design_presets" USING btree ("design_key");
    CREATE UNIQUE INDEX "ticket_design_presets_owner_design_key_idx" ON "ticket_design_presets" USING btree ("owner_design_key");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE "ticket_design_presets" CASCADE;
    ALTER TABLE "events_ticket_types" DROP COLUMN "design_id";
    ALTER TABLE "events_ticket_types" DROP COLUMN "design_source";
    DROP TYPE "public"."enum_events_ticket_types_design_source";
  `)
}
