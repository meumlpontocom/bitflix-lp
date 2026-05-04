import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Migration manual: catalogo open source.
// O gerador tentou incluir novamente os Globals de paginas porque a migration
// manual 20260430_pages_globals nao tem snapshot JSON. Este arquivo mantem
// apenas as tabelas novas do catalogo e os campos de lock correspondentes.

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_open_source_catalog_imports_status" AS ENUM('pending', 'running', 'done', 'partial', 'failed');
    CREATE TYPE "public"."enum_open_source_catalog_entries_project_type" AS ENUM('ai-agent', 'mcp', 'llm-app', 'developer-tool', 'automation', 'data-ai', 'frontend', 'backend', 'infra', 'security', 'learning', 'other');
    CREATE TYPE "public"."enum_open_source_catalog_entries_catalog_status" AS ENUM('draft', 'review', 'published', 'archived');

    CREATE TABLE "open_source_catalog_imports" (
      "id" serial PRIMARY KEY NOT NULL,
      "source_url" varchar NOT NULL,
      "source_name" varchar DEFAULT 'Github Awesome',
      "requested_by" varchar,
      "status" "enum_open_source_catalog_imports_status" DEFAULT 'pending' NOT NULL,
      "repos_found_count" numeric DEFAULT 0,
      "repos_imported_count" numeric DEFAULT 0,
      "repos_skipped_count" numeric DEFAULT 0,
      "started_at" timestamp(3) with time zone,
      "finished_at" timestamp(3) with time zone,
      "notes" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE "open_source_catalog_imports_errors" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "repository_url" varchar,
      "message" varchar NOT NULL,
      "occurred_at" timestamp(3) with time zone
    );

    CREATE TABLE "open_source_catalog_entries" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "article_id" integer NOT NULL,
      "repository_url" varchar NOT NULL,
      "repository_owner" varchar,
      "repository_name" varchar,
      "homepage_url" varchar,
      "docs_url" varchar,
      "description_original" varchar,
      "summary_pt_br" varchar NOT NULL,
      "what_it_does" varchar,
      "when_to_use" varchar,
      "when_not_to_use" varchar,
      "project_type" "enum_open_source_catalog_entries_project_type" DEFAULT 'other' NOT NULL,
      "primary_language" varchar,
      "license" varchar,
      "stars" numeric DEFAULT 0,
      "forks" numeric DEFAULT 0,
      "open_issues" numeric DEFAULT 0,
      "last_pushed_at" timestamp(3) with time zone,
      "last_checked_at" timestamp(3) with time zone,
      "readme_excerpt" varchar,
      "discovery_source_url" varchar,
      "discovery_source_name" varchar,
      "discovery_batch_id_id" integer,
      "catalog_status" "enum_open_source_catalog_entries_catalog_status" DEFAULT 'draft' NOT NULL,
      "is_featured" boolean DEFAULT false,
      "is_active" boolean DEFAULT true,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE "open_source_catalog_entries_source_links" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar,
      "url" varchar NOT NULL
    );

    CREATE TABLE "open_source_catalog_entries_target_users" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL
    );

    CREATE TABLE "open_source_catalog_entries_github_topics" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "topic" varchar NOT NULL
    );

    CREATE TABLE "open_source_catalog_entries_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "categories_id" integer,
      "tags_id" integer
    );

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "open_source_catalog_imports_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "open_source_catalog_entries_id" integer;

    ALTER TABLE "open_source_catalog_imports_errors" ADD CONSTRAINT "open_source_catalog_imports_errors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."open_source_catalog_imports"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "open_source_catalog_entries" ADD CONSTRAINT "open_source_catalog_entries_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "open_source_catalog_entries" ADD CONSTRAINT "open_source_catalog_entries_discovery_batch_id_id_open_source_catalog_imports_id_fk" FOREIGN KEY ("discovery_batch_id_id") REFERENCES "public"."open_source_catalog_imports"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "open_source_catalog_entries_source_links" ADD CONSTRAINT "open_source_catalog_entries_source_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."open_source_catalog_entries"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "open_source_catalog_entries_target_users" ADD CONSTRAINT "open_source_catalog_entries_target_users_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."open_source_catalog_entries"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "open_source_catalog_entries_github_topics" ADD CONSTRAINT "open_source_catalog_entries_github_topics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."open_source_catalog_entries"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "open_source_catalog_entries_rels" ADD CONSTRAINT "open_source_catalog_entries_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."open_source_catalog_entries"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "open_source_catalog_entries_rels" ADD CONSTRAINT "open_source_catalog_entries_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "open_source_catalog_entries_rels" ADD CONSTRAINT "open_source_catalog_entries_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_open_source_catalog_imports_fk" FOREIGN KEY ("open_source_catalog_imports_id") REFERENCES "public"."open_source_catalog_imports"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_open_source_catalog_entries_fk" FOREIGN KEY ("open_source_catalog_entries_id") REFERENCES "public"."open_source_catalog_entries"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "open_source_catalog_imports_errors_order_idx" ON "open_source_catalog_imports_errors" USING btree ("_order");
    CREATE INDEX "open_source_catalog_imports_errors_parent_id_idx" ON "open_source_catalog_imports_errors" USING btree ("_parent_id");
    CREATE INDEX "open_source_catalog_imports_updated_at_idx" ON "open_source_catalog_imports" USING btree ("updated_at");
    CREATE INDEX "open_source_catalog_imports_created_at_idx" ON "open_source_catalog_imports" USING btree ("created_at");
    CREATE UNIQUE INDEX "open_source_catalog_entries_slug_idx" ON "open_source_catalog_entries" USING btree ("slug");
    CREATE UNIQUE INDEX "open_source_catalog_entries_article_idx" ON "open_source_catalog_entries" USING btree ("article_id");
    CREATE UNIQUE INDEX "open_source_catalog_entries_repository_url_idx" ON "open_source_catalog_entries" USING btree ("repository_url");
    CREATE INDEX "open_source_catalog_entries_repository_owner_idx" ON "open_source_catalog_entries" USING btree ("repository_owner");
    CREATE INDEX "open_source_catalog_entries_repository_name_idx" ON "open_source_catalog_entries" USING btree ("repository_name");
    CREATE INDEX "open_source_catalog_entries_primary_language_idx" ON "open_source_catalog_entries" USING btree ("primary_language");
    CREATE INDEX "open_source_catalog_entries_license_idx" ON "open_source_catalog_entries" USING btree ("license");
    CREATE INDEX "open_source_catalog_entries_discovery_batch_id_idx" ON "open_source_catalog_entries" USING btree ("discovery_batch_id_id");
    CREATE INDEX "open_source_catalog_entries_updated_at_idx" ON "open_source_catalog_entries" USING btree ("updated_at");
    CREATE INDEX "open_source_catalog_entries_created_at_idx" ON "open_source_catalog_entries" USING btree ("created_at");
    CREATE INDEX "open_source_catalog_entries_source_links_order_idx" ON "open_source_catalog_entries_source_links" USING btree ("_order");
    CREATE INDEX "open_source_catalog_entries_source_links_parent_id_idx" ON "open_source_catalog_entries_source_links" USING btree ("_parent_id");
    CREATE INDEX "open_source_catalog_entries_target_users_order_idx" ON "open_source_catalog_entries_target_users" USING btree ("_order");
    CREATE INDEX "open_source_catalog_entries_target_users_parent_id_idx" ON "open_source_catalog_entries_target_users" USING btree ("_parent_id");
    CREATE INDEX "open_source_catalog_entries_github_topics_order_idx" ON "open_source_catalog_entries_github_topics" USING btree ("_order");
    CREATE INDEX "open_source_catalog_entries_github_topics_parent_id_idx" ON "open_source_catalog_entries_github_topics" USING btree ("_parent_id");
    CREATE INDEX "open_source_catalog_entries_rels_order_idx" ON "open_source_catalog_entries_rels" USING btree ("order");
    CREATE INDEX "open_source_catalog_entries_rels_parent_idx" ON "open_source_catalog_entries_rels" USING btree ("parent_id");
    CREATE INDEX "open_source_catalog_entries_rels_path_idx" ON "open_source_catalog_entries_rels" USING btree ("path");
    CREATE INDEX "open_source_catalog_entries_rels_categories_id_idx" ON "open_source_catalog_entries_rels" USING btree ("categories_id");
    CREATE INDEX "open_source_catalog_entries_rels_tags_id_idx" ON "open_source_catalog_entries_rels" USING btree ("tags_id");
    CREATE INDEX "payload_locked_documents_rels_open_source_catalog_import_idx" ON "payload_locked_documents_rels" USING btree ("open_source_catalog_imports_id");
    CREATE INDEX "payload_locked_documents_rels_open_source_catalog_entrie_idx" ON "payload_locked_documents_rels" USING btree ("open_source_catalog_entries_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_open_source_catalog_imports_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_open_source_catalog_entries_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_open_source_catalog_import_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_open_source_catalog_entrie_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "open_source_catalog_imports_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "open_source_catalog_entries_id";

    DROP TABLE IF EXISTS "open_source_catalog_entries_rels" CASCADE;
    DROP TABLE IF EXISTS "open_source_catalog_entries_github_topics" CASCADE;
    DROP TABLE IF EXISTS "open_source_catalog_entries_target_users" CASCADE;
    DROP TABLE IF EXISTS "open_source_catalog_entries_source_links" CASCADE;
    DROP TABLE IF EXISTS "open_source_catalog_entries" CASCADE;
    DROP TABLE IF EXISTS "open_source_catalog_imports_errors" CASCADE;
    DROP TABLE IF EXISTS "open_source_catalog_imports" CASCADE;

    DROP TYPE IF EXISTS "public"."enum_open_source_catalog_entries_catalog_status";
    DROP TYPE IF EXISTS "public"."enum_open_source_catalog_entries_project_type";
    DROP TYPE IF EXISTS "public"."enum_open_source_catalog_imports_status";
  `)
}
