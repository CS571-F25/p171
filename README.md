# LocalBite – Discover Local Food & Events

LocalBite is a single-page promotional experience that helps people find the best local food happenings — food trucks, farmers’ markets, chef pop-ups, and festivals. It highlights an interactive calendar, smart filters, rich event details, and a personal “save for later” dashboard with simple account capture.

## Features
- Home, Events, Dashboard, Contact (with Submit Event tab), and per-event detail pages wired via React Router with a persistent, accessible navigation bar.
- Interactive filters for date, category, and location, plus a clickable calendar strip on the Events page.
- Rich event detail pane and standalone event pages with description, time, location, price, tags, ticket link, and embedded map.
- Save-for-later bookmarking gated behind a lightweight auth modal; saved events surface in “My Events.”
- Contact form for inquiries, partnerships, or event submissions — fully keyboard friendly with labeled inputs.
- Integrated “Submit an event” tab on the Contact page to request listings with full event details and contact info.
- Responsive bespoke design with bold typography and gradient accents (no default system styles).
- Frontend-only login demo with localStorage persistence; sign in/out via the Account button and keep saved events locally.

## Getting started
```bash
npm install
npm run dev
```
Visit the printed local URL to view the experience. The auth and saves run client-side for demo purposes.

## Deployment
The project is configured for GitHub Pages (`homepage` in `package.json`). Build output is emitted to `docs/`.
```bash
npm run build
npm run deploy 
```
