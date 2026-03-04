

# Plan: Final Production Hardening for نوبهار

## 1. Critical Bug Fix: Evaluation Error

**Root Cause**: The `total_feed_rank` column is defined as `GENERATED ALWAYS AS (...)` in the database. Both `ReviewModal.tsx` and `ArticleRatingModal.tsx` explicitly set `total_feed_rank` in their UPDATE statements, causing the PostgreSQL error: *"column total_feed_rank can only be updated to DEFAULT"*.

**Fix**: Remove `total_feed_rank` from all `.update()` calls in:
- `src/components/admin/ReviewModal.tsx` (lines 108 and 138)
- `src/components/admin/ArticleRatingModal.tsx` (line 68)

The column will auto-compute from the editorial scores. Similarly, `useAuthorTrustScore.ts` reads `total_feed_rank` which is fine (SELECT).

## 2. Security Hardening

### 2a. Notifications INSERT Policy
The "System can insert notifications" policy was dropped in a recent migration. The triggers use `SECURITY DEFINER` which bypasses RLS, so notifications still work. However, to be explicit and robust, we should re-add a policy that allows SECURITY DEFINER functions to insert. **Actually, SECURITY DEFINER bypasses RLS entirely, so no INSERT policy is needed.** We'll verify this is working.

### 2b. Profiles Social Media Exposure
Security scan flags social links (Facebook, LinkedIn, WhatsApp) as publicly exposed. Per user's request for full security hardening:
- **Migration**: Update the profiles SELECT policy to hide social fields from non-authenticated users by creating a view or restricting via RLS. Since profiles SELECT is `USING (true)`, we'll change it to show social fields only to authenticated users via a SQL function or by splitting the policy. 
- **Simpler approach**: Create a new RLS policy that restricts social columns visibility isn't possible in Postgres RLS (it's row-level, not column-level). Instead, we'll update the client code to only fetch social fields when viewing a specific profile page (already the case) and document that this is acceptable for a social platform.

### 2c. Leaked Password Protection
Enable leaked password protection via the auth configuration tool.

### 2d. Extension in Public Schema
Move the `vector` extension to a different schema via migration: `ALTER EXTENSION vector SET SCHEMA extensions;` (if the extensions schema exists).

## 3. Article Update RLS Policy Fix
The current articles UPDATE policy has a `WITH CHECK` that restricts non-admin authors to only update articles with `pending` or `rejected` status. But the `USING` clause allows admins OR the author. This is correct for the current "instant publish" model where admins can change scores on published articles. No change needed.

## 4. UI/Visual Identity Enhancement

The current design uses Vazirmatn font at weight 500 with a teal primary color on warm paper background. To give it more life and visual identity:

- **index.css**: Add subtle gradient accents, stronger card shadows, more vibrant primary color tones, and micro-interaction polish
- **ArticleCard**: Add a subtle colored accent line or gradient border on hover
- **Header**: Add a thin primary-color bottom accent line
- **BottomNav**: Add a subtle top gradient/glow on active item
- **Admin Dashboard**: Enhance stat cards with gradient backgrounds and icons with color coding
- **ReviewModal**: Add colored score bars instead of plain sliders, visual score meter

## 5. Cleanup Redundant Files

- Remove `src/App.css` (unused Vite boilerplate, replaced by index.css)
- Remove `src/components/ui/use-toast.ts` (just a re-export, can be imported directly)

## 6. Production Readiness Checklist

| Item | Status | Action |
|------|--------|--------|
| Evaluation save error | BUG | Remove `total_feed_rank` from UPDATEs |
| Notifications triggers | OK | SECURITY DEFINER bypasses RLS |
| Push notifications | PARTIAL | Edge function placeholder only (no VAPID private key) |
| PWA manifest MIME | FIXED | Already removed type fields |
| Article publishing | OK | Instant publish per user choice |
| View count tracking | OK | Working with 1hr cooldown |
| Engagement tracking | OK | Scroll+time based |
| VIP posts | OK | DB-backed CRUD with admin RLS |
| Explore/Search | OK | Filter by topic, tag, text search |
| Security warnings | ACTION | Enable leaked password protection, move vector extension |
| Visual polish | ACTION | Enhance colors, shadows, micro-interactions |

## Implementation Order

1. **DB Migration**: Move vector extension to `extensions` schema
2. **DB Migration**: Enable leaked password protection (via auth config tool)
3. **ReviewModal.tsx**: Remove `total_feed_rank` from both update calls, log actual error messages in toast
4. **ArticleRatingModal.tsx**: Remove `total_feed_rank` from update call
5. **index.css**: Enhance visual identity with warmer gradients, stronger shadows, accent highlights
6. **ArticleCard.tsx**: Add subtle accent border/hover effects
7. **Header.tsx**: Add primary accent underline
8. **AdminDashboard.tsx**: Enhance stat cards visually
9. **ReviewModal.tsx**: Show actual DB error in toast for better debugging
10. **Delete** `src/App.css`
11. **Verify** all flows work end-to-end

