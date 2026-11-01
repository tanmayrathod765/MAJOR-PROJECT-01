import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { listScenarios } from "../api/drillApi";
import { getStudentsForReview } from "../api/attemptApi";
import { createSession } from "../api/sessionApi";

const SessionCreate = () => {
  const navigate = useNavigate();

  const [scenarios, setScenarios] = useState([]);
  const [students, setStudents] = useState([]);

  const [scenarioId, setScenarioId] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [scenarioResponse, studentResponse] =
          await Promise.all([
            listScenarios(),
            getStudentsForReview(),
          ]);

        if (scenarioResponse.success) {
          setScenarios(scenarioResponse.scenarios || []);
        } else {
          throw new Error(
            scenarioResponse.message ||
              "Unable to load scenarios."
          );
        }

        if (studentResponse.success) {
          setStudents(studentResponse.students || []);
        } else {
          throw new Error(
            studentResponse.message ||
              "Unable to load students."
          );
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load session data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleStudent = (studentId) => {
    setSelectedStudents((previous) => {
      if (previous.includes(studentId)) {
        return previous.filter((id) => id !== studentId);
      }

      return [...previous, studentId];
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!scenarioId) {
      setError("Please select a scenario.");
      return;
    }

    if (selectedStudents.length === 0) {
      setError("Please select at least one student.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await createSession({
        scenarioId,
        studentIds: selectedStudents,
      });

      if (!response.success || !response.session?._id) {
        throw new Error(
          response.message || "Unable to create session."
        );
      }

      navigate(
        `/dashboard/sessions/${response.session._id}`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to create session."
      );
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-slate-600">
          Loading session setup...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Create Class Session
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Select a disaster drill and the students who will
          participate.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="scenario"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Select Scenario
          </label>

          <select
            id="scenario"
            value={scenarioId}
            onChange={(event) =>
              setScenarioId(event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Choose a scenario</option>

            {scenarios.map((scenario) => (
              <option
                key={scenario._id}
                value={scenario._id}
              >
                {scenario.title} —{" "}
                {scenario.disasterType} (
                {scenario.difficulty})
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">
                Select Students
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {selectedStudents.length} student
                {selectedStudents.length !== 1 ? "s" : ""}{" "}
                selected
              </p>
            </div>
          </div>

          <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3">
            {students.length === 0 ? (
              <p className="p-4 text-center text-sm text-slate-500">
                No students available.
              </p>
            ) : (
              students.map((student) => {
                const checked = selectedStudents.includes(
                  student._id
                );

                return (
                  <label
                    key={student._id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                      checked
                        ? "border-blue-300 bg-blue-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        toggleStudent(student._id)
                      }
                      className="h-4 w-4"
                    />

                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {student.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {student.email}
                        {student.grade
                          ? ` • Grade ${student.grade}`
                          : ""}
                      </p>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/dashboard/sessions")}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? "Creating..." : "Create Session"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SessionCreate;