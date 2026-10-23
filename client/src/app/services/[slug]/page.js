import Link from "next/link";
import PageHero from "../../../components/PageHero";

export default async function ServiceDetail({ params }) {
  const { slug } = await params;
  return (
    <div>
      <PageHero title={`[Service: ${slug}]`} subtitle="[Short description]" />
      <section className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-dark)] mb-2">What it is</h2>
          <p>[From client]</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-dark)] mb-2">Who it helps</h2>
          <p>[From client]</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-dark)] mb-2">What to expect in a session</h2>
          <p>[From client]</p>
        </div>
        <p>Session duration: [Duration] | Fee: [Fee]</p>
        <Link href="/book" className="inline-block bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-semibold">
          Book this service
        </Link>
      </section>
    </div>
  );
}