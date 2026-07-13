import Image from "next/image";
import { siteConfig } from "@/site.config";
import Reveal from "./Reveal";

export default function About() {
  const { about } = siteConfig;
  return (
    <section id="about" className="relative border-t border-ink-line bg-ink py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="text-center font-display text-sm uppercase tracking-[0.35em] text-gold">
            {siteConfig.brandName}
          </p>
          <h2 className="mt-3 text-center font-display text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl">
            {about.heading}
          </h2>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
        </Reveal>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal delay={80}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-ink-line shadow-2xl sm:aspect-[3/4]">
              <Image
                src={siteConfig.assets.aboutImage}
                alt={`${siteConfig.brandName} live performance`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </Reveal>

          <div className="space-y-6">
            {about.paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 90}>
                <p className="text-lg leading-relaxed text-white/75 lg:text-left">
                  {p}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
