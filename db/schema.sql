-- Neon Postgres schema for Recipes app
-- Run this in Neon SQL Editor (or psql) once.

create table if not exists recipes (
  id bigint primary key,
  name text not null,
  tags jsonb not null default '[]'::jsonb,
  ingredients jsonb not null default '[]'::jsonb,
  instructions text not null default '',
  calories int not null default 0,
  protein int not null default 0,
  fiber int not null default 0,
  carbs int not null default 0,
  fat int not null default 0,
  sugar int not null default 0,
  sodium int not null default 0,
  cholesterol int not null default 0,
  saturated int not null default 0,
  image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recipes_name_idx on recipes using gin (to_tsvector('english', name));
create index if not exists recipes_tags_idx on recipes using gin (tags);
