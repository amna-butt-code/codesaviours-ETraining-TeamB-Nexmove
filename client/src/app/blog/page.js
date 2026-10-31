import Link from "next/link";
import PageHero from "../../components/PageHero";
import { getList } from "../../lib/api";

export const metadata = {
  title: "Blog | Nexmove Physiotherapy Clinic",
  description: "Read articles published by Nexmove Physiotherapy Clinic.",
};

export const dynamic = "force-dynamic";

function formatDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
  }).format(date);
}

export default async function Blog() {
  const posts = await getList("/api/posts");

  return (
    <main className="min-h-screen bg-[#f8faf9]">
      <PageHero
        title="Blog and Resources"
        subtitle="Ideas, information and articles currently published by Nexmove."
      />

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3 border-b border-[#dce7e3] pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#16848e]">
              The Nexmove journal
            </span>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2350] sm:text-3xl">
              Latest articles
            </h2>
          </div>

          <span className="text-sm text-[#687780]">
            {posts.length} {posts.length === 1 ? "article" : "articles"}
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="border-y border-[#dce7e3] py-12">
            <h3 className="text-xl font-semibold text-[#0a2350]">
              No articles published yet
            </h3>

            <p className="mt-3 max-w-xl text-sm leading-7 text-[#62717a]">
              Articles published by Nexmove will appear here.
              Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {posts.map((post, index) => {
              const date = formatDate(post.publishedAt);
              const slug = post.slug;

              return (
                <article
                  key={post._id || slug || index}
                  className="flex min-w-0 flex-col border border-[#dfe9e5] bg-white p-3 transition-colors duration-200 hover:border-[#16848e]/50 sm:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#edf1ef] pb-3">
                    {post.category ? (
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#16848e] sm:text-xs">
                        {post.category}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#829098] sm:text-xs">
                        Nexmove journal
                      </span>
                    )}

                    <span className="font-mono text-xs text-[#9aa6a9]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h2 className="mt-4 break-words text-base font-semibold leading-snug text-[#0a2350] sm:mt-5 sm:text-xl">
                    {post.title}
                  </h2>

                  {date && (
                    <p className="mt-2 text-[11px] text-[#829098] sm:text-xs">
                      {date}
                    </p>
                  )}

                  <p className="mt-3 line-clamp-4 text-xs leading-6 text-[#62717a] sm:text-sm sm:leading-7">
                    {post.excerpt?.trim() ||
                      "Read the full article for more information."}
                  </p>

                  {slug ? (
                    <Link
                      href={`/blog/${encodeURIComponent(slug)}`}
                      className="mt-auto inline-flex items-center gap-1 border-t border-[#edf1ef] pt-4 mt-5 text-xs font-semibold text-[#16848e] transition-colors hover:text-[#0a2350] sm:text-sm"
                    >
                      Read article <span aria-hidden="true">→</span>
                    </Link>
                  ) : (
                    <p className="mt-auto border-t border-[#edf1ef] pt-4 mt-5 text-xs text-[#829098]">
                      Article details unavailable
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}