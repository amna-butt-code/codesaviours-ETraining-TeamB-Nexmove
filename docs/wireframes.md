# Nexmove Physiotherapy Clinic — Wireframes

**Project:** Nexmove Physiotherapy Clinic  
**Document:** Initial Page Wireframes  
**Status:** Working draft — pending confirmation of official branding and clinic content

## 1. Purpose

This document defines the structure and content hierarchy of three key pages: Home, Service Detail, and Book Appointment. These wireframes guide frontend development before final visual styling and content are confirmed.

## 2. Shared Design Requirements

- Clean, calm, professional layout suitable for a physiotherapy clinic.
- Clear typography, readable body text, whitespace, and consistent spacing.
- Responsive layouts for desktop, tablet, and mobile.
- A clearly visible **Book Appointment** action in the main navigation.
- Shared header, footer, and WhatsApp contact button.
- Accessible forms, keyboard navigation, clear labels, and visible focus states.
- Use verified clinic information only. Unconfirmed details remain placeholders.

## 3. Home Page

### Section 1 — Header
- Clinic logo or temporary wordmark.
- Main navigation: Home, About, Services, Conditions, Team, Packages, Blog, Contact.
- Login link or button, if supported.
- Primary action: Book Appointment.
- Responsive mobile navigation.

### Section 2 — Hero
- Main headline describing the clinic's verified purpose.
- Short supporting introduction.
- Primary CTA: Book Appointment.
- Secondary CTA: Explore Services.
- Relevant clinic or physiotherapy image, once approved.

### Section 3 — Services Preview
- Section heading and short introduction.
- Reusable service cards containing a title, short description, and details link.
- Service content must be confirmed by the clinic.

### Section 4 — Conditions
- Preview of conditions the clinic confirms it treats.
- Clear links to relevant condition or service information.
- Avoid implying guaranteed results or making unsupported medical claims.

### Section 5 — How It Works
- Simple steps explaining the appointment process.
- Example structure: Choose a service → Select an available slot → Submit details → Receive confirmation.
- Final process wording must match the implemented booking flow.

### Section 6 — Clinic and Team Preview
- Brief clinic introduction.
- Therapist or team profiles only after names, qualifications, and photographs are verified.
- CTA to learn more about the clinic or team.

### Section 7 — FAQs
- Common questions with concise answers.
- Use confirmed clinic policies; keep unknown answers marked for review.

### Section 8 — Contact and Final CTA
- Verified contact information and location, when supplied.
- Opening hours only after confirmation.
- Book Appointment CTA and contact options.

### Section 9 — Footer
- Important navigation links.
- Verified contact details and social links.
- Privacy or other policy links where available.

## 4. Service Detail Page

### Section 1 — Breadcrumb
- Home → Services → Current Service.

### Section 2 — Service Introduction
- Service title.
- Short, verified description.
- Relevant image if available and approved.
- Book Appointment CTA.

### Section 3 — Service Information
- What the service involves.
- Who it may be suitable for, using clinic-approved wording.
- What a patient can expect.
- Any relevant limitations or preparation instructions supplied by the clinic.

### Section 4 — Related Information
- Related services or conditions, when applicable.
- Links to relevant FAQs.

### Section 5 — Appointment CTA
- Clear next step to book an appointment.
- Carry the selected service into the booking page where supported.

### Section 6 — Footer
- Shared site footer and contact options.

## 5. Book Appointment Page

### Section 1 — Page Introduction
- Clear heading explaining appointment booking.
- Short explanation of the booking steps.

### Section 2 — Booking Form

**Step 1: Select Service**
- Display available, active services.
- Require a selection before continuing.

**Step 2: Select Therapist**
- Show available therapists where applicable.
- Offer an “Any available therapist” option only if supported.

**Step 3: Select Date and Time**
- Display dates and appointment slots returned by the server.
- Respect therapist schedules, holidays, leave, and session duration.
- Do not treat unavailable slots as bookable.
- Revalidate availability on the server before confirming.

**Step 4: Patient Details**
- Collect only the details required to create the appointment.
- Include appropriate labels, input validation, and clear error messages.
- Do not ask for unnecessary sensitive medical information.

**Step 5: Review and Submit**
- Show the selected service, therapist (if applicable), date, time, and submitted details.
- Let the patient correct information before submission.
- Require an explicit confirmation action.

### Section 3 — Booking Status
- Show a clear success message when the server confirms the booking.
- Display a useful error if the slot becomes unavailable or submission fails.
- Show confirmation details only after the booking has been saved successfully.
- Send confirmation email only when the backend supports it.

### Section 4 — Help and Contact
- Provide a suitable contact option for patients who cannot complete the booking.
- Use verified clinic contact information.

## 6. Responsive Behaviour

### Desktop
- Use the full navigation and a spacious content layout.
- Display service cards in a responsive grid.
- Keep the main booking form easy to scan.

### Tablet
- Adjust grids and spacing to fit the available width.
- Keep navigation and booking actions accessible.

### Mobile
- Use a compact navigation menu.
- Stack cards and form controls vertically.
- Make buttons and form inputs comfortable to use.
- Prevent horizontal overflow.
- Keep errors and field labels clearly visible.

## 7. Accessibility and Usability

- Use semantic headings in a logical order.
- Associate form labels with their inputs.
- Provide keyboard-accessible navigation and controls.
- Use visible focus states and adequate text contrast.
- Communicate validation errors in text, not colour alone.
- Provide meaningful alternative text for informative images.
- Respect reduced-motion preferences if animations are introduced.

## 8. Items Awaiting Clinic Confirmation

- Official logo and brand colours.
- Approved heading and body fonts, if specified.
- Clinic introduction and service descriptions.
- Actual conditions treated.
- Therapist names, qualifications, and biographies.
- Fees, packages, and booking policies.
- Address, phone number, opening hours, and official social links.
- Approved clinic photographs and testimonials.

**Important:** Do not invent clinic details, patient reviews, treatment outcomes, or therapist credentials. Keep unknown content clearly marked until it is verified.

## 9. Implementation Notes

- Use shared components for repeated elements such as the header, footer, service cards, and CTAs.
- Keep final visual styling consistent with the confirmed brand identity.
- Load services, available slots, and other dynamic data from the backend when the relevant API is available.
- Validate appointment data on the server; frontend validation alone is insufficient.
- Update this document if the team changes the agreed page structure.