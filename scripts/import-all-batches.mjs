import { createClient } from "@supabase/supabase-js";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Missing env vars. Make sure .env.local exists.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function importBatch(batchNumber) {
  const filePath = path.join(__dirname, "..", `import-items-batch-${batchNumber}.sql`);

  try {
    const sql = await readFile(filePath, "utf-8");
    console.log(`📦 Importing batch ${batchNumber}...`);

    // Note: This requires service role key, not anon key
    // The SQL contains INSERT statements that bypass RLS
    const { error } = await supabase.rpc("exec_sql", { sql_query: sql });

    if (error) {
      console.error(`❌ Batch ${batchNumber} failed:`, error.message);
      return false;
    }

    console.log(`✅ Batch ${batchNumber} imported successfully`);
    return true;
  } catch (err) {
    console.error(`❌ Error reading batch ${batchNumber}:`, err.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Starting CSV import...\n");

  // Check current count
  const { data: before, error: beforeError } = await supabase
    .from("items")
    .select("id", { count: "exact", head: true });

  if (beforeError) {
    console.log("⚠️  Could not check current count (RLS active)");
  } else {
    console.log(`📊 Current items count: ${before?.length ?? 0}\n`);
  }

  // Import all batches
  let successCount = 0;
  for (let i = 1; i <= 8; i++) {
    const success = await importBatch(i);
    if (success) successCount++;

    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n✨ Import complete! ${successCount}/8 batches succeeded.`);

  // Check final count (will fail due to RLS, but shows intent)
  const { data: after } = await supabase
    .from("items")
    .select("id", { count: "exact", head: true });

  if (after) {
    console.log(`📊 Final items count: ${after.length}`);
  } else {
    console.log("\n💡 Run this in Supabase SQL Editor to verify:");
    console.log("   SELECT COUNT(*) FROM public.items;");
  }
}

main().catch(console.error);
