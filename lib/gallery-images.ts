import { siteConfig } from "@/site.config";

/** All site photos available for the admin upcoming-event image picker. */
export function getGalleryPickerImages(): string[] {
  const set = new Set<string>();

  set.add(siteConfig.assets.eventFlyer);
  set.add(siteConfig.assets.aboutImage);
  set.add(siteConfig.assets.heroPoster);

  for (const src of siteConfig.assets.gallery) {
    set.add(src);
  }

  for (const event of siteConfig.galleryEvents) {
    for (const src of event.images) {
      set.add(src);
    }
  }

  return Array.from(set);
}

export function isLocalImagePath(value: string): boolean {
  return (
    value.startsWith("/images/") &&
    !value.includes("..") &&
    /\.(jpe?g|png|webp|gif)$/i.test(value)
  );
}
