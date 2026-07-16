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

export type GalleryEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  /** CSS gradient accent used for badges and glow effects. */
  accent: string;
  /** First image is the large featured shot; remaining three are supporting. */
  images: readonly [string, string, string, string];
};

export const siteConfig = {
  brandName: "Bristol VIP Events",

  description:
    "Bristol VIP Events Ltd — a Bristol-based grassroots events company creating vibrant, community-led music and cultural experiences across the city. In love with their city.",

  tagline: "In love with their city...",

  heroKicker: "Bristol VIP",

  contactEmail: "bristolvip1@gmail.com",

  /** UK mobile — shown on site; wa.me uses international format without leading 0. */
  whatsappPhone: "07894946374",
  whatsappIntl: "447894946374",

  location: "Bristol, United Kingdom",

  website: "https://www.bristolvip.co.uk",

  assets: {
    logo: "/images/logo_2.png",
    heroPoster: "/images/IMG_8028.JPG.jpeg",
    heroVideo: "/videos/hero-web.mp4",
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

  galleryEvents: [
    {
      id: "rum-punch",
      title: "Rum Punch Festival",
      description:
        "Caribbean culture, tropical atmosphere, live DJs, food and drinks.",
      date: "Summer Season",
      location: "Bristol, UK",
      accent: "from-amber-500 via-orange-500 to-rose-500",
      images: [
        "/images/rum_punch/IMG_8018.JPG.jpeg",
        "/images/rum_punch/IMG_8021.JPG.jpeg",
        "/images/rum_punch/IMG_7992.JPG.jpeg",
        "/images/rum_punch/IMG_8057.JPG.jpeg",
      ],
    },
    {
      id: "block-party",
      title: "Block Party",
      description:
        "Street entertainment, music, dancing, local community celebrations.",
      date: "Street Sessions",
      location: "Bristol, UK",
      accent: "from-violet-500 via-purple-500 to-fuchsia-500",
      images: [
        "/images/block party/img_1.jpeg",
        "/images/block party/img_2.jpeg",
        "/images/block party/img_3.jpeg",
        "/images/block party/img_4.jpg",
      ],
    },
    {
      id: "st-pauls-carnival",
      title: "St Pauls Carnival – Campbell Street",
      description:
        "Vibrant carnival costumes, parade performances, cultural celebration.",
      date: "Carnival Weekend",
      location: "Campbell Street, Bristol",
      accent: "from-pink-500 via-rose-500 to-orange-400",
      images: [
        "/images/st_pauls_carnival/dsc00444.jpg",
        "/images/st_pauls_carnival/dsc00192.jpg",
        "/images/st_pauls_carnival/dsc00484.jpg",
        "/images/st_pauls_carnival/dsc00186.jpg",
      ],
    },
    {
      id: "jamaican-independence",
      title: "Jamaican Independence Celebration",
      description:
        "Jamaican heritage, reggae music, cultural performances, national pride.",
      date: "Independence Day",
      location: "Bristol, UK",
      accent: "from-emerald-500 via-green-500 to-gold",
      images: [
        "/images/jamaican independence/IMG_7988.JPG.jpeg",
        "/images/jamaican independence/IMG_0001.JPG.jpeg",
        "/images/jamaican independence/IMG_0034.JPG.jpeg",
        "/images/jamaican independence/IMG_0037.JPG.jpeg",
      ],
    },
  ] satisfies readonly GalleryEvent[],

  socials: {
    instagram: "https://instagram.com/bristol_vip_events",
    whatsapp:
      "https://wa.me/447894946374?text=Hi%20Bristol%20VIP%20Events%2C%20I%27d%20like%20to%20get%20in%20touch.",
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
