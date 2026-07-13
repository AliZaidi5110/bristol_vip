"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  videoSrc: string;
};

/**
 * Full-bleed autoplaying hero video. Lazy-loads the file so a large source
 * video (e.g. 1 GB+ WhatsApp export) does not block the initial page paint.
 * The poster image in Hero.tsx stays visible until the video can play.
 */
export default function HeroBackground({ videoSrc }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  // Defer fetching the video until after first paint / idle time.
  useEffect(() => {
    const start = () => setShouldLoad(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(start, 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;
    const video = videoRef.current;
    if (!video) return;

    video.load();
    const onCanPlay = () => {
      setReady(true);
      video.play().catch(() => {
        // Autoplay blocked — poster remains visible.
      });
    };
    video.addEventListener("canplay", onCanPlay);
    return () => video.removeEventListener("canplay", onCanPlay);
  }, [shouldLoad]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    >
      {shouldLoad && <source src={videoSrc} type="video/mp4" />}
    </video>
  );
}
