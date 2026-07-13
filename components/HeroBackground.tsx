"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  videoSrc: string;
};

/**
 * Full-bleed autoplaying hero video behind all landing-page text.
 * Poster image in Hero.tsx stays visible until the first frame is ready.
 */
export default function HeroBackground({ videoSrc }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const startPlayback = () => {
      setReady(true);
      video.play().catch(() => {
        // Autoplay blocked — poster remains visible.
      });
    };

    // loadeddata fires sooner than canplay — better for large files.
    video.addEventListener("loadeddata", startPlayback);
    video.load();

    return () => video.removeEventListener("loadeddata", startPlayback);
  }, [videoSrc]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      className={`absolute inset-0 z-[1] h-full w-full object-cover transition-opacity duration-1000 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    >
      <source src={videoSrc} type="video/mp4" />
    </video>
  );
}
