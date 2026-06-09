import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "tickets" ADD COLUMN "attendee_name" varchar;
    ALTER TABLE "tickets" ADD COLUMN "attendee_email" varchar;
    ALTER TABLE "tickets" ADD COLUMN "attendee_phone" varchar;

    UPDATE "tickets"
    SET
      "attendee_name" = "purchaser_name",
      "attendee_email" = "purchaser_email",
      "attendee_phone" = "purchaser_phone"
    WHERE "attendee_name" IS NULL;

    ALTER TABLE "tickets" ALTER COLUMN "attendee_name" SET NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "tickets" DROP COLUMN "attendee_phone";
    ALTER TABLE "tickets" DROP COLUMN "attendee_email";
    ALTER TABLE "tickets" DROP COLUMN "attendee_name";
  `)
}
