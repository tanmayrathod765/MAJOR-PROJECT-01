import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createLesson } from "../api/lessonApi";

const LessonCreate = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    grade: "",
    disasterType: "earthquake",
    content: "",
    order: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: name === "order" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await createLesson(formData);

      setSuccess(
        "Lesson created successfully. Redirecting to quiz manager..."
      );

      const lessonId = response.lesson?._id;

      if (!lessonId) {
        throw new Error("Lesson ID was not returned by the server");
      }

      setTimeout(() => {
        navigate(`/dashboard/lessons/${lessonId}/quiz`);
      }, 1200);
    } catch (err) {
      console.error("Failed to create lesson:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create lesson."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Create New Lesson
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Add a curriculum lesson for students.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-5">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Lesson Title
            </label>

            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Earthquake Safety Basics"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Grade */}
          <div>
            <label
              htmlFor="grade"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Grade
            </label>

            <input
              id="grade"
              name="grade"
              type="text"
              value={formData.grade}
              onChange={handleChange}
              placeholder="e.g. 8"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />

            <p className="mt-1 text-xs text-gray-500">
              Use the existing grade format, such as 8, 10, or 12.
            </p>
          </div>

          {/* Disaster Type */}
          <div>
            <label
              htmlFor="disasterType"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Disaster Type
            </label>

            <select
              id="disasterType"
              name="disasterType"
              value={formData.disasterType}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="earthquake">Earthquake</option>
              <option value="fire">Fire</option>
              <option value="flood">Flood</option>
              <option value="general">General</option>
            </select>
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="content"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Lesson Content
            </label>

            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write the lesson content here..."
              rows={12}
              required
              className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />

            <p className="mt-1 text-xs text-gray-500">
              Plain text or simple Markdown is supported.
            </p>
          </div>

          {/* Order */}
          <div>
            <label
              htmlFor="order"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Display Order
            </label>

            <input
              id="order"
              name="order"
              type="number"
              value={formData.order}
              onChange={handleChange}
              min="0"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />

            <p className="mt-1 text-xs text-gray-500">
              Lower numbers appear first within the same grade.
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/dashboard/lessons")}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loading ? "Creating..." : "Create Lesson"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LessonCreate;