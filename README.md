# Nexmove Physiotherapy Clinic Website

A full-stack website for Nexmove Physiotherapy Clinic, Faisalabad, developed by Team B as part of the Codesaviours E-Training Full Stack Internship (19–31 October 2026).

The project aims to provide a professional clinic website with physiotherapy information, online appointment booking, patient and therapist portals, administration tools and AI-assisted features.

**Client:** Nexmove Physiotherapy Clinic
**Location:** Faisalabad, Pakistan
**Project type:** Full-stack team project
**Environment:** Localhost development

---

## 1. Project Overview

Nexmove's website is designed to help visitors:

- Learn about the clinic and its physiotherapy services.
- Explore conditions treated by the clinic.
- View physiotherapist profiles and qualifications.
- Find published packages and fee information.
- Request appointments through an online booking flow.
- Contact the clinic directly.
- Access patient and physiotherapist portals where supported.

The application uses a Next.js frontend, Express backend and MongoDB database. Public and protected features communicate with backend APIs rather than using browser storage as a database.

## 2. Technology Stack

| Area | Technology |
|---|---|
| Frontend | Next.js 16.4.2 |
| UI library | React 19.3.0 |
| Styling | Tailwind CSS v4 |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens, bcryptjs |
| Validation | Zod and server-side validation |
| Email | Nodemailer |
| AI assistant | Gemini API |
| Rate limiting | express-rate-limit |
| Version control | Git and GitHub |

## 3. Project Structure

```text
codesaviours-ETraining-TeamB-Nexmove/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── about/
│   │   │   ├── admin/
│   │   │   ├── book/
│   │   │   ├── blog/
│   │   │   ├── conditions/
│   │   │   ├── contact/
│   │   │   ├── faq/
│   │   │   ├── packages/
│   │   │   ├── portal/
│   │   │   ├── services/
│   │   │   ├── team/
│   │   │   └── therapist/
│   │   ├── components/
│   │   └── lib/
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   ├── utils/
│   ├── db.js
│   ├── dns-fix.js
│   ├── index.js
│   └── package.json
│
├── docs/
│   ├── clinic-info.md
│   ├── plan.md
│   ├── wireframes.md
│   ├── pain-assessment-dependency.md
│   ├── handover/
│   ├── postman/
│   └── presentation/
│
├── demo/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 4. Getting Started

### Prerequisites

Install the following:

- Node.js and npm.
- MongoDB Atlas account or a local MongoDB instance.
- Git.
- A code editor such as Visual Studio Code.

### Clone the repository

```bash
git clone https://github.com/amna-butt-code/codesaviours-ETraining-TeamB-Nexmove.git
cd codesaviours-ETraining-TeamB-Nexmove
```

### Backend setup

Open a terminal in the project directory:

```bash
cd server
npm ci
```

Create your local environment file:

**PowerShell:**

```powershell
Copy-Item .env.example .env
```

Edit `server/.env` and provide your own database connection string and configuration values.

Start the backend from the `server` directory:

```bash
node -r ./dns-fix.js index.js
```

The server uses the environment variables in `server/.env` and defaults to port `5000`.

The project also defines these npm scripts:

```bash
npm start
npm run dev
npm run seed
```

Use the seed script only with a development database. It refuses to run when `NODE_ENV` is set to `production`.

### Frontend setup

Open another terminal:

```bash
cd client
npm ci
npm run dev
```

The frontend is available at:

```text
http://localhost:3000
```

### Frontend quality checks

Run these commands inside the `client` directory:

```bash
npm run lint
npm run build
```

The production build can be started with:

```bash
npm start
```

## 5. Environment Variables

The backend reads its environment configuration from:

```text
server/.env
```

Never commit this file or share its secret values.

| Variable | Purpose | Requirement |
|---|---|---|
| `PORT` | Express server port; defaults to 5000 | Optional |
| `MONGO_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing and verification | Required for authentication |
| `MAIL_HOST` | SMTP host | Required for configured email delivery |
| `MAIL_PORT` | SMTP port; defaults to 2525 in the mailer | Optional |
| `MAIL_USER` | SMTP username | Required for configured SMTP authentication |
| `MAIL_PASS` | SMTP password | Required for configured SMTP authentication |
| `MAIL_FROM` | Sender identity for email messages | Optional |
| `GEMINI_API_KEY` | Gemini API key for AI features | Required for live Gemini integration |
| `GEMINI_MODEL` | Gemini model identifier | Optional; application has a default |

A template is available at `server/.env.example`.

The root `.env.example` is a minimal example and is not the environment file loaded by `server/index.js`.

Each developer should use their own local environment configuration. Do not place API keys, passwords, tokens or real patient information in GitHub.

## 6. Website Pages

