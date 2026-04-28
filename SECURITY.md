# Security Policy for ThesHubHub Digital Store

## Overview
This document outlines security best practices and requirements for maintaining ThesHubHub's digital store.

## Secrets Management

### Environment Variables
**Never commit secrets to Git.** All sensitive values must be in `.env` (local) or Netlify secrets (production):

```
DISCORD_WEBHOOK_URL=<your-webhook>
SUPABASE_ANON_KEY=<public-key>
SUPABASE_SERVICE_ROLE_KEY=<secret-key>
SITE_URL=<your-netlify-domain>
```

### What's PUBLIC (safe in browser code)
- Supabase publishable key (`sb_publishable_*`)
- Store email (theshubhub@gmail.com)
- FormSubmit endpoint

### What's SECRET (never expose)
- Supabase service role key
- Discord webhook URL
- Admin credentials
- Database passwords

## Admin Authentication

### Current Implementation
- Uses password-only admin with build-time config injection
- Current deployed fallback password: `admin555`
- All admin data still depends on frontend trust, so this is convenient but not high-security

### To Enhance Further
1. **Enable MFA** in Supabase settings
2. **Use strong passwords** (minimum 16 characters)
3. **Rotate credentials regularly** (every 3 months)
4. **Limit admin access** by IP if possible

## Data Protection

### Payment Screenshots
- Uploaded to Supabase `payment-screenshots` bucket
- **Set bucket to private** - customers cannot list or view others' uploads
- Use signed URLs with 24-hour expiration for admin viewing
- Delete after order processing (recommended 30-day retention)

### Customer Orders
- Stored in Supabase `orders` table
- Contains: name, email, phone, product, UID/ID/region fields
- Implement column-level security in Supabase RLS if processing payment screenshots

### Local Browser Storage
- Contains user's own orders only (customer cannot see others)
- No payment data stored locally
- LocalStorage data is NOT encrypted - consider IndexedDB + encryption for future versions

## API Security

### CORS & Origin Validation
- ✅ CSP header restricts script sources
- ✅ Discord function validates origin
- ✅ FormSubmit whitelist configured

### Rate Limiting
⚠️ **Not currently implemented** - recommended:
- Discord function: 1 webhook per 2 seconds
- Supabase: Use Netlify edge functions to add rate limiting

### Input Validation
- ✅ PUBG UID: 1-10 digits
- ✅ MLBB ID: numbers only
- ✅ Email: basic validation
- ✅ HTML sanitization in Discord embeds

## Content Security Policy (CSP)

Current headers in `netlify.toml`:
```
default-src 'self'
script-src 'self' https://cdn.jsdelivr.net
connect-src https://formsubmit.co, https://*.supabase.co
```

✅ Blocks inline scripts
✅ Blocks unsafe eval
✅ Restricts external domains

## HTTPS & Transport

- ✅ Automatic HTTPS on Netlify
- ✅ HSTS header enabled (1 year)
- ✅ Redirect HTTP → HTTPS

## Dependency Security

### Current Dependencies
- None in package.json (pure HTML/CSS/JS)
- CDN: `https://cdn.jsdelivr.net` (verified HTTPS)

**Monitor for:**
- Deprecated APIs
- Browser compatibility issues
- CDN availability

## Incident Response

### If Secrets are Leaked
1. **Immediately rotate in Supabase/Netlify**
2. **Invalidate Supabase RLS tokens** (sign out all admins)
3. **Regenerate Discord webhook URL**
4. **Review Supabase audit logs**
5. **Check for unauthorized orders in database**

### If Payment Screenshots are Compromised
1. **Secure the Supabase bucket** (make private)
2. **Invalidate signed URLs** by changing service role key
3. **Review access logs in Supabase**
4. **Delete old screenshots**

## Deployment Checklist

Before going live, verify:

- [ ] `.env` file is in `.gitignore`
- [ ] All secrets in Netlify environment variables
- [ ] Admin user has strong password (16+ chars, mixed case, numbers, symbols)
- [ ] Supabase RLS policies configured correctly
- [ ] Payment screenshot bucket is PRIVATE
- [ ] CORS headers are restrictive
- [ ] CSP policy is in place
- [ ] No console.logs with sensitive data
- [ ] FormSubmit email is correct
- [ ] Discord webhook is active (if using)

## Testing

### Local Development
```bash
# Use site-config.local.example.js
# Set publishableKey to a test Supabase key
# Use localhost:3000 or file:// for testing
```

### Production Validation
- [ ] CSP headers present (F12 → Network)
- [ ] No mixed content warnings
- [ ] HTTPS enforced
- [ ] Supabase logs clean (no 401/403 errors for customers)

## Continuous Monitoring

- [ ] Monthly: Review Supabase audit logs for admin access
- [ ] Monthly: Check FormSubmit inbox for spam
- [ ] Quarterly: Update CSP policy based on new features
- [ ] Quarterly: Verify secrets are still secure (never commit)
- [ ] Annually: Review and update this policy

## References

- [Supabase Security Best Practices](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Netlify Security](https://docs.netlify.com/security/secure-access-to-sites/)
