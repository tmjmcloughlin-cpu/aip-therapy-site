# ACCESS.md

Purpose: single source of truth for what access is configured vs what is live right now.
Last updated: 2026-02-19 (Europe/London)

## How to use this file

- **Configured** = credentials/integration exists in workspace or OpenClaw config.
- **Live now** = currently reachable in this session (can still fail if token expired, browser tab not attached, etc.).
- Run `bash tools/verify-access.sh` for a current status check.

---

## 1) Messaging channels (OpenClaw)

### Telegram
- Configured: **Yes**
- Live now: **Yes** (status OK in `openclaw status`)
- Notes: multiple Telegram accounts/sessions exist.

### WhatsApp
- Configured: **Yes**
- Live now: **Yes** (status OK, linked +447704155198)
- Notes: connection can drop/reconnect; verify before critical sends.

### Webchat
- Configured: **Yes**
- Live now: **Yes** (this current session)

---

## 2) Blogger access

### Blogger OAuth API (direct draft creation)
- Configured: **Yes**
- Evidence in workspace:
  - `tools/blogger/create-draft.js`
  - `tools/blogger/.env`
  - `tools/blogger/credentials.json`
  - `tools/blogger/token.json`
- Live now: **Likely yes**, but must be verified by test run.
- Verification command:
  - `node tools/blogger/create-draft.js "Access check (safe to delete)" "<p>Access verification draft.</p>"`
- Notes:
  - This route does **not** require browser relay.
  - Keep credentials/token private and never paste into chat.

### Blogger via Browser Relay (interactive)
- Configured: **Session-dependent**
- Live now: **No attached tab currently**
- Requirement: Chrome Relay tab attached + logged-in Blogger tab.

---

## 3) GitHub access

### Local git repo editing
- Configured: **Yes**
- Live now: **Yes** (workspace repo available)

### GitHub push/auth (remote)
- Configured: **Unknown from this check**
- Live now: **Unknown** until remote/auth test is run
- Verification command:
  - `git remote -v`
  - `git ls-remote --heads origin`

---

## 4) Web tools

### Web fetch/search/browser automation
- Configured: **Yes** (OpenClaw tools available)
- Live now: **Partially**
  - Web fetch/search tools available in runtime
  - Chrome Relay currently not attached

---

## 5) Known reliability caveats

- Memory semantic recall (`memory_search`) has recently failed due API quota; do not rely on it as sole source of truth.
- Browser relay state is temporary and may be disconnected between sessions.
- OAuth integrations may exist and work even when browser relay is unavailable.

---

## Session startup checklist (must run)

1. `bash tools/verify-access.sh`
2. Confirm channels: Telegram/WhatsApp state
3. Confirm Blogger route:
   - API route (OAuth script) OR
   - Browser relay tab attached
4. Confirm GitHub remote/auth if repo push is requested
5. If any check fails, report **what is configured vs what is currently live** clearly.
