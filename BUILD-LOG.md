# AIP Therapy Site — Running Build Log

_Last updated: 2026-02-17 09:44 GMT_

## 1) Current repo status
- Branch: `main` (tracking `origin/main`)
- Git state: clean working tree
- Commit state: **ahead by 4 commits**
- Latest commit: `4dae455` — GBP-aligned service cards, local areas content, FAQ schema-ready sections, conversion tracking plan page

## 2) Pages updated (recently, from latest commits)
- `index.html`
- `location-derby.html`
- `contact.html`
- `about-james-harris.html`
- `blog.html`
- `fees-faq.html`
- `tracking-plan.html`
- `anger-management-therapy-derby.html`
- `smoking-cessation-hypnotherapy-derby.html`
- `trauma-therapy-derby.html`
- `styles.css`

## 3) Pending placeholders (priority tracking)
### Phone (PENDING)
- Current placeholder used sitewide: `+447000000000`
- Seen in nav/header and CTA links across core/service pages (`tel:` links)

### WhatsApp (PENDING)
- Current placeholder used sitewide: `https://wa.me/447000000000`
- Seen in nav/header and CTA links across core/service pages

### Book title (PENDING)
- File: `about-james-harris.html`
- Current text: `[Insert exact book title]`

### Qualifications (PENDING DETAIL)
- File: `about-james-harris.html`
- Current note: `Add exact awarding bodies + registration details.`
- Need final, claim-safe credential wording

## 4) Other visible content placeholders (non-core)
- `location-derby.html`: `[Insert full address]`, parking/station placeholders
- Multiple pages: image placeholders (`Add ... image`)

## 5) Next 3 highest-leverage actions
1. **Replace global contact placeholders in one pass**
   - Update all `tel:+447000000000` and `wa.me/447000000000`
   - Validate click-to-call + WhatsApp deep links on mobile
2. **Finalize trust-critical bio content**
   - Insert exact book title and verified qualification/registration details on `about-james-harris.html`
   - Keep phrasing compliant and specific
3. **Push conversion readiness to done**
   - Connect `contact.html` form endpoint (Wix/email capture)
   - Implement GA4 events in live build (`call_click`, `whatsapp_click`, `form_submit`, `booking_click`, `maps_click`)

## 6) Today’s execution checklist (proposed)
- [ ] Confirm canonical phone number format (E.164) and WhatsApp destination
- [ ] Bulk replace contact placeholders across all pages
- [ ] QA all CTA links (desktop + mobile)
- [ ] Finalize and insert book title
- [ ] Finalize and insert qualification/registration lines
- [ ] Fill location details (full address, parking, nearest station)
- [ ] Replace top-priority image placeholders (home, location, 2 service pages)
- [ ] Hook form submission in Wix and test successful send
- [ ] Implement GA4 events from `tracking-plan.html`
- [ ] Prepare commit + deployment note
