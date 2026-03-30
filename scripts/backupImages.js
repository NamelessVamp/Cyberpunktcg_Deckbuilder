import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load cards data
const cardsPath = path.join(__dirname, "../src/data/cards.json");
const cardsData = JSON.parse(fs.readFileSync(cardsPath, "utf8"));

// Initialize Supabase (you'll need to set these env vars)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function backupCardImages() {
  console.log("🔄 Starting image backup to Supabase Storage...\n");

  let successful = 0;
  let skipped = 0;
  let failed = 0;
  const failedCards = [];

  for (let i = 0; i < cardsData.length; i++) {
    const card = cardsData[i];
    const progress = `[${i + 1}/${cardsData.length}]`;

    try {
      // Check if already exists in Supabase
      const { data: existingFiles } = await supabase.storage
        .from("card-images")
        .list("", { search: `${card.id}.webp` });

      if (existingFiles && existingFiles.length > 0) {
        console.log(`${progress} ⏭️  ${card.name} - Already backed up`);
        skipped++;
        continue;
      }

      // Download from original URL
      console.log(`${progress} ⬇️  ${card.name} - Downloading...`);
      const response = await fetch(card.image_url, {
        timeout: 10000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const buffer = await response.arrayBuffer();

      // Upload to Supabase
      const { error } = await supabase.storage
        .from("card-images")
        .upload(`${card.id}.webp`, buffer, {
          contentType: "image/webp",
          upsert: false,
        });

      if (error) throw error;

      console.log(`${progress} ✅ ${card.name} - Backed up successfully`);
      successful++;

      // Rate limiting - wait 200ms between uploads
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`${progress} ❌ ${card.name} - Failed: ${error.message}`);
      failed++;
      failedCards.push({
        name: card.name,
        id: card.id,
        error: error.message,
        url: card.image_url.substring(0, 80) + "...", // Truncate for readability
      });
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`📊 BACKUP COMPLETE`);
  console.log(`${"=".repeat(60)}`);
  console.log(`✅ Successfully backed up: ${successful}`);
  console.log(`⏭️  Skipped (already exist): ${skipped}`);
  console.log(`❌ Failed: ${failed}`);

  if (failedCards.length > 0) {
    console.log(`\n⚠️  FAILED CARDS:`);
    failedCards.forEach((card) => {
      console.log(`   - ${card.name} (${card.id}): ${card.error}`);
    });
  }
}

backupCardImages();
