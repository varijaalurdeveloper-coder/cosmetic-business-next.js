// file: src/lib/kv-store.ts

import { createClient } from "@/lib/supabase/server";

/*
Table schema:
CREATE TABLE kv_store_35cd97c6 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
*/

// Set stores a key-value pair
export const set = async (key: string, value: any): Promise<void> => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("kv_store_35cd97c6")
    .upsert({ key, value });

  if (error) {
    throw new Error(error.message);
  }
};

// Get retrieves a value
export const get = async (key: string): Promise<any> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("kv_store_35cd97c6")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.value;
};

// Delete a key
export const del = async (key: string): Promise<void> => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("kv_store_35cd97c6")
    .delete()
    .eq("key", key);

  if (error) {
    throw new Error(error.message);
  }
};

// Multiple set
export const mset = async (keys: string[], values: any[]): Promise<void> => {
  const supabase = await createClient();

  const payload = keys.map((k, i) => ({
    key: k,
    value: values[i],
  }));

  const { error } = await supabase
    .from("kv_store_35cd97c6")
    .upsert(payload);

  if (error) {
    throw new Error(error.message);
  }
};

// Multiple get
export const mget = async (keys: string[]): Promise<any[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("kv_store_35cd97c6")
    .select("value")
    .in("key", keys);

  if (error) {
    throw new Error(error.message);
  }

  return data?.map((d) => d.value) ?? [];
};

// Multiple delete
export const mdel = async (keys: string[]): Promise<void> => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("kv_store_35cd97c6")
    .delete()
    .in("key", keys);

  if (error) {
    throw new Error(error.message);
  }
};

// Get all values by prefix
export const getByPrefix = async (prefix: string): Promise<any[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("kv_store_35cd97c6")
    .select("key, value")
    .like("key", `${prefix}%`);

  if (error) {
    throw new Error(error.message);
  }

  return data?.map((d) => d.value) ?? [];
};