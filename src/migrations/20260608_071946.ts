import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_categories_group" AS ENUM('school-activities', 'hobbies', 'home-lifestyle', 'fashion', 'government', 'family-education', 'spirituality', 'charity-causes', 'travel-outdoor', 'science-tech', 'health', 'sports-fitness', 'film-media', 'arts', 'community', 'food-drink', 'business', 'music');
  CREATE TYPE "public"."enum_categories_status" AS ENUM('active', 'inactive');
  CREATE TYPE "public"."enum_locations_region" AS ENUM('sumatera', 'jawa', 'bali-nusra', 'kalimantan', 'sulawesi', 'maluku-papua');
  CREATE TYPE "public"."enum_events_ticket_types_sales_end_mode" AS ENUM('limited', 'unlimited');
  CREATE TYPE "public"."enum_events_ticket_types_currency" AS ENUM('USD');
  CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published', 'cancelled', 'completed');
  CREATE TYPE "public"."enum_tickets_status" AS ENUM('active', 'pending', 'completed', 'checked_in', 'cancelled', 'refunded');
  CREATE TYPE "public"."enum_tickets_payment_provider" AS ENUM('stripe', 'paypal');
  CREATE TYPE "public"."enum_tickets_currency" AS ENUM('USD');
  CREATE TYPE "public"."enum_notifications_type" AS ENUM('order', 'checkin', 'finance', 'system');
  CREATE TYPE "public"."enum_finance_settings_default_provider" AS ENUM('auto', 'stripe');
  CREATE TYPE "public"."enum_finance_settings_currency" AS ENUM('USD');
  CREATE TYPE "public"."enum_payment_connections_provider" AS ENUM('stripe', 'paypal');
  CREATE TYPE "public"."enum_payment_connections_status" AS ENUM('pending', 'connected', 'revoked', 'disabled');
  CREATE TYPE "public"."enum_promotions_type" AS ENUM('code', 'access');
  CREATE TYPE "public"."enum_promotions_discount_type" AS ENUM('percent', 'flat');
  CREATE TYPE "public"."enum_promotions_scope_type" AS ENUM('all', 'events');
  CREATE TYPE "public"."enum_promotions_status" AS ENUM('draft', 'active', 'scheduled', 'ended');
  CREATE TYPE "public"."enum_promotions_starts_at_mode" AS ENUM('now', 'custom');
  CREATE TYPE "public"."enum_promotions_ends_at_mode" AS ENUM('sales_end', 'custom');
  CREATE TYPE "public"."enum_email_template_defaults_status" AS ENUM('active', 'draft');
  CREATE TYPE "public"."enum_organization_email_templates_status" AS ENUM('active', 'draft');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role_id" integer,
  	"role_name" varchar,
  	"is_onboarded" boolean DEFAULT false,
  	"default_location_id" integer,
  	"onboarding_step" numeric DEFAULT 0,
  	"is_organizer" boolean DEFAULT false,
  	"avatar_id" integer,
  	"bio" varchar,
  	"website" varchar,
  	"instagram" varchar,
  	"followers_count" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "users_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"events_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "permissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"key" varchar NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "roles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "roles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"permissions_id" integer
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"icon" varchar,
  	"group" "enum_categories_group" NOT NULL,
  	"status" "enum_categories_status" DEFAULT 'active',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "locations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"code" varchar,
  	"region" "enum_locations_region",
  	"featured" boolean DEFAULT false,
  	"emoji" varchar,
  	"cover_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "events_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "events_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "events_ticket_types_perks" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"perk" varchar NOT NULL
  );
  
  CREATE TABLE "events_ticket_types" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"price" numeric DEFAULT 0 NOT NULL,
  	"sales_end_mode" "enum_events_ticket_types_sales_end_mode" DEFAULT 'limited',
  	"currency" "enum_events_ticket_types_currency" DEFAULT 'USD',
  	"quantity" numeric NOT NULL,
  	"sold" numeric DEFAULT 0,
  	"max_per_order" numeric DEFAULT 10,
  	"sales_start" timestamp(3) with time zone,
  	"sales_end" timestamp(3) with time zone,
  	"is_hidden" boolean DEFAULT false,
  	"sort_order" numeric DEFAULT 0
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"summary" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"cover_image_id" integer,
  	"banner_image_id" integer,
  	"organizer_id" integer NOT NULL,
  	"status" "enum_events_status" DEFAULT 'draft' NOT NULL,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone,
  	"location_id" integer,
  	"venue" varchar,
  	"address" varchar,
  	"is_online" boolean DEFAULT false,
  	"is_free" boolean DEFAULT false,
  	"price" varchar,
  	"category_id" integer,
  	"interested_count" numeric DEFAULT 0,
  	"capacity" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tickets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_id" integer NOT NULL,
  	"order" varchar NOT NULL,
  	"purchaser_name" varchar NOT NULL,
  	"purchaser_email" varchar NOT NULL,
  	"purchaser_phone" varchar,
  	"ticket_type" varchar NOT NULL,
  	"price" numeric DEFAULT 0 NOT NULL,
  	"status" "enum_tickets_status" DEFAULT 'active' NOT NULL,
  	"qr_token" varchar,
  	"stripe_checkout_session_id" varchar,
  	"stripe_payment_intent_id" varchar,
  	"stripe_destination_account_id" varchar,
  	"paid_at" timestamp(3) with time zone,
  	"checked_in_at" timestamp(3) with time zone,
  	"checked_in_by_id" integer,
  	"payment_provider" "enum_tickets_payment_provider",
  	"service_fee_amount" numeric DEFAULT 0,
  	"tax_amount" numeric DEFAULT 0,
  	"subtotal_amount" numeric DEFAULT 0,
  	"total_amount" numeric DEFAULT 0,
  	"currency" "enum_tickets_currency" DEFAULT 'USD',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "notifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"recipient_id" integer NOT NULL,
  	"type" "enum_notifications_type" DEFAULT 'order' NOT NULL,
  	"title" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"link" varchar,
  	"is_read" boolean DEFAULT false,
  	"read_at" timestamp(3) with time zone,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "finance_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"organizer_id" integer NOT NULL,
  	"service_fee_percent" numeric DEFAULT 5 NOT NULL,
  	"tax_percent" numeric DEFAULT 0 NOT NULL,
  	"tax_label" varchar DEFAULT 'Tax',
  	"default_provider" "enum_finance_settings_default_provider" DEFAULT 'auto' NOT NULL,
  	"currency" "enum_finance_settings_currency" DEFAULT 'USD' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payment_connections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"organizer_id" integer NOT NULL,
  	"provider" "enum_payment_connections_provider" NOT NULL,
  	"status" "enum_payment_connections_status" DEFAULT 'pending' NOT NULL,
  	"default_provider" boolean DEFAULT false,
  	"external_account_id" varchar,
  	"account_email" varchar,
  	"account_name" varchar,
  	"country" varchar,
  	"capabilities" jsonb,
  	"auth_state" varchar,
  	"access_token" varchar,
  	"refresh_token" varchar,
  	"expires_at" timestamp(3) with time zone,
  	"connected_at" timestamp(3) with time zone,
  	"revoked_at" timestamp(3) with time zone,
  	"onboarding_url" varchar,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "promotions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"code" varchar,
  	"type" "enum_promotions_type" DEFAULT 'code' NOT NULL,
  	"discount_type" "enum_promotions_discount_type" DEFAULT 'percent' NOT NULL,
  	"discount_value" numeric DEFAULT 10 NOT NULL,
  	"usage_count" numeric DEFAULT 0,
  	"usage_limit" numeric,
  	"scope_type" "enum_promotions_scope_type" DEFAULT 'all' NOT NULL,
  	"status" "enum_promotions_status" DEFAULT 'draft' NOT NULL,
  	"starts_at_mode" "enum_promotions_starts_at_mode" DEFAULT 'now' NOT NULL,
  	"starts_at" timestamp(3) with time zone,
  	"ends_at_mode" "enum_promotions_ends_at_mode" DEFAULT 'sales_end' NOT NULL,
  	"ends_at" timestamp(3) with time zone,
  	"organizer_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "promotions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"events_id" integer
  );
  
  CREATE TABLE "email_template_defaults" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"status" "enum_email_template_defaults_status" DEFAULT 'active' NOT NULL,
  	"subject" varchar NOT NULL,
  	"preheader" varchar NOT NULL,
  	"headline" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"cta_label" varchar NOT NULL,
  	"cta_url" varchar NOT NULL,
  	"campaign_name" varchar NOT NULL,
  	"from_name" varchar NOT NULL,
  	"from_email" varchar NOT NULL,
  	"reply_to_email" varchar NOT NULL,
  	"organization_name" varchar NOT NULL,
  	"address" varchar NOT NULL,
  	"city" varchar NOT NULL,
  	"province" varchar NOT NULL,
  	"postal_code" varchar NOT NULL,
  	"country" varchar NOT NULL,
  	"brand_color" varchar DEFAULT '#5151eb' NOT NULL,
  	"secondary_color" varchar DEFAULT '#eef2ff' NOT NULL,
  	"background_color" varchar DEFAULT '#f5f7ff' NOT NULL,
  	"card_background" varchar DEFAULT '#ffffff' NOT NULL,
  	"body_text_color" varchar DEFAULT '#3f3f46' NOT NULL,
  	"heading_color" varchar DEFAULT '#18181b' NOT NULL,
  	"footer_text_color" varchar DEFAULT '#6b7280' NOT NULL,
  	"button_text_color" varchar DEFAULT '#ffffff' NOT NULL,
  	"font_family" varchar DEFAULT 'Arial, sans-serif' NOT NULL,
  	"border_radius" numeric DEFAULT 16 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "organization_email_templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"organizer_id" integer NOT NULL,
  	"default_template_id" integer,
  	"key" varchar NOT NULL,
  	"organizer_template_key" varchar,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"status" "enum_organization_email_templates_status" DEFAULT 'active' NOT NULL,
  	"subject" varchar NOT NULL,
  	"preheader" varchar NOT NULL,
  	"headline" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"cta_label" varchar NOT NULL,
  	"cta_url" varchar NOT NULL,
  	"campaign_name" varchar NOT NULL,
  	"from_name" varchar NOT NULL,
  	"from_email" varchar NOT NULL,
  	"reply_to_email" varchar NOT NULL,
  	"organization_name" varchar NOT NULL,
  	"address" varchar NOT NULL,
  	"city" varchar NOT NULL,
  	"province" varchar NOT NULL,
  	"postal_code" varchar NOT NULL,
  	"country" varchar NOT NULL,
  	"brand_color" varchar DEFAULT '#5151eb' NOT NULL,
  	"secondary_color" varchar DEFAULT '#eef2ff' NOT NULL,
  	"background_color" varchar DEFAULT '#f5f7ff' NOT NULL,
  	"card_background" varchar DEFAULT '#ffffff' NOT NULL,
  	"body_text_color" varchar DEFAULT '#3f3f46' NOT NULL,
  	"heading_color" varchar DEFAULT '#18181b' NOT NULL,
  	"footer_text_color" varchar DEFAULT '#6b7280' NOT NULL,
  	"button_text_color" varchar DEFAULT '#ffffff' NOT NULL,
  	"font_family" varchar DEFAULT 'Arial, sans-serif' NOT NULL,
  	"border_radius" numeric DEFAULT 16 NOT NULL,
  	"is_customized" boolean DEFAULT false,
  	"customized_at" timestamp(3) with time zone,
  	"last_synced_from_default_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "posts_liked_by" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"author_id" integer NOT NULL,
  	"content" varchar NOT NULL,
  	"image_id" integer,
  	"link" varchar,
  	"link_title" varchar,
  	"likes_count" numeric DEFAULT 0,
  	"comments_count" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "comments_mentions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL
  );
  
  CREATE TABLE "comments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"post_id" integer NOT NULL,
  	"author_id" integer NOT NULL,
  	"content" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"permissions_id" integer,
  	"roles_id" integer,
  	"categories_id" integer,
  	"locations_id" integer,
  	"events_id" integer,
  	"tickets_id" integer,
  	"notifications_id" integer,
  	"finance_settings_id" integer,
  	"payment_connections_id" integer,
  	"promotions_id" integer,
  	"email_template_defaults_id" integer,
  	"organization_email_templates_id" integer,
  	"posts_id" integer,
  	"comments_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_default_location_id_locations_id_fk" FOREIGN KEY ("default_location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "roles_rels" ADD CONSTRAINT "roles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "roles_rels" ADD CONSTRAINT "roles_rels_permissions_fk" FOREIGN KEY ("permissions_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "locations" ADD CONSTRAINT "locations_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_gallery_images" ADD CONSTRAINT "events_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_gallery_images" ADD CONSTRAINT "events_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_tags" ADD CONSTRAINT "events_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_ticket_types_perks" ADD CONSTRAINT "events_ticket_types_perks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_ticket_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_ticket_types" ADD CONSTRAINT "events_ticket_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_banner_image_id_media_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tickets" ADD CONSTRAINT "tickets_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tickets" ADD CONSTRAINT "tickets_checked_in_by_id_users_id_fk" FOREIGN KEY ("checked_in_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "finance_settings" ADD CONSTRAINT "finance_settings_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_connections" ADD CONSTRAINT "payment_connections_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "promotions" ADD CONSTRAINT "promotions_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "promotions_rels" ADD CONSTRAINT "promotions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "promotions_rels" ADD CONSTRAINT "promotions_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "organization_email_templates" ADD CONSTRAINT "organization_email_templates_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "organization_email_templates" ADD CONSTRAINT "organization_email_templates_default_template_id_email_template_defaults_id_fk" FOREIGN KEY ("default_template_id") REFERENCES "public"."email_template_defaults"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_liked_by" ADD CONSTRAINT "posts_liked_by_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_liked_by" ADD CONSTRAINT "posts_liked_by_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "comments_mentions" ADD CONSTRAINT "comments_mentions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "comments_mentions" ADD CONSTRAINT "comments_mentions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_permissions_fk" FOREIGN KEY ("permissions_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_roles_fk" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tickets_fk" FOREIGN KEY ("tickets_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_notifications_fk" FOREIGN KEY ("notifications_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_finance_settings_fk" FOREIGN KEY ("finance_settings_id") REFERENCES "public"."finance_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payment_connections_fk" FOREIGN KEY ("payment_connections_id") REFERENCES "public"."payment_connections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_promotions_fk" FOREIGN KEY ("promotions_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_email_template_defaults_fk" FOREIGN KEY ("email_template_defaults_id") REFERENCES "public"."email_template_defaults"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_organization_email_template_fk" FOREIGN KEY ("organization_email_templates_id") REFERENCES "public"."organization_email_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_comments_fk" FOREIGN KEY ("comments_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_role_idx" ON "users" USING btree ("role_id");
  CREATE INDEX "users_default_location_idx" ON "users" USING btree ("default_location_id");
  CREATE INDEX "users_avatar_idx" ON "users" USING btree ("avatar_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "users_rels_order_idx" ON "users_rels" USING btree ("order");
  CREATE INDEX "users_rels_parent_idx" ON "users_rels" USING btree ("parent_id");
  CREATE INDEX "users_rels_path_idx" ON "users_rels" USING btree ("path");
  CREATE INDEX "users_rels_categories_id_idx" ON "users_rels" USING btree ("categories_id");
  CREATE INDEX "users_rels_events_id_idx" ON "users_rels" USING btree ("events_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "permissions_name_idx" ON "permissions" USING btree ("name");
  CREATE UNIQUE INDEX "permissions_key_idx" ON "permissions" USING btree ("key");
  CREATE INDEX "permissions_updated_at_idx" ON "permissions" USING btree ("updated_at");
  CREATE INDEX "permissions_created_at_idx" ON "permissions" USING btree ("created_at");
  CREATE UNIQUE INDEX "roles_name_idx" ON "roles" USING btree ("name");
  CREATE INDEX "roles_updated_at_idx" ON "roles" USING btree ("updated_at");
  CREATE INDEX "roles_created_at_idx" ON "roles" USING btree ("created_at");
  CREATE INDEX "roles_rels_order_idx" ON "roles_rels" USING btree ("order");
  CREATE INDEX "roles_rels_parent_idx" ON "roles_rels" USING btree ("parent_id");
  CREATE INDEX "roles_rels_path_idx" ON "roles_rels" USING btree ("path");
  CREATE INDEX "roles_rels_permissions_id_idx" ON "roles_rels" USING btree ("permissions_id");
  CREATE UNIQUE INDEX "categories_name_idx" ON "categories" USING btree ("name");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "locations_name_idx" ON "locations" USING btree ("name");
  CREATE UNIQUE INDEX "locations_code_idx" ON "locations" USING btree ("code");
  CREATE INDEX "locations_cover_image_idx" ON "locations" USING btree ("cover_image_id");
  CREATE INDEX "locations_updated_at_idx" ON "locations" USING btree ("updated_at");
  CREATE INDEX "locations_created_at_idx" ON "locations" USING btree ("created_at");
  CREATE INDEX "events_gallery_images_order_idx" ON "events_gallery_images" USING btree ("_order");
  CREATE INDEX "events_gallery_images_parent_id_idx" ON "events_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "events_gallery_images_image_idx" ON "events_gallery_images" USING btree ("image_id");
  CREATE INDEX "events_tags_order_idx" ON "events_tags" USING btree ("_order");
  CREATE INDEX "events_tags_parent_id_idx" ON "events_tags" USING btree ("_parent_id");
  CREATE INDEX "events_ticket_types_perks_order_idx" ON "events_ticket_types_perks" USING btree ("_order");
  CREATE INDEX "events_ticket_types_perks_parent_id_idx" ON "events_ticket_types_perks" USING btree ("_parent_id");
  CREATE INDEX "events_ticket_types_order_idx" ON "events_ticket_types" USING btree ("_order");
  CREATE INDEX "events_ticket_types_parent_id_idx" ON "events_ticket_types" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_cover_image_idx" ON "events" USING btree ("cover_image_id");
  CREATE INDEX "events_banner_image_idx" ON "events" USING btree ("banner_image_id");
  CREATE INDEX "events_organizer_idx" ON "events" USING btree ("organizer_id");
  CREATE INDEX "events_location_idx" ON "events" USING btree ("location_id");
  CREATE INDEX "events_category_idx" ON "events" USING btree ("category_id");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "tickets_event_idx" ON "tickets" USING btree ("event_id");
  CREATE UNIQUE INDEX "tickets_qr_token_idx" ON "tickets" USING btree ("qr_token");
  CREATE INDEX "tickets_checked_in_by_idx" ON "tickets" USING btree ("checked_in_by_id");
  CREATE INDEX "tickets_updated_at_idx" ON "tickets" USING btree ("updated_at");
  CREATE INDEX "tickets_created_at_idx" ON "tickets" USING btree ("created_at");
  CREATE INDEX "notifications_recipient_idx" ON "notifications" USING btree ("recipient_id");
  CREATE INDEX "notifications_updated_at_idx" ON "notifications" USING btree ("updated_at");
  CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");
  CREATE UNIQUE INDEX "finance_settings_organizer_idx" ON "finance_settings" USING btree ("organizer_id");
  CREATE INDEX "finance_settings_updated_at_idx" ON "finance_settings" USING btree ("updated_at");
  CREATE INDEX "finance_settings_created_at_idx" ON "finance_settings" USING btree ("created_at");
  CREATE INDEX "payment_connections_organizer_idx" ON "payment_connections" USING btree ("organizer_id");
  CREATE UNIQUE INDEX "payment_connections_auth_state_idx" ON "payment_connections" USING btree ("auth_state");
  CREATE INDEX "payment_connections_updated_at_idx" ON "payment_connections" USING btree ("updated_at");
  CREATE INDEX "payment_connections_created_at_idx" ON "payment_connections" USING btree ("created_at");
  CREATE UNIQUE INDEX "promotions_slug_idx" ON "promotions" USING btree ("slug");
  CREATE UNIQUE INDEX "promotions_code_idx" ON "promotions" USING btree ("code");
  CREATE INDEX "promotions_organizer_idx" ON "promotions" USING btree ("organizer_id");
  CREATE INDEX "promotions_updated_at_idx" ON "promotions" USING btree ("updated_at");
  CREATE INDEX "promotions_created_at_idx" ON "promotions" USING btree ("created_at");
  CREATE INDEX "promotions_rels_order_idx" ON "promotions_rels" USING btree ("order");
  CREATE INDEX "promotions_rels_parent_idx" ON "promotions_rels" USING btree ("parent_id");
  CREATE INDEX "promotions_rels_path_idx" ON "promotions_rels" USING btree ("path");
  CREATE INDEX "promotions_rels_events_id_idx" ON "promotions_rels" USING btree ("events_id");
  CREATE UNIQUE INDEX "email_template_defaults_key_idx" ON "email_template_defaults" USING btree ("key");
  CREATE INDEX "email_template_defaults_updated_at_idx" ON "email_template_defaults" USING btree ("updated_at");
  CREATE INDEX "email_template_defaults_created_at_idx" ON "email_template_defaults" USING btree ("created_at");
  CREATE INDEX "organization_email_templates_organizer_idx" ON "organization_email_templates" USING btree ("organizer_id");
  CREATE INDEX "organization_email_templates_default_template_idx" ON "organization_email_templates" USING btree ("default_template_id");
  CREATE INDEX "organization_email_templates_key_idx" ON "organization_email_templates" USING btree ("key");
  CREATE UNIQUE INDEX "organization_email_templates_organizer_template_key_idx" ON "organization_email_templates" USING btree ("organizer_template_key");
  CREATE INDEX "organization_email_templates_updated_at_idx" ON "organization_email_templates" USING btree ("updated_at");
  CREATE INDEX "organization_email_templates_created_at_idx" ON "organization_email_templates" USING btree ("created_at");
  CREATE INDEX "posts_liked_by_order_idx" ON "posts_liked_by" USING btree ("_order");
  CREATE INDEX "posts_liked_by_parent_id_idx" ON "posts_liked_by" USING btree ("_parent_id");
  CREATE INDEX "posts_liked_by_user_idx" ON "posts_liked_by" USING btree ("user_id");
  CREATE INDEX "posts_author_idx" ON "posts" USING btree ("author_id");
  CREATE INDEX "posts_image_idx" ON "posts" USING btree ("image_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "comments_mentions_order_idx" ON "comments_mentions" USING btree ("_order");
  CREATE INDEX "comments_mentions_parent_id_idx" ON "comments_mentions" USING btree ("_parent_id");
  CREATE INDEX "comments_mentions_user_idx" ON "comments_mentions" USING btree ("user_id");
  CREATE INDEX "comments_post_idx" ON "comments" USING btree ("post_id");
  CREATE INDEX "comments_author_idx" ON "comments" USING btree ("author_id");
  CREATE INDEX "comments_updated_at_idx" ON "comments" USING btree ("updated_at");
  CREATE INDEX "comments_created_at_idx" ON "comments" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_permissions_id_idx" ON "payload_locked_documents_rels" USING btree ("permissions_id");
  CREATE INDEX "payload_locked_documents_rels_roles_id_idx" ON "payload_locked_documents_rels" USING btree ("roles_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_locations_id_idx" ON "payload_locked_documents_rels" USING btree ("locations_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_tickets_id_idx" ON "payload_locked_documents_rels" USING btree ("tickets_id");
  CREATE INDEX "payload_locked_documents_rels_notifications_id_idx" ON "payload_locked_documents_rels" USING btree ("notifications_id");
  CREATE INDEX "payload_locked_documents_rels_finance_settings_id_idx" ON "payload_locked_documents_rels" USING btree ("finance_settings_id");
  CREATE INDEX "payload_locked_documents_rels_payment_connections_id_idx" ON "payload_locked_documents_rels" USING btree ("payment_connections_id");
  CREATE INDEX "payload_locked_documents_rels_promotions_id_idx" ON "payload_locked_documents_rels" USING btree ("promotions_id");
  CREATE INDEX "payload_locked_documents_rels_email_template_defaults_id_idx" ON "payload_locked_documents_rels" USING btree ("email_template_defaults_id");
  CREATE INDEX "payload_locked_documents_rels_organization_email_templat_idx" ON "payload_locked_documents_rels" USING btree ("organization_email_templates_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_comments_id_idx" ON "payload_locked_documents_rels" USING btree ("comments_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "users_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "permissions" CASCADE;
  DROP TABLE "roles" CASCADE;
  DROP TABLE "roles_rels" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "locations" CASCADE;
  DROP TABLE "events_gallery_images" CASCADE;
  DROP TABLE "events_tags" CASCADE;
  DROP TABLE "events_ticket_types_perks" CASCADE;
  DROP TABLE "events_ticket_types" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "tickets" CASCADE;
  DROP TABLE "notifications" CASCADE;
  DROP TABLE "finance_settings" CASCADE;
  DROP TABLE "payment_connections" CASCADE;
  DROP TABLE "promotions" CASCADE;
  DROP TABLE "promotions_rels" CASCADE;
  DROP TABLE "email_template_defaults" CASCADE;
  DROP TABLE "organization_email_templates" CASCADE;
  DROP TABLE "posts_liked_by" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "comments_mentions" CASCADE;
  DROP TABLE "comments" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_categories_group";
  DROP TYPE "public"."enum_categories_status";
  DROP TYPE "public"."enum_locations_region";
  DROP TYPE "public"."enum_events_ticket_types_sales_end_mode";
  DROP TYPE "public"."enum_events_ticket_types_currency";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum_tickets_status";
  DROP TYPE "public"."enum_tickets_payment_provider";
  DROP TYPE "public"."enum_tickets_currency";
  DROP TYPE "public"."enum_notifications_type";
  DROP TYPE "public"."enum_finance_settings_default_provider";
  DROP TYPE "public"."enum_finance_settings_currency";
  DROP TYPE "public"."enum_payment_connections_provider";
  DROP TYPE "public"."enum_payment_connections_status";
  DROP TYPE "public"."enum_promotions_type";
  DROP TYPE "public"."enum_promotions_discount_type";
  DROP TYPE "public"."enum_promotions_scope_type";
  DROP TYPE "public"."enum_promotions_status";
  DROP TYPE "public"."enum_promotions_starts_at_mode";
  DROP TYPE "public"."enum_promotions_ends_at_mode";
  DROP TYPE "public"."enum_email_template_defaults_status";
  DROP TYPE "public"."enum_organization_email_templates_status";`)
}
