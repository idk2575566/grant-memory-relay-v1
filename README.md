# Grant Memory Relay v1

A polished UI-only prototype for fast note capture and daily follow-through.

## Features

- ⚡ Quick capture form (note, optional due date, category, priority)
- 🎯 One-click category CTA buttons that auto-apply default priority (Kids=high, Work=medium, etc.)
- 📋 Open notes list sorted by due date then priority
- ✅ Note actions: Add to Calendar, Done, Snooze (+1 day), Delete
- 🌅 Morning top-3 preview (simulated from open notes)
- 🌙 Daily digest preview (simulated)
- 📱 Mobile-friendly responsive layout
- 💾 Local-only persistence via `localStorage`
- 🔔 Toast confirmations + clear empty states

## Google Calendar quick-add behavior

Each open note includes an **Add to Calendar** button that opens Google Calendar's event template page in a new tab using URL parameters only (no OAuth required).

- `text` is prefilled from the note text.
- `details` includes category + priority context.
- If a due date exists, `dates` is sent as an all-day range (`due` to `due + 1 day`) so it lands on the expected day.

## Run locally

No build step needed.

### Option 1: Open directly
Open `index.html` in your browser.

### Option 2: Use a tiny local server (recommended)
```bash
cd grant-memory-relay
python3 -m http.server 8080
# then open http://localhost:8080
```

## Data model (local)

Notes are stored under localStorage key:

`grant-memory-relay-v1-notes`

Each note has:

```json
{
  "id": "uuid",
  "text": "string",
  "due": "YYYY-MM-DD|null",
  "category": "string",
  "priority": "high|medium|low",
  "done": false,
  "createdAt": 0
}
```

## Smoke test

A basic Playwright smoke test was run for:
- page load
- zero console errors
