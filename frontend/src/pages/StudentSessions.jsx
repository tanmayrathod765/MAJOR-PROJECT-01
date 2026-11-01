import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getMySessions } from "../api/sessionApi";

const StudentSessions = () => {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMySessions();
      setSessions(response.sessions || []);
    } catch (err) {
      console.error("Failed to fetch student sessions:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load your class sessions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const getDisasterBadge = (disasterType) => {
    const styles = {
      earthquake: "bg-orange-100 text-orange-700",
      fire: "bg-red-100 text-red-700",
      flood: "bg-blue-100 text-blue-700",
    };

    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
          styles[disasterType] || "bg-gray-100 text-gray-700"
        }`}
      >
        {disasterType}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      scheduled: "bg-yellow-100 text-yellow-700",
      active: "bg-green-100 text-green-700",
    };

    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
          styles[status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {status}
      </span>
    );
  };

  const getProgressBadge = (progressStatus) => {
    const styles = {
      not_started: "bg-gray-100 text-gray-700",
      in_progress: "bg-blue-100 text-blue-700",
    };

    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
          styles[progressStatus] || "bg-gray-100 text-gray-700"
        }`}
      >
        {progressStatus === "not_started"
          ? "Not Started"
          : "In Progress"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Loading class sessions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-600">{error}</p>

        <button
          onClick={fetchSessions}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Class Sessions
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Join disaster drills assigned by your teacher.
        </p>
      </div>

      {/* Empty State */}
      {sessions.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">
            No active class sessions right now
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Your teacher has not assigned a class drill yet.
          </p>

          <Link
            to="/dashboard/drills"
            className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Practice Drills Independently
          </Link>
        </div>
      ) : (
        /* Session Cards */
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sessions.map((session) => {
            const scenario = session.scenario;

            return (
              <div
                key={session._id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                {/* Title */}
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {scenario?.title || "Disaster Drill"}
                  </h2>
                </div>

                {/* Disaster + Session Status */}
                <div className="flex flex-wrap gap-2">
                  {getDisasterBadge(scenario?.disasterType)}

                  {getStatusBadge(session.status)}
                </div>

                {/* Progress */}
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Your Progress
                  </p>

                  {getProgressBadge(session.progressStatus)}
                </div>

                {/* Action */}
                <div className="mt-5">
                  {session.status === "active" ? (
                    <button
                      onClick={() =>
                        navigate(
                          `/dashboard/drills/${scenario?._id}/play?sessionId=${session._id}`
                        )
                      }
                      className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Join Drill
                    </button>
                  ) : (
                    <div className="w-full rounded-lg bg-gray-100 px-4 py-2.5 text-center text-sm font-medium text-gray-500">
                      Waiting for teacher to start...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentSessions;