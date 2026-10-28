import Link from "next/link";
import PageHero from "../../components/PageHero";

export const metadata = {
  title: "Blog | Nexmove Physiotherapy Clinic",
  description: "Health articles and simple home exercise guides from Nexmove.",
};

const posts = [
  { slug: "post-1", title: "[Article title]" },
  { slug: "post-2", title: "[Article title]" },
  { slug: "post-3", title: "[Article title]" },
];

export default function Blog() {
  return (
    <div>
      <PageHero title="Blog and Resources" subtitle="Health articles and home exercise guides." />
      <section className="max-w-6xl mx-auto px-4 py-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <div key={p.slug} className="bg-white rounded-xl p-5 shadow-sm border">
            <div className="h-32 bg-[var(--color-light)] rounded-lg mb-4 flex items-center justify-center">[Image]</div>
            <h2 className="text-xl font-bold text-[var(--color-dark)]">{p.title}</h2>
            <p className="mt-2">[Short summary]</p>
            <Link href={`/blog/${p.slug}`} className="inline-block mt-3 text-[var(--color-primary)] underline">
              Read more
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}