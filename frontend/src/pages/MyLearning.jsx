import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyVideoProgress } from "../api/videoApi";

const MyLearning = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyVideoProgress()
      .then((response) => setItems(response.progress || []))
      .catch((err) => setError(err.response?.data?.message || "Unable to load learning progress."));
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Learning</h1>
        <p className="mt-2 text-slate-500">Resources you have marked as completed.</p>
      </div>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
      {!error && items.length === 0 && <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-500">No completed resources yet.</div>}
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => item.resource && (
          <Link key={item._id} to={`/dashboard/videos/${item.resource._id}`} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-800">
            <h2 className="font-bold text-slate-900">{item.resource.title}</h2>
            <p className="mt-2 text-sm capitalize text-slate-500">{item.resource.category.replace("-", " ")}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MyLearning;
