"use client";

import Image from "next/image";
import { useEffect, useRef, type RefObject } from "react";

function PhoneScreenLogo({ logoRef }: { logoRef?: RefObject<HTMLImageElement | null> }) {
  return (
    <Image
      src="/logo-transparent.svg"
      alt=""
      width={300}
      height={127}
      ref={logoRef}
      aria-hidden="true"
      className="hero-phone-logo pointer-events-none absolute z-10 h-auto object-contain"
    />
  );
}

export function HeroVideo({ videoUrl, imageUrl, fallbackImage }: { videoUrl?: string | null; imageUrl?: string | null; fallbackImage: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const logo = logoRef.current;
    if (!video || !logo) return;

    const points = [
      { time: 0, x: 51.3, y: 45.4, scale: 1, rotate: 2.3 },
      { time: 2, x: 53, y: 44.8, scale: 0.99, rotate: 2.8 },
      { time: 4, x: 50.3, y: 45.7, scale: 0.96, rotate: 2.4 },
      { time: 6, x: 50, y: 47.2, scale: 0.96, rotate: 2.1 },
      { time: 8, x: 51.5, y: 46.5, scale: 0.97, rotate: 2.2 },
      { time: 10, x: 52.7, y: 46.3, scale: 0.97, rotate: 2.5 },
      { time: 12, x: 51.5, y: 43.5, scale: 0.97, rotate: 3.1 },
      { time: 14, x: 52.1, y: 44.8, scale: 0.97, rotate: 2.6 },
      { time: 16, x: 53.8, y: 45.6, scale: 0.97, rotate: 2.5 },
      { time: 16.52, x: 51.3, y: 45.4, scale: 1, rotate: 2.3 }
    ];

    let animationFrame = 0;
    const update = () => {
      const time = video.currentTime || 0;
      const nextIndex = Math.max(1, points.findIndex((point) => point.time >= time));
      const start = points[nextIndex - 1];
      const end = points[nextIndex] || points[points.length - 1];
      const progress = end.time === start.time ? 0 : Math.min(1, Math.max(0, (time - start.time) / (end.time - start.time)));
      const mix = (from: number, to: number) => from + (to - from) * progress;

      logo.style.left = `${mix(start.x, end.x)}%`;
      logo.style.top = `${mix(start.y, end.y)}%`;
      logo.style.transform = `translate(-50%, -50%) scale(${mix(start.scale, end.scale)}) rotate(${mix(start.rotate, end.rotate)}deg)`;
      animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [videoUrl]);

  if (!videoUrl) {
    return (
      <Image
        alt="TradeWithDennis hero"
        width={1800}
        height={900}
        src={imageUrl || fallbackImage}
        unoptimized
        className="h-full w-full object-cover"
      />
    );
  }

  const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
  const isVimeo = videoUrl.includes("vimeo.com");

  if (isYouTube) {
    const videoId = videoUrl.includes("youtu.be")
      ? videoUrl.split("youtu.be/")[1]?.split("?")[0]
      : videoUrl.split("v=")[1]?.split("&")[0];

    return <div className="relative h-full w-full overflow-hidden">
      <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`}
          frameBorder="0"
          allow="autoplay; muted"
          allowFullScreen
        />
      <PhoneScreenLogo />
    </div>;
  }

  if (isVimeo) {
    const videoId = videoUrl.split("vimeo.com/")[1]?.split("?")[0];

    return <div className="relative h-full w-full overflow-hidden">
      <iframe
          className="h-full w-full"
          src={`https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&controls=0&loop=1`}
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      <PhoneScreenLogo />
    </div>;
  }

  return <div className="relative h-full w-full overflow-hidden">
    <video
        ref={videoRef}
        className="h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={imageUrl || fallbackImage}
        controls={false}
      >
        <source src={videoUrl} type="video/mp4" />
        <Image alt="TradeWithDennis hero" src={imageUrl || fallbackImage} width={1800} height={900} unoptimized />
      </video>
    <PhoneScreenLogo logoRef={logoRef} />
  </div>;
}
