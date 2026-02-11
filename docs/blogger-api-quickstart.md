# Blogger API Quickstart (OpenClaw workspace)

## 1) Google Cloud setup
1. Create/select project in Google Cloud Console.
2. Enable **Blogger API v3**.
3. Configure OAuth consent screen.
4. Create OAuth client (Desktop app).
5. Download client JSON to:
   - `secrets/google-oauth-client.json`

## 2) Get OAuth token once
Use Google OAuth Playground or a one-time local script to generate token with scope:
- `https://www.googleapis.com/auth/blogger`

Save token JSON to:
- `secrets/google-oauth-token.json`

## 3) Install dependency
```bash
cd ~/.openclaw/workspace
npm install googleapis
```

## 4) Publish test draft
```bash
cd ~/.openclaw/workspace
export BLOGGER_BLOG_ID="YOUR_BLOG_ID"
export BLOGGER_POST_TITLE="OpenClaw test post"
export BLOGGER_POST_HTML="<p>Hello from OpenClaw.</p>"
export BLOGGER_IS_DRAFT="true"
node scripts/blogger-publish.mjs
```

If successful, output includes post id + URL.

## 5) Publish live
Set:
```bash
export BLOGGER_IS_DRAFT="false"
```
Then run again.

## Notes
- Keep OAuth files in `secrets/` and out of chat.
- If token expires/revoked, refresh token flow and replace token JSON.
