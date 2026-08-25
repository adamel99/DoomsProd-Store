const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
]);

const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export function getYouTubeVideoId(url) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (!YOUTUBE_HOSTS.has(hostname)) return null;

    const videoId = hostname === "youtu.be"
      ? parsedUrl.pathname.split("/").filter(Boolean)[0]
      : parsedUrl.pathname.startsWith("/embed/") || parsedUrl.pathname.startsWith("/shorts/")
        ? parsedUrl.pathname.split("/").filter(Boolean)[1]
        : parsedUrl.searchParams.get("v");

    return VIDEO_ID_PATTERN.test(videoId || "") ? videoId : null;
  } catch {
    return null;
  }
}

export function getYouTubeEmbedUrl(url) {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}
