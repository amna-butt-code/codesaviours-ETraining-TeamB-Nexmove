import PageHero from "../../components/PageHero";
import ChatBox from "../../components/ChatBox";

export const metadata = {
  title: "Ask Nexmove | Nexmove Physiotherapy Clinic",
  description: "Ask questions about services, timings and booking.",
};

export default function Chat() {
  return (
    <div>
      <PageHero title="Ask Nexmove" subtitle="Questions about our clinic and booking." />
      <ChatBox />
    </div>
  );
}
