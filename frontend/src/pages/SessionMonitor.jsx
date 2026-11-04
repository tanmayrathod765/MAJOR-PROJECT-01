import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getSessionById,
  startSession,
} from "../api/sessionApi";

const statusStyles = {
  scheduled: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
};

const progressStyles = {
  not_started: "bg-slate-100 text-slate-700",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
};

const endingStyles = {
  safe: "bg-green-100 text-green-800",
  injured: "bg-yellow-100 text-yellow-800",
  critical: "bg-red-100 text-red-800",
};

const SessionMonitor = () => {
  const { id } = useParams();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchSession = useCallback(async () => {
    try {
      const response = await getSessionById(id);

      if (!response.success) {
        throw new Error(
          response.message || "Unable to load session."
        );
      }

      setSession(response.session);
      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load session."
      );
    }
  }, [id]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchSession();
      setLoading(false);
    };

    load();
  }, [fetchSession]);

  useEffect(() => {
    if (!session || session.status !== "active") {
      return undefined;
    }

    const interval = setInterval(() => {
      fetchSession();
    }, 4000);

    return () => clearInterval(interval);
  }, [session?.status, fetchSession]);

  const handleStart = async () => {
    try {
      setStarting(true);
      setError("");

      const response = await startSession(id);

      if (!response.success) {
        throw new Error(
          response.message || "Unable to start session."
        );
      }

      await fetchSession();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to start session."
      );
    } finally {
      setStarting(false);
    }
  };

  const getStudentName = (student) => {
    if (!student) return "Unknown Student";

    if (typeof student === "object") {
      return student.name || "Unknown Student";
    }

    const matched = session?.studentIds?.find(
      (item) =>
        typeof item === "object" && item._id === student
    );

    return matched?.name || "Unknown Student";
  };

  const summary = useMemo(() => {
    if (!session?.progress?.length) {
      return {
        averageScore: 0,
        safe: 0,
        injured: 0,
        critical: 0,
      };
    }

    const completed = session.progress.filter(
      (item) =>
        item.status === "completed" &&
        item.attempt
    );

    const scores = completed
      .map((item) => item.attempt?.score)
      .filter((score) => typeof score === "number");

    const endings = completed.reduce(
      (result, item) => {
        const ending =
          item.attempt?.finalEndingType;

        if (ending === "safe") result.safe += 1;
        if (ending === "injured") result.injured += 1;
        if (ending === "critical") result.critical += 1;

        return result;
      },
      {
        safe: 0,
        injured: 0,
        critical: 0,
      }
    );

    return {
      averageScore:
        scores.length > 0
          ? Math.round(
              scores.reduce(
                (total, score) => total + score,
                0
              ) / scores.length
            )
          : 0,
      ...endings,
    };
  }, [session]);

  const secondsSinceUpdate = lastUpdated
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - lastUpdated.getTime()) / 1000
        )
      )
    : null;

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-slate-600">
          Loading session...
        </p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">
          Unable to load session
        </h2>

        <p className="mt-2 text-sm text-red-700">
          {error}
        </p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            to="/dashboard/sessions"
            className="text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            ← Back to Sessions
          </Link>

          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            {session.scenario?.title ||
              "Class Session"}
          </h1>

          <p className="mt-1 text-sm capitalize text-slate-500">
            {session.scenario?.disasterType} •{" "}
            {session.scenario?.difficulty}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
              statusStyles[session.status] ||
              "bg-slate-100 text-slate-700"
            }`}
          >
            {session.status}
          </span>

          {session.status === "scheduled" && (
            <button
              onClick={handleStart}
              disabled={starting}
              className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {starting ? "Starting..." : "Start Session"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {session.status === "active" && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Live monitoring
          {secondsSinceUpdate !== null &&
            ` • Last updated ${secondsSinceUpdate}s ago`}
        </div>
      )}

      {session.status === "completed" && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Average Score
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {summary.averageScore}
            </p>
          </div>

          <div className="rounded-xl border border-green-200 bg-green-50 p-5">
            <p className="text-sm text-green-700">
              Safe Endings
            </p>
            <p className="mt-1 text-2xl font-bold text-green-800">
              {summary.safe}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:col-span-1">
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
              <p className="text-xs text-yellow-700">
                Injured
              </p>
              <p className="mt-1 text-xl font-bold text-yellow-800">
                {summary.injured}
              </p>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <p className="text-xs text-red-700">
                Critical
              </p>
              <p className="mt-1 text-xl font-bold text-red-800">
                {summary.critical}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Student Progress
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {session.progress?.length || 0} students
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Student
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Status
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Current Node
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Score
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Ending
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {(session.progress || []).map((item, index) => {
                const student =
                  typeof item.student === "object"
                    ? item.student
                    : null;

                return (
                  <tr key={student?._id || item.student || index}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {getStudentName(item.student)}
                      </p>

                      {student?.email && (
                        <p className="text-xs text-slate-500">
                          {student.email}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          progressStyles[item.status] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.status === "in_progress"
                        ? item.currentNodeId || "—"
                        : "—"}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                      {item.status === "completed" &&
                      item.attempt
                        ? item.attempt.score
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      {item.status === "completed" &&
                      item.attempt?.finalEndingType ? (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            endingStyles[
                              item.attempt.finalEndingType
                            ] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item.attempt.finalEndingType}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SessionMonitor;