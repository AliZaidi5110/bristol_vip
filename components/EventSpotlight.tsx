import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";
import { siteConfig } from "@/site.config";
import type { SiteEventSettings } from "@/lib/settings";
import GetTicketsButton from "./GetTicketsButton";
import Reveal from "./Reveal";

export default function EventSpotlight({ event }: { event: SiteEventSettings }) {
  return (
    <section
      id="event"
      className="relative border-t border-ink-line bg-ink-soft py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="text-center font-display text-sm uppercase tracking-[0.35em] text-gold">
            {siteConfig.sections.upcomingEvents.kicker}
          </p>
          <h2 className="mt-3 text-center font-display text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl">
            {siteConfig.sections.upcomingEvents.heading}
          </h2>
        </Reveal>

        <Reveal delay={120} className="mt-12">
          <div className="grid overflow-hidden rounded-2xl border border-ink-line bg-ink-card shadow-2xl lg:grid-cols-2">
            <div className="relative aspect-[4/5] w-full lg:aspect-auto lg:min-h-[480px]">
              <Image
                src={siteConfig.assets.eventFlyer}
                alt={`${event.title} flyer`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>

            <div className="flex flex-col justify-center gap-6 p-8 sm:p-12">
              <div>
                <span className="inline-block rounded-full border border-gold/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
                  Featured
                </span>
                <h3 className="mt-4 font-display text-3xl font-bold uppercase leading-tight text-white sm:text-4xl">
                  {event.title}
                </h3>
              </div>

              <div className="space-y-2 text-white/80">
                <p className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-gold" aria-hidden="true" />
                  {event.date}
                </p>
                <p className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gold" aria-hidden="true" />
                  {event.location}
                </p>
              </div>

              <p className="text-white/70">{event.description}</p>

              <div className="pt-2">
                <GetTicketsButton
                  href={event.ticketLink}
                  className="!px-8 !py-4 text-base"
                />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
