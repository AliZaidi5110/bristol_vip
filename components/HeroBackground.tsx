"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  videoSrc: string;
  posterSrc: string;
};

/**
 * Full-bleed autoplaying hero video behind all landing-page text.
 */
export default function HeroBackground({ videoSrc, posterSrc }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      setReady(true);
      void video.play().catch(() => {
        // Autoplay blocked on some browsers — poster stays visible.
      });
    };

    video.addEventListener("loadeddata", play);
    if (video.readyState >= 2) play();

    return () => video.removeEventListener("loadeddata", play);
  }, [videoSrc]);

  return (
    <video
      ref={videoRef}
      src={videoSrc}
      poster={posterSrc}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      className={`absolute inset-0 z-[1] h-full w-full object-cover transition-opacity duration-700 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
