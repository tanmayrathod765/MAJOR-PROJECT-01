import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createScenario } from "../api/drillApi";

const createEmptyOption = () => ({
  optionText: "",
  nextNodeId: "",
  isCorrectChoice: false,
  feedback: "",
});

const createEmptyNode = () => ({
  nodeId: "",
  situationText: "",
  isEnding: false,
  endingType: "",
  options: [createEmptyOption()],
});

const DrillCreate = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    disasterType: "earthquake",
    difficulty: "beginner",
    description: "",
    startNodeId: "",
  });

  const [nodes, setNodes] = useState([createEmptyNode()]);

  const [errors, setErrors] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const updateNode = (nodeIndex, field, value) => {
    setNodes((previous) =>
      previous.map((node, index) => {
        if (index !== nodeIndex) {
          return node;
        }

        const updatedNode = {
          ...node,
          [field]: value,
        };

        if (field === "isEnding" && value === true) {
          updatedNode.endingType = "safe";
          updatedNode.options = [];
        }

        if (field === "isEnding" && value === false) {
          updatedNode.endingType = "";
          updatedNode.options =
            node.options?.length > 0
              ? node.options
              : [createEmptyOption()];
        }

        return updatedNode;
      })
    );
  };

  const updateOption = (
    nodeIndex,
    optionIndex,
    field,
    value
  ) => {
    setNodes((previous) =>
      previous.map((node, index) => {
        if (index !== nodeIndex) {
          return node;
        }

        return {
          ...node,
          options: node.options.map((option, currentIndex) =>
            currentIndex === optionIndex
              ? {
                  ...option,
                  [field]: value,
                }
              : option
          ),
        };
      })
    );
  };

  const addNode = () => {
    setNodes((previous) => [
      ...previous,
      createEmptyNode(),
    ]);
  };

  const removeNode = (nodeIndex) => {
    if (nodes.length === 1) {
      return;
    }

    setNodes((previous) =>
      previous.filter((_, index) => index !== nodeIndex)
    );
  };

  const addOption = (nodeIndex) => {
    setNodes((previous) =>
      previous.map((node, index) =>
        index === nodeIndex
          ? {
              ...node,
              options: [
                ...node.options,
                createEmptyOption(),
              ],
            }
          : node
      )
    );
  };

  const removeOption = (nodeIndex, optionIndex) => {
    setNodes((previous) =>
      previous.map((node, index) => {
        if (index !== nodeIndex) {
          return node;
        }

        if (node.options.length === 1) {
          return node;
        }

        return {
          ...node,
          options: node.options.filter(
            (_, currentIndex) => currentIndex !== optionIndex
          ),
        };
      })
    );
  };

  const validate = () => {
    const validationErrors = [];

    const nodeIds = nodes.map((node) => node.nodeId.trim());

    if (!formData.title.trim()) {
      validationErrors.push("Scenario title is required.");
    }

    if (!formData.description.trim()) {
      validationErrors.push("Scenario description is required.");
    }

    if (!formData.startNodeId.trim()) {
      validationErrors.push("Start node ID is required.");
    } else if (!nodeIds.includes(formData.startNodeId.trim())) {
      validationErrors.push(
        `Start node "${formData.startNodeId}" does not match any nodeId.`
      );
    }

    const duplicateNodeIds = nodeIds.filter(
      (id, index) =>
        id && nodeIds.indexOf(id) !== index
    );

    if (duplicateNodeIds.length > 0) {
      validationErrors.push(
        `Duplicate node ID found: "${duplicateNodeIds[0]}".`
      );
    }

    nodes.forEach((node, nodeIndex) => {
      if (!node.nodeId.trim()) {
        validationErrors.push(
          `Node ${nodeIndex + 1}: node ID is required.`
        );
      }

      if (!node.situationText.trim()) {
        validationErrors.push(
          `Node ${nodeIndex + 1}: situation text is required.`
        );
      }

      if (node.isEnding) {
        if (!node.endingType) {
          validationErrors.push(
            `Node ${node.nodeId || nodeIndex + 1}: ending type is required.`
          );
        }

        return;
      }

      if (!node.options || node.options.length === 0) {
        validationErrors.push(
          `Node ${node.nodeId || nodeIndex + 1} must have at least one option.`
        );

        return;
      }

      node.options.forEach((option, optionIndex) => {
        if (!option.optionText.trim()) {
          validationErrors.push(
            `Node ${node.nodeId || nodeIndex + 1}, option ${
              optionIndex + 1
            }: option text is required.`
          );
        }

        if (!option.nextNodeId.trim()) {
          validationErrors.push(
            `Node ${node.nodeId || nodeIndex + 1}, option ${
              optionIndex + 1
            }: next node ID is required.`
          );
        } else if (!nodeIds.includes(option.nextNodeId.trim())) {
          validationErrors.push(
            `Node ${node.nodeId || nodeIndex + 1}, option ${
              optionIndex + 1
            }: nextNodeId "${option.nextNodeId}" does not match any node.`
          );
        }
      });
    });

    return validationErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setErrors([]);

    const validationErrors = validate();

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: formData.title.trim(),
        disasterType: formData.disasterType,
        difficulty: formData.difficulty,
        description: formData.description.trim(),
        startNodeId: formData.startNodeId.trim(),
        nodes: nodes.map((node) => ({
          nodeId: node.nodeId.trim(),
          situationText: node.situationText.trim(),
          isEnding: node.isEnding,
          endingType: node.isEnding
            ? node.endingType
            : null,
          options: node.isEnding
            ? []
            : node.options.map((option) => ({
                optionText: option.optionText.trim(),
                nextNodeId: option.nextNodeId.trim(),
                isCorrectChoice: option.isCorrectChoice,
                feedback: option.feedback.trim(),
              })),
        })),
      };

      const response = await createScenario(payload);

      if (response.success) {
        setSuccess("Drill scenario created successfully.");

        setTimeout(() => {
          navigate("/dashboard/drills");
        }, 1000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create drill scenario."
      );
    } finally {
      setSaving(false);
    }
  };

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

      <div className="mb-8">
        <p className="text-sm font-medium text-blue-800">
          Scenario Management
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Create New Scenario
        </h1>

        <p className="mt-2 text-slate-500">
          Build a branching disaster preparedness drill.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {errors.length > 0 && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-bold text-red-800">
            Please fix the following:
          </h2>

          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
            {errors.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Scenario details */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">
            Scenario Details
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Title
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="e.g. Earthquake During Class"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Disaster Type
              </label>

              <select
                name="disasterType"
                value={formData.disasterType}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              >
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
                name="difficulty"
                value={formData.difficulty}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              >
                <option value="beginner">Beginner</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                rows={4}
                placeholder="Describe the scenario..."
                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Start Node ID
              </label>

              <input
                type="text"
                name="startNodeId"
                value={formData.startNodeId}
                onChange={handleFormChange}
                placeholder="e.g. n1"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 font-mono outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1 text-xs text-slate-500">
                This must exactly match one of the node IDs below.
              </p>
            </div>
          </div>
        </section>

        {/* Nodes */}
        <section>
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Scenario Nodes
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Build the branching path students will follow.
              </p>
            </div>

            <button
              type="button"
              onClick={addNode}
              className="rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              + Add Node
            </button>
          </div>

          <div className="space-y-5">
            {nodes.map((node, nodeIndex) => (
              <div
                key={nodeIndex}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">
                    Node {nodeIndex + 1}
                  </h3>

                  <button
                    type="button"
                    onClick={() => removeNode(nodeIndex)}
                    disabled={nodes.length === 1}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Remove Node
                  </button>
                </div>

                <div className="grid gap-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Node ID
                    </label>

                    <input
                      type="text"
                      value={node.nodeId}
                      onChange={(event) =>
                        updateNode(
                          nodeIndex,
                          "nodeId",
                          event.target.value
                        )
                      }
                      placeholder="e.g. n1"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 font-mono outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Situation Text
                    </label>

                    <textarea
                      value={node.situationText}
                      onChange={(event) =>
                        updateNode(
                          nodeIndex,
                          "situationText",
                          event.target.value
                        )
                      }
                      rows={3}
                      placeholder="Describe what is happening..."
                      className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <label className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
                    <input
                      type="checkbox"
                      checked={node.isEnding}
                      onChange={(event) =>
                        updateNode(
                          nodeIndex,
                          "isEnding",
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-800"
                    />

                    <span className="text-sm font-medium text-slate-700">
                      This is an ending node
                    </span>
                  </label>

                  {node.isEnding && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Ending Type
                      </label>

                      <select
                        value={node.endingType}
                        onChange={(event) =>
                          updateNode(
                            nodeIndex,
                            "endingType",
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="safe">Safe</option>
                        <option value="injured">Injured</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  )}

                  {!node.isEnding && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <h4 className="font-bold text-slate-800">
                          Options
                        </h4>

                        <button
                          type="button"
                          onClick={() => addOption(nodeIndex)}
                          className="rounded-lg border border-blue-900 px-3 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-50"
                        >
                          + Add Option
                        </button>
                      </div>

                      <div className="space-y-4">
                        {node.options.map(
                          (option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className="rounded-xl border border-slate-200 bg-white p-4"
                            >
                              <div className="mb-4 flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-700">
                                  Option {optionIndex + 1}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeOption(
                                      nodeIndex,
                                      optionIndex
                                    )
                                  }
                                  disabled={
                                    node.options.length === 1
                                  }
                                  className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-40"
                                >
                                  Remove
                                </button>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <label className="mb-2 block text-xs font-medium text-slate-600">
                                    Option Text
                                  </label>

                                  <input
                                    type="text"
                                    value={option.optionText}
                                    onChange={(event) =>
                                      updateOption(
                                        nodeIndex,
                                        optionIndex,
                                        "optionText",
                                        event.target.value
                                      )
                                    }
                                    placeholder="What can the student choose?"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                                  />
                                </div>

                                <div>
                                  <label className="mb-2 block text-xs font-medium text-slate-600">
                                    Next Node ID
                                  </label>

                                  <input
                                    type="text"
                                    value={option.nextNodeId}
                                    onChange={(event) =>
                                      updateOption(
                                        nodeIndex,
                                        optionIndex,
                                        "nextNodeId",
                                        event.target.value
                                      )
                                    }
                                    placeholder="e.g. n2"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                                  />
                                </div>

                                <label className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={
                                      option.isCorrectChoice
                                    }
                                    onChange={(event) =>
                                      updateOption(
                                        nodeIndex,
                                        optionIndex,
                                        "isCorrectChoice",
                                        event.target.checked
                                      )
                                    }
                                    className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-800"
                                  />

                                  <span className="text-sm font-medium text-slate-700">
                                    Correct choice
                                  </span>
                                </label>

                                <div>
                                  <label className="mb-2 block text-xs font-medium text-slate-600">
                                    Feedback
                                  </label>

                                  <textarea
                                    value={option.feedback}
                                    onChange={(event) =>
                                      updateOption(
                                        nodeIndex,
                                        optionIndex,
                                        "feedback",
                                        event.target.value
                                      )
                                    }
                                    rows={2}
                                    placeholder="Feedback shown after choosing this option..."
                                    className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end pb-8">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-900 px-7 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create Scenario"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DrillCreate;