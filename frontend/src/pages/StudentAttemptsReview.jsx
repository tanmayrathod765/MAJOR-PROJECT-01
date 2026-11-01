import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getStudentAttempts } from "../api/attemptApi";

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

const StudentAttemptsReview = () => {
  const { studentId } = useParams();

  const [attempts, setAttempts] = useState([]);
  const [expandedDiary, setExpandedDiary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttempts = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getStudentAttempts(studentId);

        if (response.success) {
          setAttempts(response.attempts || []);
        } else {
          setAttempts([]);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load this student's attempts."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [studentId]);

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
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="text-sm font-semibold text-blue-900 hover:underline"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="mb-8">
        <p className="text-sm font-medium text-blue-800">
          Student Review
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Student Drill Attempts
        </h1>

        <p className="mt-2 break-all text-sm text-slate-500">
          Student ID:{" "}
          <span className="font-mono text-slate-700">
            {studentId}
          </span>
        </p>

        {/* Future improvement: show the student's name using a dedicated student endpoint. */}
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
            No attempts found
          </h2>

          <p className="mt-2 text-slate-500">
            This student has not completed any drills yet.
          </p>
        </div>
      )}

      {!loading && attempts.length > 0 && (
        <div className="grid gap-5">
          {attempts.map((attempt) => (
            <div
              key={attempt._id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {attempt.scenario?.title ||
                      "Unknown Scenario"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(attempt.createdAt)}
                  </p>
                </div>

                <p className="text-3xl font-black text-blue-900">
                  {attempt.score}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
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

              <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
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
                    Time Taken
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {formatTime(attempt.timeTakenSeconds)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Final Ending
                  </p>

                  <p className="mt-1 font-semibold capitalize text-slate-800">
                    {attempt.finalEndingType}
                  </p>
                </div>
              </div>

              {attempt.disasterDiaryEntry && (
                <div className="mt-5 rounded-xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Student Reflection
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {expandedDiary[attempt._id] ||
                    attempt.disasterDiaryEntry.length <= 150
                      ? attempt.disasterDiaryEntry
                      : `${attempt.disasterDiaryEntry.slice(
                          0,
                          150
                        )}...`}
                  </p>

                  {attempt.disasterDiaryEntry.length > 150 && (
                    <button
                      type="button"
                      onClick={() =>
                        toggleDiary(attempt._id)
                      }
                      className="mt-2 text-xs font-semibold text-blue-900 hover:underline"
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
      )}
    </div>
  );
};

export default StudentAttemptsReview;