import Image from "next/image";
import { siteConfig } from "@/site.config";

type Props = {
  /** Preset sizes for common placements. */
  size?: "nav" | "footer" | "admin";
  priority?: boolean;
  className?: string;
};

const SIZES = {
  nav: { width: 180, height: 52, className: "h-10 w-auto sm:h-11" },
  footer: { width: 160, height: 46, className: "h-9 w-auto" },
  admin: { width: 220, height: 64, className: "h-14 w-auto sm:h-16" },
} as const;

export default function BrandLogo({
  size = "nav",
  priority = false,
  className = "",
}: Props) {
  const dims = SIZES[size];
  return (
    <Image
      src={siteConfig.assets.logo}
      alt={`${siteConfig.brandName} logo`}
      width={dims.width}
      height={dims.height}
      priority={priority}
      unoptimized
      className={`${dims.className} ${className}`.trim()}
    />
  );
}
