import PageHero from "../../components/PageHero";
import PainAssessment from "../../components/PainAssessment";

export const metadata = {
  title: "Pain Assessment | Nexmove Physiotherapy Clinic",
  description: "Tell us where it hurts and get guidance towards the right service.",
};

export default function Page() {
  return (
    <div>
      <PageHero title="Pain Assessment" subtitle="Tap where it hurts and answer a few questions." />
      <PainAssessment />
    </div>
  );
}