/**
 * -----------------------------------------------------------------------------
 * SITE CONFIG — edit everything about your brand here.
 * -----------------------------------------------------------------------------
 * Copy sourced from https://www.bristolvip.co.uk
 *
 * NOTE: The "Get Tickets" link is stored in KV / Supabase and edited from /admin.
 */

export type SocialLink = {
  label: string;
  href: string;
};

export const siteConfig = {
  brandName: "Bristol VIP Events",

  description:
    "Bristol VIP Events Ltd — a Bristol-based grassroots events company creating vibrant, community-led music and cultural experiences across the city. In love with their city.",

  tagline: "In love with their city...",

  heroKicker: "Bristol VIP",

  contactEmail: "bristolvip1@gmail.com",

  location: "Bristol, United Kingdom",

  website: "https://www.bristolvip.co.uk",

  assets: {
    logo: "/images/logo.png",
    heroPoster: "/images/IMG_8028.JPG.jpeg",
    heroVideo: "/videos/hero-compressed.mp4",
    eventFlyer: "/images/IMG_8018.JPG.jpeg",
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

  socials: {
    instagram: "https://instagram.com/bristol_vip_events",
  } as Record<string, string>,

  instagramHandle: "@bristol_vip_events",

  featuredEvent: {
    title: "Jamaican Independence Day",
    date: "Coming Soon",
    location: "Bristol, United Kingdom",
    description:
      "Celebrate Jamaican Independence with Bristol VIP — culture, music and pure vibes. Check our last event and get ready for the next one.",
  },

  about: {
    heading: "Bristol VIP Events",
    paragraphs: [
      "Bristol VIP is now in their 8th year of curating unforgettable events across the city. Known locally for highlights like the Rum Punch Festival, Block Party, Jamaican Independence Day and involvement in St Pauls Carnival.",
      "Bristol VIP Events Ltd is a Bristol-based grassroots events company creating vibrant, community-led music and cultural experiences across the city.",
      "The buzz of a Bristol VIP party is always the talk of the city and has people reminiscing for many days, weeks and months afterwards.",
    ],
  },

  sections: {
    upcomingEvents: {
      kicker: "Don't Miss Out",
      heading: "Upcoming Events",
    },
    gallery: {
      kicker: "Check our last event!",
      heading: "VIBES!",
      subheading: "Gallery",
    },
    contact: {
      kicker: "Get Booked in!",
      heading: "Contact Us",
      description:
        "Have questions about our events? Want to book Bristol VIP for your next celebration? We'd love to hear from you!",
      formHeading: "How can we assist you?",
      formSubtext: "Complete your details below and we'll get back to you.",
    },
    mailingList: {
      heading: "Our Mailing List",
      description:
        "The buzz of a Bristol VIP party is always the talk of the city and has people reminiscing for many days, weeks and months afterwards. Join our mailing list to be the first in the know of all events, promotions and offers!",
    },
  },

  ctas: {
    heroSecondary: "Check our last event! VIBES!",
    heroSecondaryHref: "#gallery",
    getTickets: "Get Tickets",
    getBookedIn: "Get Booked in!",
  },
} as const;

export type SiteConfig = typeof siteConfig;
