#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "== OpenClaw channel status =="
openclaw status | sed -n '/^Channels/,/^Sessions/p' || true

echo
echo "== Browser relay (chrome profile) =="
openclaw browser status --profile chrome 2>/dev/null || echo "browser status command unavailable via CLI"
openclaw browser tabs --profile chrome 2>/dev/null || echo "browser tabs command unavailable via CLI"

echo
echo "== Blogger OAuth files =="
for f in tools/blogger/.env tools/blogger/credentials.json tools/blogger/token.json tools/blogger/create-draft.js; do
  if [[ -f "$f" ]]; then
    echo "OK  $f"
  else
    echo "MISS $f"
  fi
done

echo
echo "== Git remote/auth quick check =="
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git remote -v || true
  git ls-remote --heads origin >/dev/null 2>&1 && echo "origin reachable" || echo "origin unreachable (or not configured/auth issue)"
else
  echo "Not inside a git repo"
fi

echo
echo "== Done =="
echo "If Blogger OAuth files exist, direct draft posting should be available via:"
echo "  node tools/blogger/create-draft.js \"Access check\" \"<p>Draft.</p>\""
