import { notFound } from "next/navigation";
import PageHero from "../../../components/PageHero";
import { getRecord } from "../../../lib/api";

export const dynamic = 'force-dynamic';

export default async function BlogPost({ params }) {
  const { slug } = await params;

  const post = await getRecord(
    `/api/posts/${encodeURIComponent(slug)}`
  );

  if (!post || !post.slug) {
    notFound();
  }

  let publishedDate = null;

  if (post.publishedAt) {
    const date = new Date(post.publishedAt);

    if (!Number.isNaN(date.getTime())) {
      publishedDate = new Intl.DateTimeFormat("en-PK", {
        dateStyle: "long",
      }).format(date);
    }
  }

  return (
    <div>
      <PageHero
        title={post.title}
        subtitle={post.excerpt || post.category || "Nexmove article"}
      />

      <article className="mx-auto max-w-3xl space-y-5 px-4 py-10">
        {publishedDate && (
          <p className="text-sm text-gray-500">{publishedDate}</p>
        )}

        <div className="whitespace-pre-wrap leading-8">
          {post.content}
        </div>

        <p className="border-t pt-4 text-sm text-gray-600">
          This article is general information and is not a substitute for
          an individual assessment or medical advice.
        </p>
      </article>
    </div>
  );
}