| Page | Route | Purpose |
|---|---|---|
| Home | `/` | Clinic introduction and service highlights |
| About | `/about` | Clinic information |
| Services | `/services` | Active services |
| Service details | `/services/:slug` | Individual service information |
| Conditions | `/conditions` | Conditions treated |
| Condition details | `/conditions/:slug` | Condition information |
| Our Team | `/team` | Physiotherapist profiles |
| Therapist details | `/team/:slug` | Individual therapist information |
| Packages & Fees | `/packages` | Published packages and prices |
| Booking | `/book` | Appointment booking flow |
| Blog | `/blog` | Health articles and resources |
| FAQ | `/faq` | Frequently asked questions |
| Contact | `/contact` | Clinic contact information |
| Patient portal | `/portal` | Patient-facing account area |
| Therapist portal | `/therapist` | Therapist-facing account area |
| Admin panel | `/admin` | Administrative features |
| Privacy | `/privacy` | Privacy information |
| Terms | `/terms` | Website terms |

Some portal and management features depend on backend authentication, role permissions and their respective API implementations.

## 7. Backend API Overview

The Express application mounts the following route groups.

| Base path | Purpose |
|---|---|
| `/api/health` | Backend health check |
| `/api/services` | Service management and retrieval |
| `/api/auth` | Authentication and user management |
| `/api/therapists` | Therapist profiles |
| `/api/appointments` | Booking, slot retrieval and appointment management |
| `/api/holidays` | Clinic and therapist holidays |
| `/api/faqs` | FAQ content |
| `/api/conditions` | Condition content |
| `/api/messages` | Contact messages and administration |
| `/api/posts` | Blog posts |
| `/api/packages` | Package management and retrieval |
| `/api/reviews` | Patient reviews and approval |
| `/api/chat` | Chat endpoint |
| `/api/assistant` | AI assistant endpoint |

### Selected endpoint examples

**Health**

```http
GET /api/health
```

**Services**

```http
GET /api/services/getServices
GET /api/services/getService/:id
```

**Therapists**

```http
GET /api/therapists/allTherapists
```

**Appointments**

```http
GET  /api/appointments/getAvailableSlots
POST /api/appointments/book
POST /api/appointments/bookGuest
PATCH /api/appointments/:id/cancel
PATCH /api/appointments/:id/reschedule
PATCH /api/appointments/:id/status
```

**Authentication**

```http
POST /api/auth/signUp
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

**Public content**

```http
GET /api/faqs
GET /api/conditions
GET /api/posts
GET /api/packages
POST /api/messages
```

Admin-only routes and authenticated routes require the appropriate authorization. Refer to the individual route files for exact request bodies, validation rules and middleware requirements.

A Postman collection is available at:

```text
docs/postman/Nexmove-Zohaib.postman_collection.json
```

Import it into Postman and use its `baseUrl` collection variable:

```text
http://localhost:5000
```

## 8. Appointment Booking Flow

The intended booking journey is:

1. Patient selects a service.
2. Patient chooses a physiotherapist or any available therapist.
3. Patient chooses an appointment date.
4. Backend checks available slots against therapist working hours, session duration, breaks, bookings, holidays and leave.
5. Patient provides the required details and consent.
6. Backend validates the selected slot again before creating the appointment.
7. The application returns the booking result and sends a confirmation email where email delivery is configured.

The system must prevent double booking and must not offer appointments in the past or during unavailable periods.

**Booking configuration rules:**

- Confirmed service duration is required for reliable slot generation.
- Service price is optional when the clinic has not provided a confirmed fee.
- Missing fees must not be displayed as zero.
- Therapist display timings must not be treated as a verified weekly schedule.
- Live slot availability requires valid therapist schedules and clinic holiday data.

## 9. Team Contributions

### Zohaib Khalid

- Public website frontend and styling.
- Responsive layouts and shared public UI.
- Services, conditions and therapist presentation.
- Booking page UI and frontend API integration.
- Pakistan timezone handling and appointment slot presentation.
- Service fee and duration presentation.
- Frontend quality checks and documentation.

### Amna Butt

- Team leadership and coordination.
- Admin panel and management interface.
- Administrative workflows and project handover.
- Review of project integration and submission requirements.

### Hammad Raza

- Backend development and API integration.
- Authentication and authorization support.
- Appointment booking engine and backend validation.
- Appointment management and related server-side functionality.

Feature ownership and merge status should be checked against the repository's commit history and pull requests.

## 10. Clinic Information

**Nexmove Physiotherapy Clinic**
Faisalabad, Pakistan

**Address:**
Riyaz Ul Jannah Colony, Daewoo Road, Faisalabad

**Phone:**
0326 6312211
International format: +92 326 6312211

**Instagram:**
https://www.instagram.com/nexmove_/

**Google Maps:**
https://share.google/i4m42aMPoyZVJKvn3

**Taglines:**
- Your Next Move Starts Here.
- Your next move towards a better life!

### Published services

- Back and neck pain
- Joint and knee pain
- Sciatica and nerve-related problems
- Stroke and neurological rehabilitation
- Children's physiotherapy
- Sports injuries and post-fracture rehabilitation
- Frozen shoulder and movement problems

Detailed source notes and clinic-content verification are maintained in:

```text
docs/clinic-info.md
```

## 11. Content Needed from Client

The following information must be confirmed by Nexmove before it is published or used for live appointment scheduling.

### Services and fees

- [ ] Confirmed session duration for every active service.
- [ ] Individual service fees.
- [ ] Currency used for published fees.
- [ ] Assessment or initial consultation fee.
- [ ] Available treatment packages and their prices.
- [ ] Home-visit availability and charges, if offered.

### Therapist schedules

- [ ] Confirmed working days for each physiotherapist.
- [ ] Actual weekly booking schedules.
- [ ] Session breaks and unavailable periods.
- [ ] Leave and schedule-change procedures.
- [ ] Confirmation of the therapist responsible for male patients during the published morning hours.

The clinic's published therapist display timings are:

| Physiotherapist | Published display timing |
|---|---|
| Dr Laraib Noreen (PT) | 1:00 PM – 4:00 PM |
| Dr Hanana Zahid (PT) | 4:00 PM – 7:00 PM |
| Dr Maham Ashraf (PT) | 7:00 PM – 10:00 PM |

These are informational timings, not confirmed weekly working schedules.

### Operating hours and booking policies

- [ ] Confirm operating days and holiday closures.
- [ ] Confirm whether published patient-group timings are still current.
- [ ] Confirm minimum appointment notice.
- [ ] Confirm cancellation and rescheduling deadlines.
- [ ] Confirm payment methods and advance-payment requirements.
- [ ] Confirm the appointment confirmation process.

### Contact details and media

- [ ] Confirm whether the published phone number is also the official WhatsApp number.
- [ ] Official clinic email address.
- [ ] Approved physiotherapist photographs and permission to display credentials.
- [ ] Approved clinic photographs.
- [ ] Confirmed facilities and equipment.
- [ ] Approved descriptions for services, conditions, FAQs and educational content.

Do not invent prices, qualifications, reviews, patient photographs, medical claims or treatment outcomes.

## 12. Documentation

| Document | Location |
|---|---|
| Project plan and sitemap | `docs/plan.md` |
| Clinic information and source notes | `docs/clinic-info.md` |
| Wireframes | `docs/wireframes.md` |
| Pain assessment dependency notes | `docs/pain-assessment-dependency.md` |
| Team handover notes | `docs/handover/` |
| Postman API collection | `docs/postman/` |
| Team presentation | `docs/presentation/` |

## 13. Development and Quality Checks

Before submitting changes:

1. Confirm the client starts successfully.
2. Run ESLint.
3. Run the production build.
4. Check the browser console for errors.
5. Test public navigation and forms.
6. Check responsive layouts at 375px, 768px and 1280px.
7. Verify API responses and error states.
8. Test authenticated routes with the correct user roles.
9. Test booking availability, double-booking protection, cancellation and rescheduling once the backend is integrated.
10. Keep `.env` files, credentials and real patient data out of the repository.

### Current integration notes

The appointment routes currently require the controller handlers `cancelAppointment`, `rescheduleAppointment` and `updateAppointmentStatus`. These handlers must be restored and verified before the backend can start successfully.

The appointment controller must also use the agreed booking configuration rule: duration is mandatory, while price is optional.

The full booking journey must be re-tested after the backend changes and verified clinic schedules are available.

## 14. Git and Collaboration

- Work on individual feature branches.
- Use meaningful commit messages.
- Push work to the contributor's own GitHub account.
- Open pull requests against `main`.
- Do not merge your own pull request.
- Review changes before merging.
- Never commit `.env`, `node_modules` or real patient information.

Example commit messages:

```text
feat: improve appointment booking
fix: handle Pakistan timezone in slot generation
feat: update therapist profile presentation
docs: document missing clinic information
```

## 15. Project Evaluation and Handover

The project brief evaluates:

- Booking engine and appointment management.
- Public website quality and content.
- Patient, therapist and admin portals.
- AI features.
- Security and code quality.
- Team communication and contributions.
- Presentation and client readiness.

The final handover should include a working local setup, documented environment variables, verified clinic information, API documentation, screenshots, Postman collection and team presentation.

---

**Repository:**
https://github.com/amna-butt-code/codesaviours-ETraining-TeamB-Nexmove

**Project period:** 19–31 October 2026
**Team:** Team B, Codesaviours E-Training Internship