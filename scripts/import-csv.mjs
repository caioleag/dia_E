import { createClient } from "@supabase/supabase-js";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = "https://qoqgolgarmwcrbssaksf.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvcWdvbGdhcm13Y3Jic3Nha3NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMDQzODgsImV4cCI6MjA4NjY4MDM4OH0.3N1JtLIQqqO1JsC44LagiL6w6sNkBQpFHR8Dd-NI_Ps";

// We need service role key for inserts bypassing RLS on items
// Since items table has RLS and we're not authenticated, let's use the migration approach
// But we can't do that here. Let's use execute_sql equivalent via direct postgres.

// Alternative: use service role key from env or just use the existing import SQL files

import { readFile } from "fs/promises";

// Read the CSV and parse it
const csvPath = path.join(__dirname, "..", "banco-conteudo.csv");

async function parseCSV(filePath) {
  const rows = [];
  const stream = createReadStream(filePath);
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  let isHeader = true;
  for await (const line of rl) {
    if (isHeader) {
      isHeader = false;
      continue;
    }
    if (!line.trim()) continue;

    // Parse CSV line with proper quote handling
    const fields = parseCSVLine(line);
    if (fields.length >= 7) {
      rows.push({
        id: fields[0],
        modo: fields[1],
        categoria: fields[2],
        nivel: parseInt(fields[3]),
        tipo: fields[4],
        quem: fields[5],
        conteudo: fields[6],
      });
    }
  }
  return rows;
}

function parseCSVLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += c;
    }
  }
  fields.push(current);
  return fields;
}

async function main() {
  console.log("Parsing CSV...");
  const rows = await parseCSV(csvPath);
  console.log(`Parsed ${rows.length} rows`);

  // We need service role key to bypass RLS. Let's check if it's available.
  // Since we're importing in a script, let's temporarily disable RLS for items
  // Actually, we already have the SQL files. Let's just report this script needs service role.

  // For now, let's generate a SQL file that can be run via psql or the MCP tool
  const batchSize = 50;
  const batches = [];
  for (let i = 0; i < rows.length; i += batchSize) {
    batches.push(rows.slice(i, i + batchSize));
  }

  console.log(`Will insert ${rows.length} rows in ${batches.length} batches of ${batchSize}`);

  // Try inserting via Supabase client (needs auth or service role)
  // Since items are public read-only via RLS, we need service role for insert
  // The plan mentions importing via SQL migration - that's the right approach

  // Output the first few rows to verify parsing
  console.log("First row sample:", JSON.stringify(rows[0], null, 2));
  console.log("Last row sample:", JSON.stringify(rows[rows.length - 1], null, 2));

  // Check for any rows with parsing issues
  const invalid = rows.filter(r => !r.id || !r.modo || isNaN(r.nivel));
  if (invalid.length > 0) {
    console.error("Invalid rows:", invalid.slice(0, 5));
  } else {
    console.log("All rows parsed successfully!");
  }
}

main().catch(console.error);
