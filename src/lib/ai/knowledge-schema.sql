-- Supabase / Postgres table schema for knowledge base retrieval

create table if not exists knowledge_documents (
  id text primary key,
  collection text not null,
  title text not null,
  content text not null,
  source text not null,
  embedding jsonb,
  created_at timestamptz default now()
);

create index if not exists knowledge_documents_collection_idx on knowledge_documents (collection);
