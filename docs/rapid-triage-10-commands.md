# Rapid Triage (2 minutes) — 10 Commands

Use this when OpenClaw feels broken and you need a fast pass/fail diagnosis.

## Commands

1. `openclaw status`
2. `openclaw gateway status`
3. `openclaw gateway restart`
4. `openclaw gateway status`
5. `openclaw help`
6. `openclaw gateway --help`
7. `git -C ~/.openclaw/workspace status --short`
8. `ls -1 ~/.openclaw/workspace | head`
9. `ls -1 ~/.openclaw/workspace/memory 2>/dev/null | tail`
10. `date -u`

---

## Pass / Fail Checks

- **PASS** if:
  - gateway reports healthy/running,
  - commands return without crashes,
  - workspace + memory paths exist.

- **FAIL** if any of these occur:
  - gateway won’t start/restart,
  - repeated auth/plugin/model errors on status,
  - missing workspace or memory directories.

---

## If FAIL, immediate next actions

1. Reduce config to minimal (one channel, valid model ID, non-essential plugins off).
2. Restart gateway and re-check status.
3. Check cron reminders for loops; remove broken jobs.
4. Re-enable integrations one-by-one only after baseline stability.

---

## Minimum “Back to Green” Definition

- Gateway running
- One channel stable
- No reminder spam
- Memory files present (`MEMORY.md`, `memory/YYYY-MM-DD.md`)
