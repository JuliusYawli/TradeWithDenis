export function HeroVideo({ videoUrl, imageUrl, fallbackImage }: { videoUrl?: string | null; imageUrl?: string | null; fallbackImage: string }) {
  if (!videoUrl) {
    return (
      <img
        alt="TradeWithDennis hero"
        width={1800}
        height={900}
        src={imageUrl || fallbackImage}
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

    return (
      <iframe
        className="h-full w-full"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`}
        frameBorder="0"
        allow="autoplay; muted"
        allowFullScreen
      />
    );
  }

  if (isVimeo) {
    const videoId = videoUrl.split("vimeo.com/")[1]?.split("?")[0];

    return (
      <iframe
        className="h-full w-full"
        src={`https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&controls=0&loop=1`}
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
    );
  }

  return (
    <video
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
      <img alt="TradeWithDennis hero" src={imageUrl || fallbackImage} />
    </video>
  );
}
