## Site architecture

Static site. Single-page-per-concern layout at the root.

**Tour data flow:** `_data/tours.json` → `tours-render.js` → `#tours-container` in `tours.html`. Tours render dynamically via fetch. A static fallback (`#tours-static`, `display:none`) shows if fetch fails.

**Critical:** When previewing via `file://` protocol (opening HTML directly in browser), `fetch()` fails silently and the static fallback renders. Always ensure static fallback articles have matching `id` attributes (e.g. `id="sit-low-sightseeing"`) so anchor links work in both modes. Preview properly using a local server (`npx serve .`) to test dynamic rendering.

**Pending pricing confirmation (as of 2026-05-09):** Do not change Sit-Low Sightseeing private price ($150) or Eat Like a Local private price ($450) until confirmed with Karenda Swain-Rolle on Monday 2026-05-11. Discrepancy exists between tours.json and her email templates.

## Target customer

Cruise ship day-tripper. 2–3 hours on the island. First time in the Bahamas. Reading on their phone, possibly on the ship deck. Primary anxiety: making it back before the ship leaves. Primary desire: authentic local experience, not a tourist trap. Decisions driven by clear logistics, transparent pricing, and social proof. Design for this person — not for what Karenda thinks looks good.

## Key contacts

- **Max Rolle** — owner, runs the tours
- **Karenda Swain-Rolle** — day-to-day operator, buyer, website approver. Indecisive — needs decisive recommendations, not options. Seventh Day Adventist (Friday = non-working). Email-first. Zoho Mail + Zoho Calendar is her stack.

## Agent skills

### Issue tracker

GitHub Issues at kwmlamar/bimini-island-tours. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical labels (needs-triage, ready-for-agent, etc). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout at the root. See `docs/agents/domain.md`.
