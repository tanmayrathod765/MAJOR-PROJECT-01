import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listScenarios } from "../api/drillApi";
import { useAuth } from "../context/AuthContext";

const disasterStyles = {
  earthquake: "bg-orange-100 text-orange-800 border-orange-200",
  fire: "bg-red-100 text-red-800 border-red-200",
  flood: "bg-blue-100 text-blue-800 border-blue-200",
};

const difficultyStyles = {
  beginner: "bg-green-100 text-green-800 border-green-200",
  advanced: "bg-purple-100 text-purple-800 border-purple-200",
};

const DrillList = () => {
  const { user } = useAuth();

  const [scenarios, setScenarios] = useState([]);
  const [disasterType, setDisasterType] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canManageScenarios =
    user?.role === "admin" || user?.role === "teacher";

  useEffect(() => {
    const fetchScenarios = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await listScenarios({
          disasterType,
          difficulty,
        });

        if (response.success) {
          setScenarios(response.scenarios || []);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load drill scenarios."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchScenarios();
  }, [disasterType, difficulty]);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-800">
            Disaster Preparedness
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Drill Scenarios
          </h1>

          <p className="mt-2 text-slate-500">
            Explore interactive disaster preparedness scenarios.
          </p>
        </div>

        {canManageScenarios && (
          <Link
            to="/dashboard/drills/new"
            className="inline-flex items-center justify-center rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
          >
            + Create New Scenario
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Disaster Type
            </label>

            <select
              value={disasterType}
              onChange={(event) =>
                setDisasterType(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All disasters</option>
              <option value="earthquake">Earthquake</option>
              <option value="fire">Fire</option>
              <option value="flood">Flood</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Difficulty
            </label>

            <select
              value={difficulty}
              onChange={(event) =>
                setDifficulty(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
            >
              <div className="h-5 w-24 rounded bg-slate-200" />
              <div className="mt-4 h-7 w-3/4 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-full rounded bg-slate-200" />
              <div className="mt-2 h-4 w-2/3 rounded bg-slate-200" />
              <div className="mt-6 h-10 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && scenarios.length === 0 && !error && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">
            No scenarios found
          </h2>

          <p className="mt-2 text-slate-500">
            Try changing the filters or create a new scenario.
          </p>
        </div>
      )}

      {/* Cards */}
      {!loading && scenarios.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario) => (
            <div
              key={scenario._id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                    disasterStyles[scenario.disasterType] ||
                    "bg-slate-100 text-slate-700"
                  }`}
                >
                  {scenario.disasterType}
                </span>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                    difficultyStyles[scenario.difficulty] ||
                    "bg-slate-100 text-slate-700"
                  }`}
                >
                  {scenario.difficulty}
                </span>
              </div>

              <h2 className="mt-4 text-xl font-bold text-slate-900">
                {scenario.title}
              </h2>

              <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
                {scenario.description ||
                  "No description available for this scenario."}
              </p>

              <div className="mt-6">
                {user?.role === "student" ? (
                  <Link
                    to={`/dashboard/drills/${scenario._id}/play`}
                    className="block w-full rounded-lg bg-blue-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-800"
                  >
                    Start Drill
                  </Link>
                ) : (
                  <Link
                    to={`/dashboard/drills/${scenario._id}`}
                    className="block w-full rounded-lg border border-blue-900 px-4 py-3 text-center text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
                  >
                    View Details
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DrillList;