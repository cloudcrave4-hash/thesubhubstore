#!/usr/bin/env node

/**
 * Build script to inject environment variables into HTML.
 * Values used by browser code are still public after deploy.
 * Keep real secrets server-side only.
 */

const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "../index.html");
let html = fs.readFileSync(indexPath, "utf8");

const replacements = {
  "%ADMIN_PASSWORD%": process.env.ADMIN_PASSWORD || "admin555",
  "%PUBLIC_STORE_EMAIL%": process.env.PUBLIC_STORE_EMAIL || "theshubhub@gmail.com",
  "%PUBLIC_FORMSUBMIT_URL%": process.env.PUBLIC_FORMSUBMIT_URL || "https://formsubmit.co/theshubhub@gmail.com",
  "%PUBLIC_SUPABASE_URL%": process.env.PUBLIC_SUPABASE_URL || "https://rfnfjuwuzihjxgamnyou.supabase.co",
  "%PUBLIC_SUPABASE_PUBLISHABLE_KEY%": process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || ""
};

for (const [token, value] of Object.entries(replacements)) {
  const pattern = new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
  html = html.replace(pattern, value);
}

fs.writeFileSync(indexPath, html, "utf8");

console.log("Injected environment variables into index.html");
console.log(`  - ADMIN_PASSWORD: ${process.env.ADMIN_PASSWORD ? "***" : "not set"}`);
console.log(`  - PUBLIC_STORE_EMAIL: ${process.env.PUBLIC_STORE_EMAIL || "default used"}`);
console.log(`  - PUBLIC_FORMSUBMIT_URL: ${process.env.PUBLIC_FORMSUBMIT_URL || "default used"}`);
console.log(`  - PUBLIC_SUPABASE_URL: ${process.env.PUBLIC_SUPABASE_URL || "default used"}`);
console.log(`  - PUBLIC_SUPABASE_PUBLISHABLE_KEY: ${process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ? "set" : "default/empty"}`);
