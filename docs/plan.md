# Nexmove Project Plan

## 1. Sitemap

**Public pages:** /, /about, /services, /services/:slug, /conditions, /conditions/:slug, /team, /team/:slug, /packages, /book, /blog, /blog/:slug, /faq, /contact, /privacy, /terms

**Portals:** /portal (patient), /therapist, /admin

## 2. Database Collections

- **User:** name, email, passwordHash, role (patient, therapist, admin)
- **Patient:** user, phone, medical history, consent
- **Therapist:** user, specialty, qualification, working hours, session length, breaks, leave days
- **Service:** title, slug, description, duration, fee
- **Condition:** title, slug, symptoms, related services
- **Package:** name, sessions, price
- **Appointment:** patient or guest, therapist, service, date, slot, status (pending, confirmed, completed, cancelled, no-show), pain assessment
- **Holiday:** date, reason
- **Exercise:** title, instructions, image or video link
- **Review:** patient, appointment, rating, text, sentiment, approved
- **Post:** title, slug, content, category
- **Faq:** question, answer
- **Message:** name, phone, email, text