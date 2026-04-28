# Secure Deployment Checklist for ThesHubHub

Use this checklist before and after deploying to production.

## Pre-Deployment Security Review

### Code & Secrets
- [ ] No secrets in `script.js` (only public keys)
- [ ] No secrets in `index.html` or any HTML files
- [ ] `.env` is in `.gitignore` and not committed
- [ ] `.env.example` exists with blank values (for reference)
- [ ] Run: `git status` to verify no `.env` is staged
- [ ] No console.logs() with sensitive data
- [ ] No comments with passwords or API keys

### Configuration
- [ ] Supabase URL and publishable key verified
- [ ] FormSubmit email is correct (theshubhub@gmail.com)
- [ ] Discord webhook URL is secret in Netlify, not in code
- [ ] SITE_URL in Netlify env matches your domain

### Netlify Environment Setup
Go to **Site Settings → Environment**

Add these environment variables:
```
DISCORD_WEBHOOK_URL = [your Discord webhook]
SITE_URL = https://thesubhubshop.netlify.app
SUPABASE_SERVICE_ROLE_KEY = [from Supabase Settings > API > Service Role]
```

✅ Do NOT add these (they're public):
- PUBLIC_SUPABASE_URL
- PUBLIC_SUPABASE_PUBLISHABLE_KEY
- FORM_SUBMIT_URL

### Supabase Configuration

#### 1. Database & Bucket Security
- [ ] Login to Supabase Dashboard
- [ ] Go to **Authentication → Providers → Email**
  - [ ] Enable "Confirm email"
  - [ ] Set "Auto-confirm new users" to OFF
- [ ] Go to **Storage → payment-screenshots**
  - [ ] **Set bucket to PRIVATE** (not public)
  - [ ] Verify you're using signed URLs for admin downloads

#### 2. Row-Level Security (RLS)
- [ ] Go to **SQL Editor**
- [ ] Run the queries in `supabase-setup.sql`
- [ ] Verify policies are set for `orders` table:
  - [ ] Customers can only see their own orders
  - [ ] Only admin email can see all orders
  - [ ] Only authenticated users can insert orders

#### 3. Admin User
- [ ] Create user with strong password (16+ chars, mixed case, numbers, symbols)
- [ ] Email: `theshubhub@gmail.com`
- [ ] Enable MFA in user settings
- [ ] Store password in secure password manager (NOT in code)

#### 4. API Keys & Permissions
- [ ] Generate new Anon Key if needed (Settings > API > Anon Key)
- [ ] Verify Service Role Key is NOT used in browser code
- [ ] Regenerate keys if ever exposed:
  ```
  Supabase Dashboard > Settings > API > Regenerate
  ```

### Security Headers Verification
- [ ] `netlify.toml` has CSP headers
- [ ] CSP allows:
  - `formsubmit.co` for forms
  - `*.supabase.co` for database
  - Does NOT allow `unsafe-inline` scripts
- [ ] HSTS header enabled (`max-age=31536000`)
- [ ] X-Frame-Options set to `DENY`
- [ ] X-Content-Type-Options set to `nosniff`

### HTTPS & DNS
- [ ] Domain uses HTTPS (Netlify auto-enables)
- [ ] No "mixed content" warnings in browser (F12 > Console)
- [ ] DNS points to Netlify (verify in domain registrar)

## Post-Deployment Verification

### Test in Production
1. **Visit your site:** https://thesubhubshop.netlify.app
   - [ ] Load time is acceptable
   - [ ] No console errors (F12 > Console)
   - [ ] No console warnings about CSP violations

2. **Test customer flow:**
   - [ ] Browse products → works
   - [ ] Select product + add details → works
   - [ ] Upload screenshot → works
   - [ ] Submit order → works
   - [ ] Order appears in "My Orders" → works
   - [ ] Receive email at theshubhub@gmail.com → works

3. **Test admin (if accessible):**
   - [ ] Cannot login with file:// password (should show error)
   - [ ] Can login with Supabase email: theshubhub@gmail.com
   - [ ] Orders appear in admin panel
   - [ ] Can edit/delete orders

4. **Security tests:**
   - [ ] Reload page → admin session cleared (not persistent)
   - [ ] Try to access admin on another browser → requires login
   - [ ] Try to modify payment screenshot URL in browser → fails
   - [ ] View page source → no passwords visible
   - [ ] F12 Network tab → no secrets in requests
   - [ ] F12 Console → no sensitive data logged

### Monitoring

#### Weekly
- [ ] Check Netlify deploy logs for errors
- [ ] Check Supabase logs: **Logs → All Logs** for 401/403 errors
- [ ] Verify Discord notifications are working (if enabled)
- [ ] Check FormSubmit inbox for new orders

#### Monthly
- [ ] Review Supabase audit logs: **Settings → Audit Logs**
- [ ] Verify admin last login date is recent
- [ ] Check for failed login attempts
- [ ] Verify payment screenshot bucket is still private

#### Quarterly
- [ ] Review and update SECURITY.md if needed
- [ ] Check for new Supabase security advisories
- [ ] Review Netlify deploy logs for patterns
- [ ] Test order recovery procedures

## Credential Rotation

### When to Rotate
- [ ] Every 3 months (regular schedule)
- [ ] Immediately if accidentally exposed
- [ ] After team member leaves
- [ ] After security incident

### Supabase Keys Rotation
1. Go to **Settings → API**
2. Click **Regenerate** next to key you want to rotate
3. Copy new key
4. Update in Netlify env variables
5. Redeploy site (Netlify will use new key automatically)
6. Old key remains valid for 24 hours

### Discord Webhook Rotation
1. Go to your Discord Server Settings → Integrations → Webhooks
2. Find ThesHubHub webhook → Delete it
3. Create new webhook
4. Copy new URL
5. Update `DISCORD_WEBHOOK_URL` in Netlify env
6. Redeploy

### Admin Password Change (Supabase)
1. Go to **Authentication → Users**
2. Find `theshubhub@gmail.com`
3. Click **...** → **Reset password**
4. User will receive email with reset link
5. Set new strong password (16+ chars)

## Incident Response

### If You Suspect a Breach

**Immediately:**
1. [ ] Note the time of discovery
2. [ ] Take screenshots of suspicious activity
3. [ ] Do NOT delete any logs
4. [ ] Rotate ALL credentials:
   - Supabase Anon Key + Service Role Key
   - Discord webhook
   - Admin password
5. [ ] Update Netlify environment variables
6. [ ] Redeploy site
7. [ ] Sign out all admin sessions (Supabase > Auth > Sessions)

**Within 24 hours:**
8. [ ] Review Supabase audit logs for unauthorized access
9. [ ] Review Netlify deploy logs
10. [ ] Check for unauthorized orders
11. [ ] Review payment screenshot access logs
12. [ ] Check Discord for duplicate orders/spam
13. [ ] Notify theshubhub@gmail.com email recipients if needed

**Follow-up:**
14. [ ] Document what happened in private notes
15. [ ] Determine if customers need notification
16. [ ] Update security procedures based on incident
17. [ ] Consider adding monitoring alerts

### If Payment Screenshots are Exposed
1. [ ] Immediately make the bucket PRIVATE in Supabase
2. [ ] Regenerate Service Role Key
3. [ ] Delete any compromised images manually
4. [ ] Review bucket access logs
5. [ ] Determine retention period for future screenshots
6. [ ] Consider encrypting screenshots at rest

## Security Contacts

- **Supabase Support:** support@supabase.io (pro/enterprise only)
- **Netlify Support:** https://app.netlify.com/teams/*/sites/*/settings/general
- **Discord Webhooks:** Check webhook logs in Discord
- **FormSubmit Support:** support@formsubmit.co

## Additional Resources

- [OWASP Web App Security](https://owasp.org/www-project-top-ten/)
- [Supabase Security Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Netlify Security](https://docs.netlify.com/security/secure-access-to-sites/)
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
