"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, CalendarDays, Camera, MapPin } from "lucide-react";
import { siteConfig, type GalleryEvent } from "@/site.config";
import GalleryLightbox from "./GalleryLightbox";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
      <div className="absolute -right-16 top-2/3 h-96 w-96 rounded-full bg-rose-500/10 blur-3xl" />
      <div className="absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl" />
    </div>
  );
}

function EventImageGrid({
  event,
  onImageClick,
  priority,
}: {
  event: GalleryEvent;
  onImageClick: (index: number) => void;
  priority?: boolean;
}) {
  const [featured, ...supporting] = event.images;

  return (
    <div className="grid grid-cols-12 grid-rows-2 gap-2.5 sm:gap-3 lg:min-h-[460px]">
      <button
        type="button"
        onClick={() => onImageClick(0)}
        className="gallery-photo group relative col-span-7 row-span-2 min-h-[280px] overflow-hidden rounded-[20px] border border-white/10 bg-ink-card shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] sm:min-h-[360px]"
        aria-label={`View featured ${event.title} photo`}
      >
        <Image
          src={featured}
          alt={`${event.title} featured`}
          fill
          sizes="(max-width: 640px) 70vw, (max-width: 1024px) 45vw, 420px"
          quality={72}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-tr ${event.accent} opacity-[0.12] mix-blend-overlay transition-opacity duration-300 group-hover:opacity-25`}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
        <span className="pointer-events-none absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-md">
          Featured
        </span>
      </button>

      <div className="col-span-5 row-span-2 grid grid-rows-3 gap-2.5 sm:gap-3">
        {supporting.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => onImageClick(i + 1)}
            className="gallery-photo group relative min-h-[88px] overflow-hidden rounded-[18px] border border-white/10 bg-ink-card shadow-lg shadow-black/40 sm:min-h-0"
            aria-label={`View ${event.title} photo ${i + 2}`}
          >
            <Image
              src={src}
              alt={`${event.title} ${i + 2}`}
              fill
              sizes="(max-width: 640px) 35vw, (max-width: 1024px) 25vw, 220px"
              quality={68}
              loading="lazy"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
          </button>
        ))}
      </div>
    </div>
  );
}

function EventGallerySection({
  event,
  index,
  onOpenGallery,
}: {
  event: GalleryEvent;
  index: number;
  onOpenGallery: (eventId: string, imageIndex: number) => void;
}) {
  const reversed = index % 2 === 1;

  return (
    <motion.article
      id={`gallery-${event.id}`}
      className="relative"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -40px 0px" }}
    >
      <div
        className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16 ${
          reversed ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        <motion.div variants={fadeUp} custom={0.04} className="relative">
          <div
            className={`absolute -inset-px rounded-[28px] bg-gradient-to-br ${event.accent} opacity-40 blur-[1px]`}
          />
          <div className="relative overflow-hidden rounded-[27px] border border-white/10 bg-ink-card/80 p-8 backdrop-blur-xl sm:p-10">
            <div
              className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${event.accent} opacity-20 blur-3xl`}
            />

            <div className="relative flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-white/80">
                <CalendarDays className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                {event.date}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-white/80">
                <MapPin className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                {event.location}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
                <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                4 Photos
              </span>
            </div>

            <p className="relative mt-6 font-display text-xs uppercase tracking-[0.35em] text-gold/80">
              Event {String(index + 1).padStart(2, "0")}
            </p>

            <h3 className="relative mt-2 font-display text-3xl font-bold uppercase leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-[2.6rem]">
              {event.title}
            </h3>

            <p className="relative mt-5 max-w-md text-base leading-relaxed text-white/65 sm:text-lg">
              {event.description}
            </p>

            <motion.button
              type="button"
              onClick={() => onOpenGallery(event.id, 0)}
              className={`group relative mt-8 inline-flex items-center gap-3 rounded-full border border-white/15 bg-gradient-to-r ${event.accent} px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.15em] text-white shadow-lg shadow-black/40 transition hover:brightness-110`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              View Full Gallery
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} custom={0.1}>
          <EventImageGrid
            event={event}
            priority={index === 0}
            onImageClick={(i) => onOpenGallery(event.id, i)}
          />
        </motion.div>
      </div>
    </motion.article>
  );
}

export default function Gallery() {
  const [lightbox, setLightbox] = useState<{
    eventId: string;
    index: number;
  } | null>(null);

  const activeEvent = siteConfig.galleryEvents.find((e) => e.id === lightbox?.eventId);

  return (
    <section id="gallery" className="relative overflow-hidden border-t border-ink-line bg-ink py-24 sm:py-32">
      <FloatingOrbs />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="font-display text-sm uppercase tracking-[0.35em] text-gold"
          >
            {siteConfig.sections.gallery.kicker}
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={0.06}
            className="mt-3 font-display text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            {siteConfig.sections.gallery.heading}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={0.1}
            className="mx-auto mt-3 max-w-md text-sm uppercase tracking-[0.25em] text-white/50"
          >
            {siteConfig.sections.gallery.subheading}
          </motion.p>
          <motion.div
            variants={fadeUp}
            custom={0.14}
            className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent"
          />
        </motion.div>

        <div className="mt-16 space-y-20 sm:mt-20 sm:space-y-24 lg:space-y-28">
          {siteConfig.galleryEvents.map((event, index) => (
            <EventGallerySection
              key={event.id}
              event={event}
              index={index}
              onOpenGallery={(eventId, imageIndex) =>
                setLightbox({ eventId, index: imageIndex })
              }
            />
          ))}
        </div>
      </div>

      {activeEvent && (
        <GalleryLightbox
          images={[...activeEvent.images]}
          eventTitle={activeEvent.title}
          index={lightbox?.index ?? null}
          onClose={() => setLightbox(null)}
          onNavigate={(index) => setLightbox({ eventId: activeEvent.id, index })}
        />
      )}
    </section>
  );
}
