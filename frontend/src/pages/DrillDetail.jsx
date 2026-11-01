import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getScenarioById } from "../api/drillApi";

const endingStyles = {
  safe: "bg-green-100 text-green-800",
  injured: "bg-yellow-100 text-yellow-800",
  critical: "bg-red-100 text-red-800",
};

const DrillDetail = () => {
  const { id } = useParams();

  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchScenario = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getScenarioById(id);

        if (response.success) {
          setScenario(response.scenario);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load drill scenario."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchScenario();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="animate-pulse rounded-2xl bg-white p-8 shadow-sm">
          <div className="h-8 w-2/3 rounded bg-slate-200" />
          <div className="mt-4 h-4 w-full rounded bg-slate-200" />
          <div className="mt-2 h-4 w-3/4 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!scenario) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <Link
          to="/dashboard/drills"
          className="text-sm font-semibold text-blue-900 hover:underline"
        >
          ← Back to Drills
        </Link>
      </div>

      {/* Scenario header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold capitalize text-blue-900">
            {scenario.disasterType}
          </span>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
            {scenario.difficulty}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          {scenario.title}
        </h1>

        <p className="mt-3 leading-7 text-slate-600">
          {scenario.description ||
            "No description available."}
        </p>

        <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm">
          <span className="font-semibold text-slate-700">
            Starting Node:
          </span>{" "}
          <span className="font-mono text-blue-900">
            {scenario.startNodeId}
          </span>
        </div>
      </div>

      {/* Node tree */}
      <div className="mt-6 space-y-5">
        <h2 className="text-2xl font-bold text-slate-900">
          Scenario Node Tree
        </h2>

        {scenario.nodes?.map((node, index) => (
          <div
            key={node.nodeId}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="font-mono text-sm font-bold text-blue-900">
                  Node {index + 1}: {node.nodeId}
                </span>

                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  {node.situationText}
                </h3>
              </div>

              {node.isEnding ? (
                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ${
                    endingStyles[node.endingType] ||
                    "bg-slate-100 text-slate-700"
                  }`}
                >
                  Ending: {node.endingType}
                </span>
              ) : (
                <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                  Decision Node
                </span>
              )}
            </div>

            {!node.isEnding && node.options?.length > 0 && (
              <div className="mt-5 border-t border-slate-100 pt-5">
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Options
                </h4>

                <div className="space-y-3">
                  {node.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-medium text-slate-800">
                            {option.optionText}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Next node:{" "}
                            <span className="font-mono text-blue-900">
                              {option.nextNodeId}
                            </span>
                          </p>
                        </div>

                        {option.isCorrectChoice && (
                          <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                            Correct Choice
                          </span>
                        )}
                      </div>

                      {option.feedback && (
                        <p className="mt-3 border-t border-slate-200 pt-3 text-sm text-slate-600">
                          Feedback: {option.feedback}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DrillDetail;