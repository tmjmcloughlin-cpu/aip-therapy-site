# Blogger automation (OpenClaw)

This folder contains a small CLI to authorise with Google and create Blogger posts via the Blogger API.

## Files
- `auth.js` — one-time OAuth flow; stores tokens locally.
- `post.js` — create draft posts (default) or publish.
- `.env.example` — config template.

## Quick start
1) Create Google Cloud OAuth **Desktop app** credentials and download JSON.
2) Save JSON to: `tools/blogger/credentials.json`
3) Copy env:

```bash
cp tools/blogger/.env.example tools/blogger/.env
```

4) Authorise once:

```bash
node tools/blogger/auth.js
```

5) Create a draft post:

```bash
node tools/blogger/post.js --title "Test" --htmlFile tools/blogger/sample-post.html
```
