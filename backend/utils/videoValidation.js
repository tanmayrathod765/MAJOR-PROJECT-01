const parseYouTubeVideoId = (value) => {
  let url;

  try {
    url = new URL(value);
  } catch {
    return null;
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");

  if (hostname === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  }

  if (hostname !== "youtube.com" && hostname !== "m.youtube.com") {
    return null;
  }

  let id = "";

  if (url.pathname === "/watch") {
    id = url.searchParams.get("v") || "";
  } else if (url.pathname.startsWith("/embed/")) {
    id = url.pathname.split("/")[2] || "";
  }

  return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
};

const validateResourceUrl = (resourceType, value) => {
  let url;

  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return null;
  }

  if (resourceType === "youtube") {
    return parseYouTubeVideoId(value);
  }

  if (resourceType === "external") {
    return true;
  }

  return null;
};

module.exports = {
  parseYouTubeVideoId,
  validateResourceUrl,
};
