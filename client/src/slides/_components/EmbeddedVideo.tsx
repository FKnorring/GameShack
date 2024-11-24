interface EmbeddedVideoProps {
  url: string;
}

function EmbeddedVideo({ url }: EmbeddedVideoProps) {
  const youtubeId = url.split("v=")[1];
  const src = `https://www.youtube.com/embed/${youtubeId}`;
  return (
    <div className="aspect-w-16 aspect-h-9 justify-self-center">
      <iframe
        width="560"
        height="315"
        src={src}
        title="YouTube video player"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}

export default EmbeddedVideo;
