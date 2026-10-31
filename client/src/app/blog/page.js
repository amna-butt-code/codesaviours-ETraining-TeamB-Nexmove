import Link from "next/link";
import PageHero from "../../components/PageHero";
import { getList } from "../../lib/api";

export const metadata = {
  title: "Blog | Nexmove Physiotherapy Clinic",
  description: "Read articles published by Nexmove Physiotherapy Clinic.",
};

function formatDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
  }).format(date);
}

export const dynamic = 'force-dynamic';

export default async function Blog() {
  const posts = await getList("/api/posts");

  return (
    <div>
      <PageHero
        title="Blog and Resources"
        subtitle="Articles currently published by Nexmove."
      />

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {posts.length === 0 ? (
          <p className="sm:col-span-2 lg:col-span-3">
            No articles are currently published. Please check back later.
          </p>
        ) : (
          posts.map((post) => (
            <article
              key={post._id || post.slug}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              {post.category && (
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
                  {post.category}
                </p>
              )}

              <h2 className="mt-2 text-xl font-bold text-[var(--color-dark)]">
                {post.title}
              </h2>

              {post.publishedAt && (
                <p className="mt-1 text-xs text-gray-500">
                  {formatDate(post.publishedAt)}
                </p>
              )}

              <p className="mt-3 text-gray-700">{post.excerpt}</p>

              <Link
                href={`/blog/${post.slug}`}
                className="mt-4 inline-block text-[var(--color-primary)] underline"
              >
                Read Article
              </Link>
            </article>
          ))
        )}
      </section>
    </div>
  );
}