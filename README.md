# Xplore Soweto — Admin

Content admin for the Xplore Soweto app. React 19 + Vite + **Tailwind CSS v4** (no UI library) + Firebase.

```bash
npm install
cp .env.example .env   # optional – falls back to the project's existing Firebase config
npm run dev
```

## Structure — 5 pages, everything else is tabs

| Page | Tabs |
|---|---|
| **Overview** | live counts, shortcuts |
| **Places** | Restaurants · Accommodation · Recreation · Attractions · Business · Healthcare · Public services · Emergency |
| **Soweto** | Hero image · Townships · Featured card · Xplore menu |
| **Community** | News · Events · Announcements |
| **Transport** | All · Bus · Train · Taxi (+ any new mode found in the data) |
| **Admin** | Users (super admin only) · My profile |

The active tab is stored in the URL (`?tab=`), so refresh/back/links work.

## How it's built

- `src/lib/schemas.js` — one schema per Firestore collection (fields, types, defaults). **Add or change a field here and the list, search and edit form update automatically.**
- `src/components/CollectionManager.jsx` — generic list / search / filter / create / edit / delete for any schema.
- `src/components/SchemaForm.jsx` — renders a schema (+ `buildPayload` to clean values before saving).
- `src/components/fields.jsx` — string lists, object lists, image uploader, map picker, gradient picker.
- `src/components/ui.jsx` — Button, Input, Modal, Tabs, Toasts, … (Tailwind only).

## Dynamic content

- **Townships** → `homescreen` docs with `type: "township"` (history, legends, landmarks, facts, colours, aliases). On the Townships tab use **Import built-in townships** once to load the 8 that used to be hard-coded in the app.
- **Transport** → `transport` docs. Use **Load sample routes** once on an empty collection.
- **Hero image** → `homescreen/hero`; **News** → `news`; **Events** → `events`; **Announcements** → `announcements` (pinned, typed, optional start/expiry window).
- Toggle **Active** on any item to hide it from the app without deleting it.

## Auth

`admin/{uid}` = super admin · `useradmin/{uid}` with `isActive: true` = approved admin. Everyone else is bounced to `/login`.
> The UI check is not security — enforce the same rules in your Firestore/Storage security rules.
