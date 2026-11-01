import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getLessonById,
  submitQuizAttempt,
} from "../api/lessonApi";
import { useAuth } from "../context/AuthContext";

const LessonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchLesson = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getLessonById(id);

      setLesson(response.lesson);
      setQuiz(response.quiz || null);

      if (response.quiz?.questions) {
        setAnswers(
          new Array(response.quiz.questions.length).fill(null)
        );
      } else {
        setAnswers([]);
      }

      setResult(null);
    } catch (err) {
      console.error("Failed to fetch lesson:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load lesson."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson();
  }, [id]);

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

  const handleAnswerChange = (questionIndex, optionIndex) => {
    setAnswers((previous) => {
      const updated = [...previous];
      updated[questionIndex] = optionIndex;
      return updated;
    });
  };

  const allQuestionsAnswered =
    quiz?.questions?.length > 0 &&
    answers.length === quiz.questions.length &&
    answers.every((answer) => answer !== null);

  const handleSubmitQuiz = async (event) => {
    event.preventDefault();

    if (!allQuestionsAnswered || submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await submitQuizAttempt(id, answers);

      setResult(response);
    } catch (err) {
      console.error("Failed to submit quiz:", err);

      setError(
        err.response?.data?.message ||
          "Failed to submit quiz."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers(
      new Array(quiz?.questions?.length || 0).fill(null)
    );
    setResult(null);
    setError("");
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Loading lesson...</p>
      </div>
    );
  }

  if (error && !lesson) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-600">{error}</p>

        <button
          onClick={fetchLesson}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  const isStudent = user?.role === "student";
  const isTeacherOrAdmin =
    user?.role === "teacher" || user?.role === "admin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            Grade {lesson.grade}
          </span>

          {getDisasterBadge(lesson.disasterType)}
        </div>

        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          {lesson.title}
        </h1>
      </div>

      {/* Lesson Content */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Lesson Content
        </h2>

        <div className="whitespace-pre-wrap leading-7 text-gray-700">
          {lesson.content}
        </div>
      </div>

      {/* Quiz Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Quiz
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Test your understanding of this lesson.
            </p>
          </div>

          {isTeacherOrAdmin && quiz && (
            <button
              onClick={() =>
                navigate(`/dashboard/lessons/${id}/quiz`)
              }
              className="inline-flex w-fit rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Manage Quiz
            </button>
          )}
        </div>

        {/* No Quiz */}
        {!quiz && (
          <div className="mt-5 rounded-lg bg-gray-50 p-5 text-center">
            <p className="text-sm text-gray-500">
              No quiz available for this lesson yet.
            </p>

            {isTeacherOrAdmin && (
              <Link
                to={`/dashboard/lessons/${id}/quiz`}
                className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Create Quiz
              </Link>
            )}
          </div>
        )}

        {/* Student Quiz */}
        {quiz && isStudent && !result && (
          <form
            onSubmit={handleSubmitQuiz}
            className="mt-6 space-y-6"
          >
            {quiz.questions.map((question, questionIndex) => (
              <div
                key={question._id || questionIndex}
                className="rounded-xl border border-gray-200 p-5"
              >
                <h3 className="font-semibold text-gray-900">
                  {questionIndex + 1}.{" "}
                  {question.questionText}
                </h3>

                <div className="mt-4 space-y-3">
                  {question.options.map(
                    (option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 transition hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name={`question-${questionIndex}`}
                          value={optionIndex}
                          checked={
                            answers[questionIndex] ===
                            optionIndex
                          }
                          onChange={() =>
                            handleAnswerChange(
                              questionIndex,
                              optionIndex
                            )
                          }
                          className="mt-1"
                        />

                        <span className="text-sm text-gray-700">
                          {option}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </div>
            ))}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={!allQuestionsAnswered || submitting}
              className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          </form>
        )}

        {/* Student Results */}
        {quiz && isStudent && result && (
          <div className="mt-6 space-y-6">
            {/* Score */}
            <div className="rounded-xl bg-blue-50 p-6 text-center">
              <p className="text-sm font-medium text-blue-700">
                Your Score
              </p>

              <p className="mt-2 text-4xl font-bold text-blue-900">
                {result.attempt.score}/
                {result.attempt.totalQuestions}
              </p>
            </div>

            {/* Breakdown */}
            <div className="space-y-4">
              {result.breakdown?.map((item, index) => (
                <div
                  key={index}
                  className={`rounded-xl border p-5 ${
                    item.isCorrect
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <h3 className="font-semibold text-gray-900">
                      {item.questionNumber}.{" "}
                      {item.questionText}
                    </h3>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                        item.isCorrect
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.isCorrect
                        ? "Correct"
                        : "Incorrect"}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-gray-700">
                    Your answer: Option{" "}
                    {item.selectedOptionIndex + 1}
                  </p>

                  {!item.isCorrect && (
                    <p className="mt-1 text-sm text-gray-700">
                      Correct answer: Option{" "}
                      {item.correctOptionIndex + 1}
                    </p>
                  )}

                  {item.explanation && (
                    <div className="mt-4 rounded-lg bg-white/70 p-3">
                      <p className="text-sm font-medium text-gray-800">
                        Explanation
                      </p>

                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        {item.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleRetake}
              className="w-full rounded-lg border border-blue-600 px-5 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              Retake Quiz
            </button>
          </div>
        )}

        {/* Teacher/Admin Read-only Quiz */}
        {quiz && isTeacherOrAdmin && (
          <div className="mt-6 space-y-4">
            {quiz.questions.map((question, index) => (
              <div
                key={question._id || index}
                className="rounded-xl border border-gray-200 p-5"
              >
                <h3 className="font-semibold text-gray-900">
                  {index + 1}. {question.questionText}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  {question.options.length} options
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonDetail;