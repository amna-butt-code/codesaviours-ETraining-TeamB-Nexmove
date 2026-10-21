export default function WhatsAppButton() {
  // Replace with the clinic's real number (country code, no + or spaces)
  const number = "";
  const href = number ? `https://wa.me/${number}` : "#";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 bg-green-500 text-white font-semibold px-4 py-3 rounded-full shadow-lg hover:bg-green-600"
    >
      WhatsApp
    </a>
  );
}