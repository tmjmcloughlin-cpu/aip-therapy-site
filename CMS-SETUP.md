# CMS Setup (Decap)

This site now includes a Decap CMS scaffold at `/admin`.

## 1) Enable GitHub OAuth for Decap
- You need a Decap-compatible OAuth flow (Netlify Identity, or standalone GitHub OAuth proxy).
- For easiest setup, deploy on Netlify with Identity enabled.

## 2) Current content model
- `content/site/settings.md`
- `content/pages/*.md`
- `content/services/*.md`
- `content/faq/*.md`
- `content/blog/*.md`

## 3) Important
This repo currently serves static HTML pages directly. The CMS content model is now in place; next step is wiring templates/render pipeline so HTML outputs are generated from `content/*`.
