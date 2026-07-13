/**
 * -----------------------------------------------------------------------------
 * SITE CONFIG — edit everything about your brand here.
 * -----------------------------------------------------------------------------
 * This is the single place to change brand name, contact details, social links,
 * marketing copy, and which image files are used. No other files need editing
 * to rebrand the site.
 *
 * NOTE: The "Get Tickets" link is intentionally NOT here — it is stored in
 * Supabase (site_settings table) and edited live from the /admin dashboard.
 */

export type SocialLink = {
  label: string;
  href: string;
};

export const siteConfig = {
  /** Brand name shown in the navbar, footer, metadata, etc. */
  brandName: "Bristol VIP",

  /** One-line SEO description. */
  description:
    "Bristol VIP — premium club nights, bottomless brunches and unforgettable cultural events across the city. We Dine. We Drink. We Dance.",

  /** Hero tagline (big text over the landing image). */
  tagline: "We Dine. We Drink. We Dance.",

  /** Short label above the tagline in the hero. */
  heroKicker: "Bristol's Premium Nightlife",

  /** Contact email used in footer + contact form fallback. */
  contactEmail: "hello@bristolvip.example",

  /**
   * Brand media. Real event photos live in /public/images. Drop your hero video
   * into /public/videos as IMG_8136.MP4 (from WhatsApp).
   */
  assets: {
    logo: "/images/logo.png",
    /** Poster/fallback image shown while the hero video loads (or if missing). */
    heroPoster: "/images/IMG_8028.JPG.jpeg",
    /** Full-bleed background video on the landing page hero (compressed for web). */
    heroVideo: "/videos/hero-compressed.mp4",
    /** Featured event flyer — carnival / Rum Punch stage shot. */
    eventFlyer: "/images/IMG_8018.JPG.jpeg",
    /** About section accent photo. */
    aboutImage: "/images/IMG_8036.JPG.jpeg",
    gallery: [
      "/images/IMG_7988.JPG.jpeg",
      "/images/IMG_7992.JPG.jpeg",
      "/images/IMG_8015.JPG.jpeg",
      "/images/IMG_8019.JPG.jpeg",
      "/images/IMG_8021.JPG.jpeg",
      "/images/IMG_8028.JPG.jpeg",
      "/images/IMG_8036.JPG.jpeg",
      "/images/IMG_8049.JPG.jpeg",
      "/images/IMG_8053.JPG.jpeg",
      "/images/IMG_8055.JPG.jpeg",
      "/images/IMG_8057.JPG.jpeg",
      "/images/IMG_8018.JPG.jpeg",
    ],
  },

  /**
   * Social links. Delete any you don't use — the footer/nav render only what's
   * present here.
   */
  socials: {
    instagram: "https://instagram.com/",
    whatsapp: "https://wa.me/440000000000",
    tiktok: "https://tiktok.com/",
  } as Record<string, string>,

  /** The current / next event spotlight card on the home page. */
  featuredEvent: {
    title: "Jamaica Independence Party",
    date: "Saturday, 1 August 2026",
    location: "Central Bristol",
    description:
      "Celebrate freedom, culture and rhythm as we turn the city gold, green and black for one unforgettable night. Live sound systems, island flavours and the best of Caribbean energy — this is the party the summer has been waiting for.",
  },

  /** About section — original copy. Edit freely. */
  about: {
    heading: "Who We Are",
    paragraphs: [
      "Bristol VIP was born from a simple belief: a night out should feel like an occasion. We create premium events that bring the city together — from intimate rooftop sessions to sold-out club nights and bottomless daytime brunches that spill effortlessly into the evening.",
      "Over the years we've built a reputation for detail. The right room, the right sound, a crowd that knows how to celebrate, and moments you'll be talking about long after the lights come up. Every guest list, every playlist and every pour is chosen with intention.",
      "Whatever we're throwing next, one promise stays the same — you dine well, you drink well, and you dance like the night belongs to you. Because with us, it does.",
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
