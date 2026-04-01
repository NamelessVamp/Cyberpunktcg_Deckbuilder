import "dotenv/config";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load cards data
const cardsPath = path.join(__dirname, "../src/data/cards.json");
const cardsData = JSON.parse(fs.readFileSync(cardsPath, "utf8"));

async function checkImageHealth() {
  console.log("🔍 Checking image health for all cards...\n");

  const broken = [];
  let healthy = 0;

  for (let i = 0; i < cardsData.length; i++) {
    const card = cardsData[i];
    const progress = `[${i + 1}/${cardsData.length}]`;

    try {
      const response = await fetch(card.image_url, {
        method: "HEAD",
        timeout: 5000,
      });

      if (!response.ok) {
        console.log(`${progress} ❌ ${card.name} - HTTP ${response.status}`);
        broken.push({
          id: card.id,
          name: card.name,
          url: card.image_url,
          status: response.status,
        });
      } else {
        console.log(`${progress} ✅ ${card.name}`);
        healthy++;
      }

      // Rate limiting - wait 100ms between checks
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.log(`${progress} ❌ ${card.name} - ${error.message}`);
      broken.push({
        id: card.id,
        name: card.name,
        url: card.image_url,
        error: error.message,
      });
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`📊 HEALTH CHECK COMPLETE`);
  console.log(`${"=".repeat(60)}`);
  console.log(`✅ Healthy images: ${healthy}`);
  console.log(`❌ Broken images: ${broken.length}`);

  if (broken.length > 0) {
    console.log(`\n⚠️  BROKEN IMAGES DETAILS:`);
    console.table(broken);

    // Save to file
    const reportPath = path.join(__dirname, "../broken-images-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(broken, null, 2));
    console.log(`\n💾 Full report saved to: broken-images-report.json`);
  } else {
    console.log(`\n🎉 All images are healthy!`);
  }

  return broken;
}

checkImageHealth();

//para correr el comando usa node scripts/checkImageHealth.js
