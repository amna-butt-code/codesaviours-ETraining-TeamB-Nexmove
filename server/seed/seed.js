// Sample content for development only. Nothing here is approved clinic content;
// replace with clinic-approved wording before any real use.
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");

const Condition = require("../models/Condition");
const Faq = require("../models/Faq");
const Post = require("../models/Post");
const Exercise = require("../models/Exercise");

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to seed: NODE_ENV is production.");
  process.exit(1);
}
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing in server/.env");
  process.exit(1);
}

const URGENT =
  "Seek urgent medical help if symptoms follow a serious injury, or come with numbness, weakness, fever, chest pain, or loss of bladder or bowel control.";

const conditions = [
  {
    title: "Lower Back Pain",
    slug: "lower-back-pain",
    summary: "Pain or stiffness in the lower back, often linked to posture, lifting or long periods of sitting.",
    description:
      "Lower back pain is one of the most common reasons people visit a physiotherapist. It can start suddenly or build up over time. A physiotherapist can assess how you move, look at what may be contributing, and discuss a suitable plan with you.",
    commonSymptoms: ["Aching or stiffness in the lower back", "Pain that changes with movement or sitting", "Difficulty bending or standing up straight"],
    whenToSeekHelp: URGENT,
    isPublished: true,
  },
  {
    title: "Neck Pain",
    slug: "neck-pain",
    summary: "Stiffness or discomfort in the neck, commonly linked to posture and long hours at a screen.",
    description:
      "Neck pain can come from everyday habits such as long periods looking at a phone or computer, or from sleeping in an awkward position. A physiotherapist can review your posture and movement and talk through what may help.",
    commonSymptoms: ["Stiffness when turning the head", "Aching across the neck and shoulders", "Headaches that start at the base of the skull"],
    whenToSeekHelp: URGENT,
    isPublished: true,
  },
  {
    title: "Shoulder Pain",
    slug: "shoulder-pain",
    summary: "Pain or limited movement in the shoulder, often noticed when reaching, lifting or sleeping.",
    description:
      "The shoulder is a flexible joint that relies on many muscles and tendons working together. Pain can follow overuse, a strain or a period of reduced movement. A physiotherapist can assess your range of movement and discuss options with you.",
    commonSymptoms: ["Pain when lifting the arm", "Difficulty reaching behind the back", "Discomfort when lying on the affected side"],
    whenToSeekHelp: URGENT,
    isPublished: true,
  },
  {
    title: "Knee Pain",
    slug: "knee-pain",
    summary: "Pain around the knee that may be felt during walking, climbing stairs or exercise.",
    description:
      "Knee pain has many possible causes, from overuse to old injuries. A physiotherapist can look at how your knee and the surrounding joints move and help you understand what may be contributing.",
    commonSymptoms: ["Pain when climbing stairs", "Stiffness after sitting for a while", "Swelling or a feeling of the knee giving way"],
    whenToSeekHelp: URGENT,
    isPublished: true,
  },
];

const faqs = [
  { question: "How do I book an appointment?", answer: "Choose a service, then a physiotherapist or 'any available', pick a date and a free time slot, and enter your details. You will need to tick the consent box before booking.", category: "Booking", order: 1 },
  { question: "How will I know my booking is confirmed?", answer: "New bookings start as pending. You will see the status change once the clinic confirms it, and you will receive a confirmation email.", category: "Booking", order: 2 },
  { question: "Can I cancel or reschedule?", answer: "Yes. Patients can cancel or reschedule up to a set time before the appointment. Please do so as early as you can so the slot can be offered to someone else.", category: "Booking", order: 3 },
  { question: "What should I wear to my first visit?", answer: "Comfortable clothing that lets you move freely and lets the physiotherapist see the area that is bothering you.", category: "Your visit", order: 1 },
  { question: "Is physiotherapy painful?", answer: "Some assessments or exercises may cause mild discomfort. Always tell your physiotherapist if something hurts so they can adjust what they are doing.", category: "Your visit", order: 2 },
  { question: "How can I ask a question before booking?", answer: "Use the contact form on the Contact page, or message the clinic on WhatsApp, and the team will get back to you.", category: "General", order: 1 },
].map((f) => ({ ...f, isPublished: true }));

const posts = [
  {
    title: "What to Expect at Your First Physiotherapy Visit",
    slug: "what-to-expect-first-visit",
    excerpt: "A simple walk-through of a first appointment, so you know what to bring and what will happen.",
    content:
      "Your first visit usually begins with a conversation. Your physiotherapist will ask about your symptoms, your daily routine and anything that makes things better or worse.\n\nNext, they may watch how you move and gently examine the area that is bothering you. They will explain what they find in plain language and discuss the next steps with you.\n\nBring a list of any questions you have, and let your physiotherapist know about your medical history and any medicines you take.",
    category: "Patient guide",
    isPublished: true,
    publishedAt: new Date("2026-10-01T09:00:00Z"),
  },
  {
    title: "Simple Habits for a Healthier Desk Setup",
    slug: "healthier-desk-setup",
    excerpt: "Small changes to how you sit and take breaks during a long working day.",
    content:
      "Long hours at a desk can leave you feeling stiff. A few small habits can make the day more comfortable.\n\nTry to keep your screen at eye level, your feet supported, and your elbows relaxed by your sides. Stand up and move around regularly instead of staying in one position for hours.\n\nIf you notice pain that does not settle, speak to a healthcare professional.",
    category: "Wellness",
    isPublished: true,
    publishedAt: new Date("2026-10-08T09:00:00Z"),
  },
];

const exercises = [
  { title: "Shoulder Rolls", instructions: ["Sit or stand tall with your arms relaxed.", "Slowly roll both shoulders up, back and down in a circle.", "Repeat 10 times, then reverse the direction."], isPublished: true },
  { title: "Seated Posture Reset", instructions: ["Sit near the front of your chair with both feet flat on the floor.", "Gently lengthen your spine as if a string is lifting the top of your head.", "Relax your shoulders and hold for 10 seconds, then release."], isPublished: true },
  { title: "Gentle Neck Side Tilt", instructions: ["Sit tall with your shoulders relaxed.", "Slowly tilt your ear towards one shoulder until you feel a mild stretch.", "Hold for 15 seconds, return to centre, then repeat on the other side."], isPublished: true },
];

// Update-or-insert by a unique field, so running the script twice creates no duplicates
async function upsertAll(Model, items, key) {
  for (const item of items) {
    await Model.updateOne({ [key]: item[key] }, { $set: item }, { upsert: true, runValidators: true });
  }
  console.log(`${Model.modelName}: ${items.length} sample records ready`);
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await upsertAll(Condition, conditions, "slug");
    await upsertAll(Faq, faqs, "question");
    await upsertAll(Post, posts, "slug");
    await upsertAll(Exercise, exercises, "title");
    console.log("Seeding finished.");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
})();