import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listVideos } from "../api/videoApi";

const categories = [
  ["", "All categories"],
  ["earthquake", "Earthquake Safety"],
  ["fire", "Fire Safety"],
  ["flood", "Flood Preparedness"],
  ["first-aid", "First Aid"],
  ["emergency-response", "Emergency Response"],
  ["heat-wave", "Heat Wave"],
  ["lightning", "Lightning Safety"],
  ["school-safety", "School Safety"],
  ["general", "General Preparedness"],
];

const VideoLibrary = () => {
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    grade: "",
    sort: "newest",
  });
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const response = await listVideos(filters);
        if (active) setResources(response.resources || []);
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || "Unable to load video resources."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [filters]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-medium text-blue-800">Safety Education</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Video Learning
        </h1>
        <p className="mt-2 text-slate-500">
          Learn from curated and teacher-shared disaster preparedness resources.
        </p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={filters.search}
          onChange={(event) =>
            setFilters({ ...filters, search: event.target.value })
          }
          placeholder="Search videos and resources"
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-800"
        />
        <select
          value={filters.category}
          onChange={(event) =>
            setFilters({ ...filters, category: event.target.value })
          }
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          {categories.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={filters.grade}
          onChange={(event) =>
            setFilters({ ...filters, grade: event.target.value })
          }
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">All grades</option>
          {["8", "9", "10", "11", "12"].map((grade) => (
            <option key={grade} value={grade}>Grade {grade}</option>
          ))}
        </select>
        <select
          value={filters.sort}
          onChange={(event) =>
            setFilters({ ...filters, sort: event.target.value })
          }
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="newest">Newest first</option>
          <option value="title">Title A-Z</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}
      {loading && <p className="text-slate-500">Loading resources...</p>}
      {!loading && !error && resources.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          No published video resources match your search.
        </div>
      )}
      {!loading && resources.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <article
              key={resource._id}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              {resource.thumbnailUrl ? (
                <img
                  src={resource.thumbnailUrl}
                  alt=""
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div className="flex h-40 items-center justify-center bg-blue-950 text-4xl font-black text-white">
                  ▶
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-800">
                  {resource.category.replace("-", " ")}
                </span>
                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  {resource.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                  {resource.description}
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  {resource.sourceOrganization || "DisasterReady educator"}
                </p>
                <Link
                  to={`/dashboard/videos/${resource._id}`}
                  className="mt-5 rounded-lg bg-blue-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-800"
                >
                  {resource.resourceType === "youtube"
                    ? "Watch Video"
                    : "Open Resource"}
                </Link>
                {resource.progress?.completed && (
                  <p className="mt-2 text-center text-xs font-semibold text-green-700">
                    Completed
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoLibrary;
