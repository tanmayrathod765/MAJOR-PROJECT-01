import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listMySessions } from "../api/sessionApi";

const statusStyles = {
  scheduled: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
};

const SessionList = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await listMySessions();

      if (response.success) {
        setSessions(response.sessions || []);
      } else {
        setError(response.message || "Unable to load sessions.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load sessions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-slate-600">Loading sessions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">
          Unable to load sessions
        </h2>
        <p className="mt-2 text-sm text-red-700">{error}</p>

        <button
          onClick={fetchSessions}
          className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Class Sessions
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Create and monitor live disaster preparedness drills.
          </p>
        </div>

        <Link
          to="/dashboard/sessions/new"
          className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Create New Session
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-slate-800">
            No sessions yet
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Create a class session to start monitoring student
            drill progress.
          </p>

          <Link
            to="/dashboard/sessions/new"
            className="mt-5 inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            Create New Session
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sessions.map((session) => {
            const statusClass =
              statusStyles[session.status] ||
              "bg-slate-100 text-slate-700";

            return (
              <div
                key={session._id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {session.scenario?.title ||
                        "Untitled Scenario"}
                    </h2>

                    <p className="mt-1 text-sm capitalize text-slate-500">
                      {session.scenario?.disasterType || "—"} •{" "}
                      {session.scenario?.difficulty || "—"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass}`}
                  >
                    {session.status}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">
                      Students
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {session.studentIds?.length || 0}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">
                      Created
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {formatDate(session.createdAt)}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/dashboard/sessions/${session._id}`}
                  className="mt-5 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View / Manage
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SessionList;