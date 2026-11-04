import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMockDrillAlert } from "../api/alertApi";
import { getMyInstitution } from "../api/institutionApi";

const MockDrillAlertCreate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", message: "", severity: "moderate", institution: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      let institution = form.institution;
      if (!institution) institution = (await getMyInstitution()).institution?._id;
      await createMockDrillAlert({ ...form, institution });
      navigate("/dashboard/alerts");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create mock drill alert.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><strong>MOCK DRILL:</strong> This creates a clearly labeled simulation alert, not a real emergency warning.</div>
      <h1 className="mt-6 text-3xl font-bold text-slate-900">Create Mock Drill Alert</h1>
      <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <input required placeholder="Drill title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-3" maxLength={160} />
        <textarea required placeholder="Instructions for participants" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="min-h-32 w-full rounded-lg border border-slate-300 px-4 py-3" maxLength={2000} />
        <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-3">
          <option value="low">Low</option><option value="moderate">Moderate</option><option value="high">High</option>
        </select>
        <button disabled={saving} className="rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white disabled:opacity-50">{saving ? "Creating..." : "Create mock drill"}</button>
      </form>
    </div>
  );
};

export default MockDrillAlertCreate;
