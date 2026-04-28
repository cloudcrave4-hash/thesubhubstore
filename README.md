# ThesHubHub Digital Store

A single-page static HTML/CSS/JS digital product store for ThesHubHub.

## Included

- PUBG UC, MLBB Diamonds, Spotify, Netflix, Discord Nitro, and Steam Giftcard products
- Codashop-style dark product grid with original CSS logo-style artwork
- Buy Now checkout with category/product auto-selection
- Conditional PUBG UID and MLBB ID/Region validation
- Payment screenshot upload sent through FormSubmit
- My Orders page with search and status tabs
- Admin panel for products, payment settings, QR upload, and orders
- Supabase order sync for cloud-backed checkout and admin order management
- Netlify Forms capture for viewing order submissions in the Netlify dashboard after deploy
- Optional Discord order alerts through a Netlify Function webhook relay
- Console smoke tests for rendering, checkout, admin edit/remove, validation, and orders

## Admin

Admin now uses a password-only system:

```text
admin123
```

Product edits and hidden cards still live in this browser with localStorage.

Orders now try to sync to Supabase first and also stay cached in the browser so My Orders can still show the customer's own history on the same device.

Payment settings and the QR image now try to sync to Supabase too, so when admin updates them they can appear for customers on other devices.

## FormSubmit

Orders submit to:

```text
https://formsubmit.co/theshubhub@gmail.com
```

FormSubmit may require first-time email activation. If an email does not arrive, check Spam/Promotions and click the FormSubmit activation email.

## Supabase

Frontend is wired to:

```text
https://rfnfjuwuzihjxgamnyou.supabase.co
```

with the provided publishable key in [script.js](C:/Users/Lenevo/Documents/Codex/2026-04-26/can-you-make-website-publish/script.js).

Before cloud orders will work, run the SQL in [supabase-setup.sql](C:/Users/Lenevo/Documents/Codex/2026-04-26/can-you-make-website-publish/supabase-setup.sql) inside the Supabase SQL Editor. That file creates:

- `orders` table
- `store_settings` table
- `payment-screenshots` storage bucket
- `store-assets` storage bucket for the payment QR image
- public anon policies needed by this frontend-only build

Important: re-run the SQL in [supabase-setup.sql](C:/Users/Lenevo/Documents/Codex/2026-04-26/can-you-make-website-publish/supabase-setup.sql). It now matches the password-only admin flow again, which is easier to use but less secure than a real authenticated backend.

## Environment Config

Use [.env.example](C:/Users/Lenevo/Documents/Codex/2026-04-26/can-you-make-website-publish/thesubhubstore/.env.example) as your template for Vercel or Netlify environment variables.

Important:

- `DISCORD_WEBHOOK_URL` and `SITE_URL` are proper server-side env values.
- `ADMIN_PASSWORD` is injected into browser code at build time, so it is not truly secret on a public static site.
- `PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `PUBLIC_SUPABASE_URL`, `PUBLIC_STORE_EMAIL`, and `PUBLIC_FORMSUBMIT_URL` are public config values, not secrets.

Latest update: Vercel now uses `api/discord-order.js` for Discord alerts.

## Publish

Upload these files to any static host, such as Netlify Drop, Vercel, or GitHub Pages:

- `index.html`
- `styles.css`
- `script.js`

## Netlify

The checkout form now includes Netlify Forms detection and a JavaScript submit path for deployed sites.

Environment templates added:

- [.env.example](C:/Users/Lenevo/Documents/Codex/2026-04-26/can-you-make-website-publish/.env.example) for Netlify/server-side variables
- [site-config.local.example.js](C:/Users/Lenevo/Documents/Codex/2026-04-26/can-you-make-website-publish/site-config.local.example.js) for optional local preview config

Use real values in your Netlify environment settings or in a local untracked copy such as `site-config.local.js`. Do not commit real secrets.

After you deploy this folder to Netlify:

1. Open your site in the Netlify dashboard.
2. Go to `Forms`.
3. Enable form detection if Netlify asks for it.
4. Submit a real test order from the deployed site.
5. View submissions under the `theshubhub-orders` form.

Local `file://` preview does not send orders to Netlify. Netlify capture starts only after the site is deployed on Netlify over `https`.

This Netlify flow keeps your existing Supabase sync and FormSubmit email path. On deploy, one checkout can now:

- save in the browser
- sync to Supabase
- send to FormSubmit email
- appear in Netlify Forms submissions

## Discord Alerts

Discord alerts are now wired through a Netlify Function:

- function file: [netlify/functions/discord-order.js](C:/Users/Lenevo/Documents/Codex/2026-04-26/can-you-make-website-publish/netlify/functions/discord-order.js)
- frontend trigger: [script.js](C:/Users/Lenevo/Documents/Codex/2026-04-26/can-you-make-website-publish/script.js)

To turn it on safely:

1. Create a Discord webhook for your admin channel.
2. In Netlify, open `Site configuration -> Environment variables`.
3. Add `DISCORD_WEBHOOK_URL` with the webhook URL.
4. Add `SITE_URL` with your live site URL, for example `https://thesubhubshop.netlify.app`.
5. Make sure the variables scope includes `Functions`.
6. Redeploy the site.

After that, new orders placed on the deployed site will send a Discord message to that channel.

Important:

- Do not put the Discord webhook URL into frontend code.
- The Discord function now rejects requests from the wrong browser origin when `SITE_URL` is set.
- Local `file://` preview does not call the Netlify function.
- This setup protects the webhook better than frontend code, but it is still a simple public-site relay. If you want stronger anti-spam protection later, the next step is to verify orders server-side before sending the Discord message.

Never expose a Supabase `service_role` key in frontend code.
