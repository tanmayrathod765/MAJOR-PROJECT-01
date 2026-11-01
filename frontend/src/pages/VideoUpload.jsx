import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createVideo, getVideo, updateVideo } from "../api/videoApi";

const categoryOptions = [
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

const VideoUpload = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    resourceType: "youtube",
    url: "",
    thumbnailUrl: "",
    category: "general",
    grade: "",
    sourceOrganization: "",
    status: "draft",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getVideo(id)
      .then((response) => {
        const { resource } = response;
        setForm({
          title: resource.title,
          description: resource.description,
          resourceType: resource.resourceType,
          url: resource.url,
          thumbnailUrl: resource.thumbnailUrl || "",
          category: resource.category,
          grade: resource.grade || "",
          sourceOrganization: resource.sourceOrganization || "",
          status: resource.status,
        });
      })
      .catch((err) => setError(err.response?.data?.message || "Unable to load resource."));
  }, [id]);

  const update = (field, value) => setForm({ ...form, [field]: value });

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (id) await updateVideo(id, form);
      else await createVideo(form);
      navigate("/dashboard/videos/manage");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save resource.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900">{id ? "Edit Video Resource" : "Upload Video Resource"}</h1>
      <p className="mt-2 text-slate-500">URL-based resources are supported. Direct file uploads require secure media storage.</p>
      {error && <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
      <form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <input required value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Title" className="w-full rounded-lg border border-slate-300 px-3 py-3" />
        <textarea required value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Short description" rows={4} className="w-full rounded-lg border border-slate-300 px-3 py-3" />
        <div className="grid gap-4 sm:grid-cols-2">
          <select value={form.resourceType} onChange={(event) => update("resourceType", event.target.value)} className="rounded-lg border border-slate-300 px-3 py-3">
            <option value="youtube">YouTube video</option>
            <option value="external">External resource page</option>
          </select>
          <select value={form.category} onChange={(event) => update("category", event.target.value)} className="rounded-lg border border-slate-300 px-3 py-3">
            {categoryOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <input required value={form.url} onChange={(event) => update("url", event.target.value)} placeholder="https://..." className="w-full rounded-lg border border-slate-300 px-3 py-3" />
        <div className="grid gap-4 sm:grid-cols-3">
          <input value={form.grade} onChange={(event) => update("grade", event.target.value)} placeholder="Grade (optional)" className="rounded-lg border border-slate-300 px-3 py-3" />
          <input value={form.sourceOrganization} onChange={(event) => update("sourceOrganization", event.target.value)} placeholder="Source organization" className="rounded-lg border border-slate-300 px-3 py-3" />
          <input value={form.thumbnailUrl} onChange={(event) => update("thumbnailUrl", event.target.value)} placeholder="Thumbnail URL (optional)" className="rounded-lg border border-slate-300 px-3 py-3" />
        </div>
        <select value={form.status} onChange={(event) => update("status", event.target.value)} className="rounded-lg border border-slate-300 px-3 py-3">
          <option value="draft">Save as draft</option>
          <option value="published">Publish</option>
        </select>
        <button disabled={saving} className="rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
          {saving ? "Saving..." : id ? "Save Changes" : "Save Resource"}
        </button>
      </form>
    </div>
  );
};

export default VideoUpload;
