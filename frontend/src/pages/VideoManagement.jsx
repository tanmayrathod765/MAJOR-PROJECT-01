import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteVideo, listVideos } from "../api/videoApi";
import { useAuth } from "../context/AuthContext";

const VideoManagement = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const response = await listVideos({ manage: "true" });
      setResources(response.resources || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load managed resources.");
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this video resource?")) return;
    try {
      await deleteVideo(id);
      setResources(resources.filter((resource) => resource._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete resource.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Video Management</h1>
          <p className="mt-2 text-slate-500">Manage your resources and curated learning links.</p>
        </div>
        <Link to="/dashboard/videos/new" className="rounded-lg bg-blue-900 px-4 py-3 font-semibold text-white">Add Resource</Link>
      </div>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr><th className="px-5 py-3">Title</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th></tr>
          </thead>
          <tbody>
            {resources.map((resource) => (
              <tr key={resource._id} className="border-b border-slate-100">
                <td className="px-5 py-4 font-semibold">{resource.title}</td>
                <td className="px-5 py-4 capitalize">{resource.category.replace("-", " ")}</td>
                <td className="px-5 py-4">{resource.resourceType}</td>
                <td className="px-5 py-4 capitalize">{resource.status}</td>
                <td className="flex gap-3 px-5 py-4">
                  {(resource.sourceKind === "teacher" || user?.role === "admin") && <Link to={`/dashboard/videos/edit/${resource._id}`} className="font-semibold text-blue-800">Edit</Link>}
                  {(resource.sourceKind === "teacher" || user?.role === "admin") && <button type="button" onClick={() => remove(resource._id)} className="font-semibold text-red-700">Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VideoManagement;
