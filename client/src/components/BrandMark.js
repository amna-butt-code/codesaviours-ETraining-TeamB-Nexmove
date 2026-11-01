import Image from "next/image";

export default function BrandMark({ className = "" }) {
  return (
    <span
      role="img"
      aria-label="Nexmove logo"
      className={`relative inline-block h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-[#dce9e6] bg-white ${className}`}
    >
      <Image
        src="/images/nexmove-logo.png"
        alt=""
        fill
        sizes="44px"
        className="object-cover object-left"
      />
    </span>
  );
}