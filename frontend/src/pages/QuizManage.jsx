import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLessonById, saveQuiz } from "../api/lessonApi";

const createEmptyQuestion = () => ({
  questionText: "",
  options: ["", ""],
  correctOptionIndex: null,
  explanation: "",
});

const QuizManage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [questions, setQuestions] = useState([createEmptyQuestion()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getLessonById(id);

        setLesson(response.lesson);

        if (response.quiz?.questions?.length) {
          const existingQuestions = response.quiz.questions.map((question) => ({
            questionText: question.questionText || "",
            options:
              question.options?.length >= 2
                ? [...question.options]
                : ["", ""],
            correctOptionIndex: null,
            explanation: "",
          }));

          setQuestions(existingQuestions);
        } else {
          setQuestions([createEmptyQuestion()]);
        }
      } catch (err) {
        console.error("Failed to load quiz:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load quiz."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  const updateQuestion = (questionIndex, field, value) => {
    setQuestions((previous) =>
      previous.map((question, index) =>
        index === questionIndex
          ? { ...question, [field]: value }
          : question
      )
    );

    clearQuestionValidationError(questionIndex);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setQuestions((previous) =>
      previous.map((question, index) => {
        if (index !== questionIndex) {
          return question;
        }

        return {
          ...question,
          options: question.options.map((option, currentIndex) =>
            currentIndex === optionIndex ? value : option
          ),
        };
      })
    );

    clearQuestionValidationError(questionIndex);
  };

  const setCorrectOption = (questionIndex, optionIndex) => {
    setQuestions((previous) =>
      previous.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              correctOptionIndex: optionIndex,
            }
          : question
      )
    );

    clearQuestionValidationError(questionIndex);
  };

  const addQuestion = () => {
    setQuestions((previous) => [...previous, createEmptyQuestion()]);
  };

  const removeQuestion = (questionIndex) => {
    if (questions.length === 1) {
      return;
    }

    setQuestions((previous) =>
      previous.filter((_, index) => index !== questionIndex)
    );

    setValidationErrors((previous) =>
      previous.filter((_, index) => index !== questionIndex)
    );
  };

  const addOption = (questionIndex) => {
    setQuestions((previous) =>
      previous.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              options: [...question.options, ""],
            }
          : question
      )
    );
  };

  const removeOption = (questionIndex, optionIndex) => {
    const question = questions[questionIndex];

    if (!question || question.options.length <= 2) {
      return;
    }

    setQuestions((previous) =>
      previous.map((currentQuestion, index) => {
        if (index !== questionIndex) {
          return currentQuestion;
        }

        let newCorrectOptionIndex = currentQuestion.correctOptionIndex;

        if (newCorrectOptionIndex === optionIndex) {
          newCorrectOptionIndex = null;
        } else if (
          newCorrectOptionIndex !== null &&
          newCorrectOptionIndex > optionIndex
        ) {
          newCorrectOptionIndex -= 1;
        }

        return {
          ...currentQuestion,
          options: currentQuestion.options.filter(
            (_, currentIndex) => currentIndex !== optionIndex
          ),
          correctOptionIndex: newCorrectOptionIndex,
        };
      })
    );
  };

  const clearQuestionValidationError = (questionIndex) => {
    setValidationErrors((previous) =>
      previous.map((error, index) =>
        index === questionIndex ? "" : error
      )
    );
  };

  const validateQuestions = () => {
    const errors = questions.map((question) => {
      if (!question.questionText.trim()) {
        return "Question text is required.";
      }

      if (question.options.length < 2) {
        return "At least 2 options are required.";
      }

      if (question.options.some((option) => !option.trim())) {
        return "All options must be filled.";
      }

      if (
        question.correctOptionIndex === null ||
        question.correctOptionIndex < 0 ||
        question.correctOptionIndex >= question.options.length
      ) {
        return "Please select the correct answer.";
      }

      return "";
    });

    setValidationErrors(errors);

    return errors.every((error) => !error);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!validateQuestions()) {
      setError("Please fix the highlighted questions before saving.");
      return;
    }

    try {
      setSaving(true);

      await saveQuiz(id, questions);

      setSuccess("Quiz saved successfully. Redirecting...");

      setTimeout(() => {
        navigate(`/dashboard/lessons/${id}`);
      }, 1200);
    } catch (err) {
      console.error("Failed to save quiz:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save quiz."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-gray-500">Loading quiz...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-600">Lesson could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate(`/dashboard/lessons/${id}`)}
          className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Lesson
        </button>

        <h1 className="text-2xl font-bold text-gray-900">
          Manage Quiz
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {lesson.title}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((question, questionIndex) => (
          <div
            key={questionIndex}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Question {questionIndex + 1}
              </h2>

              <button
                type="button"
                onClick={() => removeQuestion(questionIndex)}
                disabled={questions.length === 1}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Remove
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Question
                </label>

                <textarea
                  value={question.questionText}
                  onChange={(event) =>
                    updateQuestion(
                      questionIndex,
                      "questionText",
                      event.target.value
                    )
                  }
                  rows={3}
                  placeholder="Enter the question"
                  className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Options
                  </label>

                  <button
                    type="button"
                    onClick={() => addOption(questionIndex)}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    + Add Option
                  </button>
                </div>

                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className="flex items-center gap-3"
                    >
                      <input
                        type="radio"
                        name={`correct-${questionIndex}`}
                        checked={
                          question.correctOptionIndex === optionIndex
                        }
                        onChange={() =>
                          setCorrectOption(
                            questionIndex,
                            optionIndex
                          )
                        }
                        className="h-4 w-4"
                      />

                      <input
                        type="text"
                        value={option}
                        onChange={(event) =>
                          updateOption(
                            questionIndex,
                            optionIndex,
                            event.target.value
                          )
                        }
                        placeholder={`Option ${optionIndex + 1}`}
                        className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeOption(
                            questionIndex,
                            optionIndex
                          )
                        }
                        disabled={question.options.length <= 2}
                        className="rounded-lg px-2 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Select the radio button next to the correct answer.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Explanation
                </label>

                <textarea
                  value={question.explanation}
                  onChange={(event) =>
                    updateQuestion(
                      questionIndex,
                      "explanation",
                      event.target.value
                    )
                  }
                  rows={3}
                  placeholder="Explain why the correct answer is correct."
                  className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {validationErrors[questionIndex] && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-600">
                    {validationErrors[questionIndex]}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="w-full rounded-xl border-2 border-dashed border-gray-300 bg-white px-5 py-4 text-sm font-semibold text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
        >
          + Add Question
        </button>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(`/dashboard/lessons/${id}`)}
            disabled={saving}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {saving ? "Saving Quiz..." : "Save Quiz"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizManage;