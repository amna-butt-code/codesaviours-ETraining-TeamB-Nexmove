# Handover: Amna to Zohaib (Day 6, 24 Oct 2026)

## Done
- Repo, branch protection, Next.js client, header, footer, WhatsApp button
- Public pages: About, Services, Team, Packages, Blog, Privacy, Terms
- Home page connected to API (FAQs, conditions)
- MongoDB Atlas and server/.env setup, docs/plan.md
- Zohaib: models (Condition, Faq, Message, Review, Post, Exercise), public APIs (FAQs, conditions, messages, posts), seed script, Postman collection, logo, favicon, brand colors, docs/clinic-info.md
- Booking flow UI with sample data (/book)

## In progress
- Hammad: update and delete for services and appointments (not merged yet, branch feature/backend-foundation)

## Pending
- Auth (JWT, bcrypt, role middleware): not merged
- Patient, Holiday, Therapist, Package models and APIs
- Slot generation and booking API with double-booking protection
- Connect /book to the real slot and booking APIs
- Patient and therapist portals, admin panel
- AI features (chatbot, pain assessment), reviews with sentiment, emails
- Pages: /faq, /conditions, /contact, /login (if not done)
- Fill placeholders from docs/clinic-info.md
- Home page services section (dummy data until the Service API is merged)
- README, demo video, team PPT, final submission (Day 11-12)

## Open issues
- Auth and booking models are the critical path and are not merged to main
- Hadiya has not shared a GitHub username, so she is not added to the repo
- Approvals on main are off (turn on once reviewers are active)
- Admin write routes are waiting on auth

## Decisions
- Brand colors come from Zohaib's 5 HEX codes in globals.css
- Each member keeps their own server/.env (never committed)
- PRs are merged by the lead when no reviewer is available.
- Placeholders like [Clinic address] stay until filled from public sources; no invented doctor names, reviews or medical claims

## Suggested priorities for the next lead (Mon 26 Oct onwards)
1. Get auth merged first (Hammad), then booking models and slot API
2. Patient and therapist portals (Day 7), admin panel (Day 8)
3. AI assistant and pain assessment (Day 9), reviews, sentiment, emails and security pass (Day 10)
4. Testing, README, demo video (Day 11), PPT and final submission (Day 12)