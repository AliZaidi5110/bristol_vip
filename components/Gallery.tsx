import Image from "next/image";
import { siteConfig } from "@/site.config";
import Reveal from "./Reveal";

/** Gallery images that span two columns on larger screens for visual variety. */
const WIDE_IMAGES = new Set([
  "/images/IMG_8028.JPG.jpeg",
  "/images/IMG_8018.JPG.jpeg",
  "/images/IMG_8049.JPG.jpeg",
]);

export default function Gallery() {
  const images = siteConfig.assets.gallery;
  return (
    <section id="gallery" className="relative border-t border-ink-line bg-ink py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="text-center font-display text-sm uppercase tracking-[0.35em] text-gold">
            The Moments
          </p>
          <h2 className="mt-3 text-center font-display text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl">
            Gallery
          </h2>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {images.map((src, i) => {
            const isWide = WIDE_IMAGES.has(src);
            return (
              <Reveal
                key={`${src}-${i}`}
                delay={(i % 3) * 80}
                className={isWide ? "col-span-2 lg:col-span-2" : ""}
              >
                <div
                  className={`group relative overflow-hidden rounded-xl border border-ink-line ${
                    isWide ? "aspect-[16/9]" : "aspect-square"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`${siteConfig.brandName} event photo ${i + 1}`}
                    fill
                    sizes={
                      isWide
                        ? "(max-width: 1024px) 100vw, 66vw"
                        : "(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                    }
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
