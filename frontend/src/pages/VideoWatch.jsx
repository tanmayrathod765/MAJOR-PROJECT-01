import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getVideo, updateVideoProgress } from "../api/videoApi";

const VideoWatch = () => {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getVideo(id)
      .then((response) => {
        setResource(response.resource);
        setProgress(response.progress);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Unable to load resource.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const markCompleted = async () => {
    try {
      setSaving(true);
      const response = await updateVideoProgress(id, true);
      setProgress(response.progress);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save progress.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-slate-500">Loading resource...</p>;
  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>;
  }

  const embedUrl = resource.youtubeVideoId
    ? `https://www.youtube.com/embed/${resource.youtubeVideoId}`
    : "";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/dashboard/videos" className="font-semibold text-blue-900 hover:underline">
        ← Back to Video Learning
      </Link>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-800">
          {resource.category.replace("-", " ")}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{resource.title}</h1>
        <p className="mt-3 text-slate-600">{resource.description}</p>
        {resource.sourceOrganization && (
          <p className="mt-2 text-sm text-slate-500">Source: {resource.sourceOrganization}</p>
        )}
      </div>
      {resource.resourceType === "youtube" ? (
        <div className="aspect-video overflow-hidden rounded-2xl bg-black shadow-sm">
          <iframe
            src={embedUrl}
            title={resource.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-8">
          <p className="text-slate-700">
            This is an external educational resource page, not an embedded video.
          </p>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Open Resource in New Tab
          </a>
        </div>
      )}
      <button
        type="button"
        onClick={markCompleted}
        disabled={saving || progress?.completed}
        className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {progress?.completed ? "Completed" : saving ? "Saving..." : "Mark as Completed"}
      </button>
    </div>
  );
};

export default VideoWatch;
