"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  videoSrc: string;
  posterSrc: string;
};

/**
 * Full-bleed autoplaying hero video.
 * Poster shows instantly; the compressed MP4 starts as soon as a short buffer is ready.
 */
export default function HeroBackground({ videoSrc, posterSrc }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    let idleHandle: number | undefined;

    const tryPlay = () => {
      if (cancelled) return;
      setReady(true);
      void video.play().catch(() => {
        // Autoplay may be blocked — poster remains visible.
      });
    };

    video.addEventListener("canplay", tryPlay);
    video.addEventListener("loadeddata", tryPlay);

    video.preload = "metadata";
    video.load();

    const bumpPreload = () => {
      if (cancelled || !videoRef.current) return;
      videoRef.current.preload = "auto";
      void videoRef.current.play().catch(() => {});
    };

    if (typeof window.requestIdleCallback === "function") {
      idleHandle = window.requestIdleCallback(bumpPreload, { timeout: 1200 });
    } else {
      idleHandle = setTimeout(bumpPreload, 350) as unknown as number;
    }

    if (video.readyState >= 3) tryPlay();

    return () => {
      cancelled = true;
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("loadeddata", tryPlay);
      if (idleHandle !== undefined) {
        if (typeof window.cancelIdleCallback === "function") {
          window.cancelIdleCallback(idleHandle);
        } else {
          clearTimeout(idleHandle);
        }
      }
    };
  }, [videoSrc]);

  return (
    <video
      ref={videoRef}
      src={`${videoSrc}#t=0.001`}
      poster={posterSrc}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
      aria-hidden="true"
      className={`absolute inset-0 z-[1] h-full w-full object-cover transition-opacity duration-500 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
