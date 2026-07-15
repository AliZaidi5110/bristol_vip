"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, CalendarDays, Camera, MapPin } from "lucide-react";
import { siteConfig, type GalleryEvent } from "@/site.config";
import GalleryLightbox from "./GalleryLightbox";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-16 top-2/3 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-rose-500/8 blur-3xl"
        animate={{ y: [0, 60, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-gold/40"
          style={{
            left: `${8 + ((i * 17) % 84)}%`,
            top: `${6 + ((i * 23) % 88)}%`,
          }}
          animate={{
            y: [0, -18 - (i % 5) * 6, 0],
            opacity: [0.15, 0.65, 0.15],
          }}
          transition={{
            duration: 4 + (i % 4),
            repeat: Infinity,
            delay: i * 0.25,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function EventImageGrid({
  event,
  onImageClick,
}: {
  event: GalleryEvent;
  onImageClick: (index: number) => void;
}) {
  const [featured, ...supporting] = event.images;

  return (
    <div className="grid h-full min-h-[320px] grid-cols-2 grid-rows-2 gap-3 sm:min-h-[400px] sm:gap-4 lg:min-h-[480px]">
      <button
        type="button"
        onClick={() => onImageClick(0)}
        className="gallery-photo group relative col-span-1 row-span-2 min-h-[220px] overflow-hidden rounded-[20px] border border-white/10 bg-ink-card shadow-lg shadow-black/40 sm:min-h-0"
        aria-label={`View featured ${event.title} photo`}
      >
        <Image
          src={featured}
          alt={`${event.title} featured`}
          fill
          sizes="(max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
        <div className={`absolute inset-0 bg-gradient-to-tr ${event.accent} opacity-20 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-35`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80" />
      </button>

      {supporting.map((src, i) => (
        <button
          key={src}
          type="button"
          onClick={() => onImageClick(i + 1)}
          className="gallery-photo group relative min-h-[100px] overflow-hidden rounded-[20px] border border-white/10 bg-ink-card shadow-lg shadow-black/40 sm:min-h-0"
          aria-label={`View ${event.title} photo ${i + 2}`}
        >
          <Image
            src={src}
            alt={`${event.title} ${i + 2}`}
            fill
            sizes="(max-width: 1024px) 25vw, 20vw"
            loading="lazy"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90" />
        </button>
      ))}
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
      viewport={{ once: true, margin: "-80px" }}
    >
      <div
        className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20 ${
          reversed ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        <motion.div variants={fadeUp} custom={0.05} className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-white/[0.04] to-transparent blur-xl" />
          <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl sm:p-10">
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-white/80 backdrop-blur-sm`}
              >
                <CalendarDays className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                {event.date}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-white/80 backdrop-blur-sm">
                <MapPin className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                {event.location}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
                <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                4 Photos
              </span>
            </div>

            <h3 className="mt-6 font-display text-3xl font-bold uppercase leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
              {event.title}
            </h3>

            <p className="mt-5 max-w-md text-base leading-relaxed text-white/70 sm:text-lg">
              {event.description}
            </p>

            <motion.button
              type="button"
              onClick={() => onOpenGallery(event.id, 0)}
              className={`group mt-8 inline-flex items-center gap-3 rounded-full border border-white/15 bg-gradient-to-r ${event.accent} px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.15em] text-white shadow-lg shadow-black/30 transition hover:scale-[1.02] hover:shadow-xl`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              View Full Gallery
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} custom={0.15}>
          <EventImageGrid event={event} onImageClick={(i) => onOpenGallery(event.id, i)} />
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
          viewport={{ once: true, margin: "-60px" }}
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
            custom={0.08}
            className="mt-3 font-display text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            {siteConfig.sections.gallery.heading}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={0.14}
            className="mx-auto mt-3 max-w-md text-sm uppercase tracking-[0.25em] text-white/50"
          >
            {siteConfig.sections.gallery.subheading}
          </motion.p>
          <motion.div
            variants={fadeUp}
            custom={0.2}
            className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent"
          />
        </motion.div>

        <div className="mt-20 space-y-24 sm:space-y-28 lg:space-y-32">
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
