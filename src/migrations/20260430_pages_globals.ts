import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Migration manual: 5 Globals novos pos-MVP (HomePage, ProdutosPage, ServicosPage,
// SobrePage, ContatoPage) que foram adicionados em dev (push: true) mas nao tinham
// snapshot capturado pra prod. Schema dumpado do staging em 2026-04-30.

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_home_page_pillars_icon" AS ENUM('Cpu', 'Layers', 'Rocket', 'FlaskConical', 'Network', 'Cog', 'Shield', 'Zap', 'Sparkles', 'Code2');
    CREATE TYPE "public"."enum_servicos_page_project_types_icon" AS ENUM('FlaskConical', 'Network', 'Cog', 'Shield', 'Cpu', 'Layers', 'Rocket', 'Zap', 'Sparkles', 'Code2');

    CREATE TABLE "home_page" (
      "id" serial PRIMARY KEY NOT NULL,
      "hero_title_prefix" varchar NOT NULL,
      "hero_title_highlight" varchar NOT NULL,
      "hero_title_suffix" varchar NOT NULL,
      "hero_cta_primary_label" varchar DEFAULT 'Conhecer produtos' NOT NULL,
      "hero_cta_secondary_label" varchar DEFAULT 'Projeto sob demanda' NOT NULL,
      "pillars_section_title" varchar NOT NULL,
      "pillars_section_body" varchar NOT NULL,
      "products_section_title" varchar NOT NULL,
      "products_section_body" varchar NOT NULL,
      "products_section_link_label" varchar DEFAULT 'Ver todos' NOT NULL,
      "custom_section_title" varchar NOT NULL,
      "custom_section_body" varchar NOT NULL,
      "custom_section_cta_label" varchar DEFAULT 'Como funciona' NOT NULL,
      "custom_section_whatsapp_label" varchar DEFAULT 'Tirar dúvidas' NOT NULL,
      "custom_section_aside_eyebrow" varchar DEFAULT 'Como entregamos' NOT NULL,
      "blog_section_title" varchar DEFAULT 'Do blog' NOT NULL,
      "blog_section_body" varchar NOT NULL,
      "blog_section_link_label" varchar DEFAULT 'Ler tudo' NOT NULL,
      "final_cta_title" varchar NOT NULL,
      "final_cta_body" varchar NOT NULL,
      "updated_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone
    );

    CREATE TABLE "home_page_pillars" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "icon" "enum_home_page_pillars_icon" NOT NULL,
      "title" varchar NOT NULL,
      "body" varchar NOT NULL
    );

    CREATE TABLE "home_page_custom_section_steps" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "text" varchar NOT NULL
    );

    CREATE TABLE "produtos_page" (
      "id" serial PRIMARY KEY NOT NULL,
      "eyebrow" varchar DEFAULT 'Produtos próprios' NOT NULL,
      "title" varchar NOT NULL,
      "subtitle" varchar NOT NULL,
      "empty_state_label" varchar DEFAULT 'Em breve.' NOT NULL,
      "bottom_cta_title" varchar NOT NULL,
      "bottom_cta_body" varchar NOT NULL,
      "updated_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone
    );

    CREATE TABLE "servicos_page" (
      "id" serial PRIMARY KEY NOT NULL,
      "eyebrow" varchar DEFAULT 'Projetos sob demanda' NOT NULL,
      "title" varchar NOT NULL,
      "subtitle" varchar NOT NULL,
      "hero_cta_label" varchar DEFAULT 'Solicitar orçamento' NOT NULL,
      "project_types_title" varchar DEFAULT 'Tipos de projeto' NOT NULL,
      "process_title" varchar DEFAULT 'Como trabalhamos' NOT NULL,
      "stack_title" varchar DEFAULT 'Stack atual' NOT NULL,
      "stack_intro" varchar NOT NULL,
      "bottom_cta_title" varchar NOT NULL,
      "bottom_cta_body" varchar NOT NULL,
      "updated_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone
    );

    CREATE TABLE "servicos_page_stack_items" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL
    );

    CREATE TABLE "servicos_page_project_types" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "icon" "enum_servicos_page_project_types_icon" NOT NULL,
      "title" varchar NOT NULL,
      "body" varchar NOT NULL
    );

    CREATE TABLE "servicos_page_process_steps" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "number" varchar NOT NULL,
      "title" varchar NOT NULL,
      "body" varchar NOT NULL
    );

    CREATE TABLE "sobre_page" (
      "id" serial PRIMARY KEY NOT NULL,
      "eyebrow" varchar DEFAULT 'Sobre a Bitflix' NOT NULL,
      "title" varchar NOT NULL,
      "manifesto_section_title" varchar DEFAULT 'Manifesto' NOT NULL,
      "author_section_title" varchar DEFAULT 'Quem assina' NOT NULL,
      "author_bio_fallback" varchar DEFAULT 'Bio em construção.' NOT NULL,
      "final_cta_title" varchar NOT NULL,
      "final_cta_body" varchar NOT NULL,
      "updated_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone
    );

    CREATE TABLE "contato_page" (
      "id" serial PRIMARY KEY NOT NULL,
      "eyebrow" varchar DEFAULT 'Contato' NOT NULL,
      "title" varchar NOT NULL,
      "subtitle" varchar NOT NULL,
      "updated_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone
    );

    DO $$ BEGIN
      ALTER TABLE "home_page_pillars" ADD CONSTRAINT "home_page_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "home_page_custom_section_steps" ADD CONSTRAINT "home_page_custom_section_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "servicos_page_stack_items" ADD CONSTRAINT "servicos_page_stack_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."servicos_page"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "servicos_page_project_types" ADD CONSTRAINT "servicos_page_project_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."servicos_page"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "servicos_page_process_steps" ADD CONSTRAINT "servicos_page_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."servicos_page"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE INDEX "home_page_pillars_order_idx" ON "home_page_pillars" USING btree ("_order");
    CREATE INDEX "home_page_pillars_parent_id_idx" ON "home_page_pillars" USING btree ("_parent_id");
    CREATE INDEX "home_page_custom_section_steps_order_idx" ON "home_page_custom_section_steps" USING btree ("_order");
    CREATE INDEX "home_page_custom_section_steps_parent_id_idx" ON "home_page_custom_section_steps" USING btree ("_parent_id");
    CREATE INDEX "servicos_page_stack_items_order_idx" ON "servicos_page_stack_items" USING btree ("_order");
    CREATE INDEX "servicos_page_stack_items_parent_id_idx" ON "servicos_page_stack_items" USING btree ("_parent_id");
    CREATE INDEX "servicos_page_project_types_order_idx" ON "servicos_page_project_types" USING btree ("_order");
    CREATE INDEX "servicos_page_project_types_parent_id_idx" ON "servicos_page_project_types" USING btree ("_parent_id");
    CREATE INDEX "servicos_page_process_steps_order_idx" ON "servicos_page_process_steps" USING btree ("_order");
    CREATE INDEX "servicos_page_process_steps_parent_id_idx" ON "servicos_page_process_steps" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE "home_page_pillars" CASCADE;
    DROP TABLE "home_page_custom_section_steps" CASCADE;
    DROP TABLE "home_page" CASCADE;
    DROP TABLE "produtos_page" CASCADE;
    DROP TABLE "servicos_page_stack_items" CASCADE;
    DROP TABLE "servicos_page_project_types" CASCADE;
    DROP TABLE "servicos_page_process_steps" CASCADE;
    DROP TABLE "servicos_page" CASCADE;
    DROP TABLE "sobre_page" CASCADE;
    DROP TABLE "contato_page" CASCADE;
    DROP TYPE "public"."enum_home_page_pillars_icon";
    DROP TYPE "public"."enum_servicos_page_project_types_icon";
  `)
}
