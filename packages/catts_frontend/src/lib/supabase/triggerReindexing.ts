export async function triggerReindexing() {
  await fetch(import.meta.env.VITE_SUPABASE_REINDEX_URL);
}
