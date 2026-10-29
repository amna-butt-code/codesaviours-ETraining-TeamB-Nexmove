import PageHero from "../../../components/PageHero";

export default async function BlogPost({ params }) {
  const { slug } = await params;
  return (
    <div>
      <PageHero title="[Article title]" subtitle={`[Post: ${slug}]`} />
      <article className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        <p>[Article content]</p>
        <p className="text-sm">This article is general guidance and not medical advice.</p>
      </article>
    </div>
  );
}