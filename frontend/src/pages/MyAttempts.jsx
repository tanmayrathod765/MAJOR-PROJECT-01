import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyAttempts } from "../api/attemptApi";

const disasterStyles = {
  earthquake: "bg-orange-100 text-orange-800",
  fire: "bg-red-100 text-red-800",
  flood: "bg-blue-100 text-blue-800",
};

const difficultyStyles = {
  beginner: "bg-green-100 text-green-800",
  advanced: "bg-purple-100 text-purple-800",
};

const endingStyles = {
  safe: "bg-green-100 text-green-800",
  injured: "bg-yellow-100 text-yellow-800",
  critical: "bg-red-100 text-red-800",
};

const MyAttempts = () => {
  const [attempts, setAttempts] = useState([]);
  const [expandedDiary, setExpandedDiary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttempts = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getMyAttempts();

        if (response.success) {
          setAttempts(response.attempts || []);
        } else {
          setAttempts([]);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load your drill attempts."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, []);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatTime = (seconds) => {
    if (seconds === undefined || seconds === null) {
      return "—";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}m ${remainingSeconds}s`;
  };

  const toggleDiary = (attemptId) => {
    setExpandedDiary((previous) => ({
      ...previous,
      [attemptId]: !previous[attemptId],
    }));
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-blue-800">
          Student Progress
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          My Attempts
        </h1>

        <p className="mt-2 text-slate-500">
          Review your completed disaster preparedness drills.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-5 w-48 rounded bg-slate-200" />
            <div className="h-16 rounded bg-slate-200" />
            <div className="h-16 rounded bg-slate-200" />
          </div>
        </div>
      )}

      {!loading && !error && attempts.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">
            No drill attempts yet
          </h2>

          <p className="mt-2 text-slate-500">
            Complete a disaster drill to see your results here.
          </p>

          <Link
            to="/dashboard/drills"
            className="mt-6 inline-flex rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Explore Drills
          </Link>
        </div>
      )}

      {!loading && attempts.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Scenario
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Type
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Difficulty
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Score
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Ending
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Mistakes
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Time
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {attempts.map((attempt) => (
                    <tr key={attempt._id}>
                      <td className="px-5 py-5 align-top">
                        <p className="font-semibold text-slate-900">
                          {attempt.scenario?.title ||
                            "Unknown Scenario"}
                        </p>

                        {attempt.disasterDiaryEntry && (
                          <div className="mt-3 max-w-xs">
                            <p className="text-xs font-semibold text-slate-500">
                              Reflection
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              {expandedDiary[attempt._id] ||
                              attempt.disasterDiaryEntry.length <= 100
                                ? attempt.disasterDiaryEntry
                                : `${attempt.disasterDiaryEntry.slice(
                                    0,
                                    100
                                  )}...`}
                            </p>

                            {attempt.disasterDiaryEntry.length >
                              100 && (
                              <button
                                type="button"
                                onClick={() =>
                                  toggleDiary(attempt._id)
                                }
                                className="mt-1 text-xs font-semibold text-blue-900 hover:underline"
                              >
                                {expandedDiary[attempt._id]
                                  ? "Show less"
                                  : "Show more"}
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-5 align-top">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            disasterStyles[
                              attempt.scenario?.disasterType
                            ] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {attempt.scenario?.disasterType ||
                            "—"}
                        </span>
                      </td>

                      <td className="px-5 py-5 align-top">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            difficultyStyles[
                              attempt.difficulty
                            ] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {attempt.difficulty}
                        </span>
                      </td>

                      <td className="px-5 py-5 align-top">
                        <span className="text-xl font-bold text-blue-900">
                          {attempt.score}
                        </span>
                      </td>

                      <td className="px-5 py-5 align-top">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            endingStyles[
                              attempt.finalEndingType
                            ] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {attempt.finalEndingType}
                        </span>
                      </td>

                      <td className="px-5 py-5 align-top font-medium text-slate-700">
                        {attempt.mistakesCount}
                      </td>

                      <td className="px-5 py-5 align-top text-slate-700">
                        {formatTime(attempt.timeTakenSeconds)}
                      </td>

                      <td className="px-5 py-5 align-top whitespace-nowrap text-sm text-slate-500">
                        {formatDate(attempt.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile/tablet cards */}
          <div className="grid gap-5 lg:hidden">
            {attempts.map((attempt) => (
              <div
                key={attempt._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      disasterStyles[
                        attempt.scenario?.disasterType
                      ] ||
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {attempt.scenario?.disasterType || "—"}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      difficultyStyles[attempt.difficulty] ||
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {attempt.difficulty}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      endingStyles[
                        attempt.finalEndingType
                      ] ||
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {attempt.finalEndingType}
                  </span>
                </div>

                <h2 className="mt-4 text-xl font-bold text-slate-900">
                  {attempt.scenario?.title ||
                    "Unknown Scenario"}
                </h2>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">
                      Score
                    </p>
                    <p className="mt-1 text-xl font-bold text-blue-900">
                      {attempt.score}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Mistakes
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {attempt.mistakesCount}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Time
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {formatTime(attempt.timeTakenSeconds)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Completed
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {formatDate(attempt.createdAt)}
                    </p>
                  </div>
                </div>

                {attempt.disasterDiaryEntry && (
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="text-xs font-semibold text-slate-500">
                      Reflection
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {expandedDiary[attempt._id] ||
                      attempt.disasterDiaryEntry.length <= 100
                        ? attempt.disasterDiaryEntry
                        : `${attempt.disasterDiaryEntry.slice(
                            0,
                            100
                          )}...`}
                    </p>

                    {attempt.disasterDiaryEntry.length > 100 && (
                      <button
                        type="button"
                        onClick={() =>
                          toggleDiary(attempt._id)
                        }
                        className="mt-1 text-xs font-semibold text-blue-900 hover:underline"
                      >
                        {expandedDiary[attempt._id]
                          ? "Show less"
                          : "Show more"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MyAttempts;