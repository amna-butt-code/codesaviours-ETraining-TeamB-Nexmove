export default function PageHero({ title, subtitle }) {
  return (
    <section className="bg-[var(--color-light)] px-4 py-12 text-center">
      <h1 className="text-4xl font-bold text-[var(--color-dark)]">{title}</h1>
      {subtitle && <p className="mt-3 text-lg max-w-2xl mx-auto">{subtitle}</p>}
    </section>
  );
}