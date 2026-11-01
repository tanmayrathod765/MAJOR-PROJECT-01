import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { listLessons } from "../api/lessonApi";
import { useAuth } from "../context/AuthContext";

const LessonList = () => {
  const { user } = useAuth();

  const [lessons, setLessons] = useState([]);
  const [grade, setGrade] = useState("");
  const [disasterType, setDisasterType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLessons = async () => {
    try {
      setLoading(true);
      setError("");

      const filters = {};

      if (grade) {
        filters.grade = grade;
      }

      if (disasterType) {
        filters.disasterType = disasterType;
      }

      const response = await listLessons(filters);

      setLessons(response.lessons || []);
    } catch (err) {
      console.error("Failed to fetch lessons:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load lessons."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [grade, disasterType]);

  const getDisasterBadge = (type) => {
    const styles = {
      earthquake: "bg-orange-100 text-orange-700",
      fire: "bg-red-100 text-red-700",
      flood: "bg-blue-100 text-blue-700",
      general: "bg-gray-100 text-gray-700",
    };

    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
          styles[type] || "bg-gray-100 text-gray-700"
        }`}
      >
        {type}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Loading lessons...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-600">{error}</p>

        <button
          onClick={fetchLessons}
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Curriculum
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Learn disaster preparedness and safety through
            grade-wise lessons.
          </p>
        </div>

        {(user?.role === "teacher" ||
          user?.role === "admin") && (
          <Link
            to="/dashboard/lessons/new"
            className="inline-flex w-fit rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Create New Lesson
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="grade"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Grade
            </label>

            <select
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Grades</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="disasterType"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Disaster Type
            </label>

            <select
              id="disasterType"
              value={disasterType}
              onChange={(e) => setDisasterType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="earthquake">Earthquake</option>
              <option value="fire">Fire</option>
              <option value="flood">Flood</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {lessons.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">
            No lessons found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Try changing the selected filters.
          </p>
        </div>
      ) : (
        /* Lesson Cards */
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {lessons.map((lesson) => (
            <div
              key={lesson._id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                  Grade {lesson.grade}
                </span>

                {getDisasterBadge(lesson.disasterType)}
              </div>

              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                {lesson.title}
              </h2>

              <Link
                to={`/dashboard/lessons/${lesson._id}`}
                className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                View Lesson
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonList;