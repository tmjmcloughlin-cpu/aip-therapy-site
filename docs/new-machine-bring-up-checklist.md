# New Machine Bring-Up Checklist (Joi)

## Goal
Get OpenClaw stable fast, with one reliable channel and clean memory/ops discipline.

---

## 0) Pre-flight
- [ ] Confirm machine type: VPS / Mac mini / local dev
- [ ] Confirm timezone and owner contact numbers
- [ ] Confirm OpenClaw installed

---

## 1) Gateway health first
- [ ] Run `openclaw status`
- [ ] Run `openclaw gateway status`
- [ ] If down: `openclaw gateway start` then re-check status

Exit criteria: gateway healthy.

---

## 2) Minimal config baseline
- [ ] Use valid model IDs (not informal names) for primary/fallbacks
- [ ] Enable only one required channel/plugin initially
- [ ] Keep non-essential plugins disabled
- [ ] Save config and restart gateway
- [ ] Re-check `openclaw gateway status`

Exit criteria: no boot errors, one channel stable.

---

## 3) Workspace + memory scaffold
- [ ] Ensure files exist: `AGENTS.md`, `SOUL.md`, `USER.md`, `IDENTITY.md`, `TOOLS.md`, `HEARTBEAT.md`, `MEMORY.md`
- [ ] Ensure `memory/` exists
- [ ] Create `memory/people.md`, `memory/decisions.md`, `memory/projects-status.md`
- [ ] Create today’s log `memory/YYYY-MM-DD.md`

Exit criteria: continuity files in place.

---

## 4) Heartbeat + cron discipline
- [ ] Keep `HEARTBEAT.md` intentionally empty unless periodic checks are desired
- [ ] For reminders, create one-shot cron jobs only unless recurrence is intentional
- [ ] Verify no duplicate reminder jobs

If spam occurs:
- [ ] List cron jobs (include disabled)
- [ ] Inspect run history
- [ ] Remove broken/duplicate jobs
- [ ] Recreate clean one-shot reminders

Exit criteria: clean reminder behaviour (no loops).

---

## 5) Credentials and integrations (incremental)
- [ ] Add only required tokens/keys first
- [ ] Never paste secrets into chat logs
- [ ] Validate each integration one-by-one
- [ ] Add optional integrations only after baseline stability

Exit criteria: required integrations working; no broad untested enablement.

---

## 6) First value delivery (within first session)
Choose one:
- [ ] Fix an urgent operational issue (e.g., reminder spam)
- [ ] Produce immediate action checklist in `docs/`
- [ ] Summarise key priorities from recent context
- [ ] Stabilise messaging flow and confirm inbound/outbound working

Exit criteria: one concrete useful outcome delivered.

---

## 7) Closeout
- [ ] Document known-good state in `docs/` (what is enabled, what is pending)
- [ ] Commit workspace updates to git
- [ ] Share concise status: done / pending / blockers

---

## Definition of “Operational”
- Gateway healthy
- One channel stable
- Memory scaffold active
- Reminder system clean
- One tangible user-visible win completed
