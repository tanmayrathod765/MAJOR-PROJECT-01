import { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { getScenarioById } from "../api/drillApi";
import {
  addDiaryEntry,
  submitAttempt,
} from "../api/attemptApi";

import {
  updateMyProgress,
  completeMyProgress,
} from "../api/sessionApi";
import {
  isSupported as isSpeechSupported,
  speak,
  stop as stopSpeech,
} from "../utils/speech";

const endingStyles = {
  safe: {
    container: "border-green-200 bg-green-50",
    title: "text-green-800",
    badge: "bg-green-100 text-green-800",
  },
  injured: {
    container: "border-yellow-200 bg-yellow-50",
    title: "text-yellow-800",
    badge: "bg-yellow-100 text-yellow-800",
  },
  critical: {
    container: "border-red-200 bg-red-50",
    title: "text-red-800",
    badge: "bg-red-100 text-red-800",
  },
};

const DrillPlay = () => {
  const { id } = useParams();
const [searchParams] = useSearchParams();
const sessionId = searchParams.get("sessionId");
  const [scenario, setScenario] = useState(null);
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [pathTaken, setPathTaken] = useState([]);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  const [attempt, setAttempt] = useState(null);
  const [diaryText, setDiaryText] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [savingDiary, setSavingDiary] = useState(false);

  const [submitError, setSubmitError] = useState("");
  const [diaryError, setDiaryError] = useState("");
  const [diarySaved, setDiarySaved] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const speechSupported = isSpeechSupported();
  const announcedAttemptId = useRef(null);
  const [voiceMode, setVoiceMode] = useState(
    () =>
      speechSupported &&
      localStorage.getItem("disasterready_voice_mode") === "true"
  );

  const isResultView = Boolean(attempt);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchScenario = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getScenarioById(id);

        if (mounted && response.success) {
          setScenario(response.scenario);
          setCurrentNodeId(response.scenario.startNodeId);
          setTimerRunning(true);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.message ||
              "Unable to load this drill."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchScenario();

    return () => {
      mounted = false;
    };
  }, [id]);

  // Timer
  useEffect(() => {
    if (!timerRunning || isResultView) {
      return undefined;
    }

    const interval = setInterval(() => {
      setElapsedSeconds((previous) => previous + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning, isResultView]);

  const currentNode = useMemo(() => {
    if (!scenario || !currentNodeId) {
      return null;
    }

    return scenario.nodes?.find(
      (node) => node.nodeId === currentNodeId
    );
  }, [scenario, currentNodeId]);

  useEffect(() => {
    if (!voiceMode || !currentNode) {
      return;
    }

    const optionsText = currentNode.options
      ?.map(
        (option, index) =>
          `Option ${index + 1}: ${option.optionText}.`
      )
      .join(" ");

    let narration = currentNode.situationText;

    if (currentNode.isEnding) {
      const endingNarration = {
        safe: "Drill complete. You reached safety.",
        injured: "Drill complete. You were injured.",
        critical:
          "Drill complete. This was a critical outcome.",
      };

      narration += ` ${endingNarration[currentNode.endingType] || ""}`;
    } else if (optionsText) {
      narration += ` ${optionsText}`;
    }

    speak(narration);
  }, [currentNode, voiceMode]);

  useEffect(() => {
    if (
      voiceMode &&
      attempt &&
      announcedAttemptId.current !== attempt._id
    ) {
      speak(`Your score is ${attempt.score} out of 100.`);
      announcedAttemptId.current = attempt._id;
    }
  }, [attempt, voiceMode]);

  // Stop timer when an ending node is reached.
  useEffect(() => {
    if (currentNode?.isEnding) {
      setTimerRunning(false);
    }
  }, [currentNode]);

  const handleOptionClick = (option) => {
    if (!currentNode || currentNode.isEnding) {
      return;
    }

    setPathTaken((previous) => [
      ...previous,
      {
        nodeId: currentNode.nodeId,
        chosenOptionText: option.optionText,
        wasCorrectChoice: option.isCorrectChoice,
      },
    ]);

    setCurrentNodeId(option.nextNodeId);
    if (sessionId) {
  updateMyProgress(
    sessionId,
    option.nextNodeId
  ).catch((error) => {
    console.error(
      "Failed to update session progress:",
      error
    );
  });
}
  };

  const handleVoiceToggle = () => {
    const nextVoiceMode = !voiceMode;

    setVoiceMode(nextVoiceMode);
    localStorage.setItem(
      "disasterready_voice_mode",
      String(nextVoiceMode)
    );

    if (!nextVoiceMode) {
      stopSpeech();
    }
  };

  const handleFinish = async () => {
    if (!scenario || !currentNode || submitting) {
      return;
    }

    setSubmitError("");
    setSubmitting(true);

    const payload = {
      scenarioId: scenario._id,
      pathTaken,
      finalEndingType: currentNode.endingType,
      timeTakenSeconds: elapsedSeconds,
    };

    try {
      const response = await submitAttempt(payload);

      if (response.success) {
        if (sessionId && response.attempt?._id) {
  try {
    await completeMyProgress(
      sessionId,
      response.attempt._id
    );
  } catch (error) {
    console.error(
      "Failed to complete session progress:",
      error
    );
  }
}

setAttempt(response.attempt);
        setAttempt(response.attempt);
      } else {
        throw new Error(
          response.message || "Unable to submit attempt."
        );
      }
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          err.message ||
          "Unable to submit the drill attempt. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDiary = async () => {
    if (!attempt?._id || !diaryText.trim() || savingDiary) {
      return;
    }

    setDiaryError("");
    setDiarySaved(false);
    setSavingDiary(true);

    try {
      const response = await addDiaryEntry(
        attempt._id,
        diaryText.trim()
      );

      if (response.success) {
        setAttempt(response.attempt);
        setDiaryText(response.attempt.disasterDiaryEntry || "");
        setDiarySaved(true);
      } else {
        throw new Error(
          response.message || "Unable to save reflection."
        );
      }
    } catch (err) {
      setDiaryError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save reflection."
      );
    } finally {
      setSavingDiary(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-900" />
          <p className="mt-4 text-sm text-slate-500">
            Loading drill...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>

        <Link
          to="/dashboard/drills"
          className="mt-5 inline-block font-semibold text-blue-900 hover:underline"
        >
          ← Back to Drills
        </Link>
      </div>
    );
  }

  /*
   * RESULTS VIEW
   */
  if (attempt) {
    const resultEndingType =
      attempt.finalEndingType || "safe";

    const endingStyle =
      endingStyles[resultEndingType] || endingStyles.safe;

    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link
            to="/dashboard/drills"
            onClick={stopSpeech}
            className="font-semibold text-blue-900 hover:underline"
          >
            ← Back to Drills
          </Link>
        </div>

        <div className="mb-8 text-center">
          <p className="text-sm font-medium text-blue-800">
            Drill Completed
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Drill Results
          </h1>
        </div>

        {/* Score */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Final Score
          </p>

          <p className="mt-2 text-6xl font-black text-blue-900">
            {attempt.score}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            out of 100
          </p>
        </div>

        {/* Result summary */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div
            className={`rounded-2xl border p-5 text-center ${endingStyle.container}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ending
            </p>

            <p
              className={`mt-2 text-xl font-bold capitalize ${endingStyle.title}`}
            >
              {resultEndingType}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Mistakes
            </p>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {attempt.mistakesCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Time Taken
            </p>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {formatTime(attempt.timeTakenSeconds)}
            </p>

            <p className="text-xs text-slate-500">
              {attempt.timeTakenSeconds} seconds
            </p>
          </div>
        </div>

        {/* Reflection */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Disaster Diary
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Reflect briefly on what you learned from this drill.
            </p>
          </div>

          {diaryError && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {diaryError}
            </div>
          )}

          {diarySaved && (
            <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              Reflection saved successfully.
            </div>
          )}

          <textarea
            value={diaryText}
            onChange={(event) => {
              setDiaryText(event.target.value.slice(0, 500));
              setDiarySaved(false);
              setDiaryError("");
            }}
            maxLength={500}
            rows={5}
            placeholder="What did you learn from this drill?"
            className="mt-5 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          />

          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Your reflection is optional.
            </span>

            <span className="text-xs font-medium text-slate-500">
              {diaryText.length}/500
            </span>
          </div>

          <button
            type="button"
            onClick={handleSaveDiary}
            disabled={
              savingDiary || !diaryText.trim()
            }
            className="mt-5 rounded-lg bg-blue-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingDiary ? "Saving..." : "Save Reflection"}
          </button>
        </div>

        <div className="mt-6 pb-8 text-center">
          <Link
            to="/dashboard/drills"
            className="inline-flex rounded-lg border border-blue-900 px-6 py-3 font-semibold text-blue-900 transition hover:bg-blue-50"
          >
            Back to Drills
          </Link>
        </div>
      </div>
    );
  }

  if (!scenario || !currentNode) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          Unable to find the current drill node.
        </div>
      </div>
    );
  }

  const endingStyle =
    endingStyles[currentNode.endingType] ||
    endingStyles.safe;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          to="/dashboard/drills"
          onClick={stopSpeech}
          className="font-semibold text-blue-900 hover:underline"
        >
          ← Exit Drill
        </Link>

        <div className="flex items-center gap-3">
          {speechSupported && (
            <button
              type="button"
              onClick={handleVoiceToggle}
              aria-pressed={voiceMode}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                voiceMode
                  ? "bg-blue-900 text-white hover:bg-blue-800"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              Voice Guidance: {voiceMode ? "On" : "Off"}
            </button>
          )}

          <div className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
            Time:{" "}
            <span className="font-mono text-blue-900">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Scenario */}
      <div className="mb-5">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold capitalize text-blue-900">
          {scenario.disasterType}
        </span>

        <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
          {scenario.title}
        </h1>
      </div>

      {/* Current situation */}
      <div
        className={`rounded-2xl border p-6 shadow-sm sm:p-8 ${
          currentNode.isEnding
            ? endingStyle.container
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-sm font-bold text-blue-900">
            Node: {currentNode.nodeId}
          </span>

          {currentNode.isEnding && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${endingStyle.badge}`}
            >
              {currentNode.endingType} ending
            </span>
          )}
        </div>

        <h2
          className={`mt-6 text-xl font-bold leading-8 sm:text-2xl ${
            currentNode.isEnding
              ? endingStyle.title
              : "text-slate-900"
          }`}
        >
          {currentNode.situationText}
        </h2>

        {!currentNode.isEnding && (
          <div className="mt-8 space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              What will you do?
            </p>

            {currentNode.options?.map(
              (option, index) => (
                <button
                  key={`${option.nextNodeId}-${index}`}
                  type="button"
                  onClick={() =>
                    handleOptionClick(option)
                  }
                  className="group w-full rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-800 hover:bg-blue-50 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-900 group-hover:bg-blue-900 group-hover:text-white">
                      {index + 1}
                    </span>

                    <p className="font-semibold text-slate-800">
                      {option.optionText}
                    </p>
                  </div>
                </button>
              )
            )}
          </div>
        )}

        {currentNode.isEnding && (
          <div className="mt-8">
            <div className="rounded-xl bg-white/70 p-5">
              <p className="text-sm font-medium text-slate-600">
                Drill Result
              </p>

              <p
                className={`mt-1 text-2xl font-bold capitalize ${endingStyle.title}`}
              >
                {currentNode.endingType}
              </p>

              <p className="mt-2 text-sm text-slate-600">
                You reached the end of this scenario in{" "}
                <span className="font-semibold">
                  {formatTime(elapsedSeconds)}
                </span>
                .
              </p>
            </div>

            {submitError && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <button
              type="button"
              onClick={handleFinish}
              disabled={submitting}
              className="mt-5 w-full rounded-xl bg-blue-900 px-5 py-4 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Submitting Drill..."
                : "Finish Drill"}
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
        Decisions made:{" "}
        <span className="font-semibold text-slate-800">
          {pathTaken.length}
        </span>
      </div>
    </div>
  );
};

export default DrillPlay;