import Image from "next/image";
import { Mail } from "lucide-react";
import { siteConfig } from "@/site.config";
import ContactForm from "./ContactForm";
import SocialIcons from "./SocialIcons";
import Reveal from "./Reveal";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer id="contact" className="border-t border-ink-line bg-ink-soft">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="font-display text-sm uppercase tracking-[0.35em] text-gold">
              Say Hello
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl">
              Get In Touch
            </h2>
            <p className="mt-4 max-w-md text-white/70">
              Planning something special or want to be first on the guest list?
              Drop us a message and our team will get back to you.
            </p>

            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="mt-6 inline-flex items-center gap-2 text-white/80 transition-colors hover:text-gold"
            >
              <Mail className="h-5 w-5 text-gold" aria-hidden="true" />
              {siteConfig.contactEmail}
            </a>

            <SocialIcons className="mt-6" />
          </Reveal>

          <Reveal delay={120}>
            <ContactForm />
          </Reveal>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-ink-line pt-8 sm:flex-row">
          <div className="flex items-center gap-3">
            <Image
              src={siteConfig.assets.logo}
              alt={`${siteConfig.brandName} logo`}
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <span className="font-display text-sm uppercase tracking-[0.2em] text-white/80">
              {siteConfig.brandName}
            </span>
          </div>
          <p className="text-sm text-white/50">
            &copy; {year} {siteConfig.brandName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
