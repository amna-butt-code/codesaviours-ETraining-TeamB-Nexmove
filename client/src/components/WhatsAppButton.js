
export default function WhatsAppButton() {
  const number = "923266312211";
  const message = "Hello Nexmove, I would like to know more about your physiotherapy services.";
  const href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Nexmove on WhatsApp"
      className="fixed bottom-5 right-5 z-50 bg-green-500 text-white font-semibold px-4 py-3 rounded-full shadow-lg hover:bg-green-600 transition-colors"
    >
      WhatsApp
    </a>
  );
}
