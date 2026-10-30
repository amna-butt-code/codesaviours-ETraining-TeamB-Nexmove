# Pain assessment: backend dependency

The frontend (/pain-assessment) is built. It posts to POST /api/pain-assessment through the Next.js proxy.
That backend endpoint does not exist in main yet, so submissions are not saved and the UI says so.

Expected payload:
{ areas: string[], painLevel: 0-10, duration: string, aggravatingFactors: string[],
  recentInjury: boolean, recentSurgery: boolean, redFlags: string[] }

Needed: an endpoint (and a link to the Appointment) owned by the backend owner. No competing endpoint was created.
Not yet done: attaching the assessment to a booking so the physiotherapist sees it before the session.