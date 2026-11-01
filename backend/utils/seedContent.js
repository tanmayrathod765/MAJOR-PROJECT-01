require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const DrillScenario = require("../models/DrillScenario");
const Lesson = require("../models/Lesson");
const Quiz = require("../models/Quiz");
const { drillScenarios, lessons } = require("./contentCatalog");

const repairExistingScenarios = async () => {
  await DrillScenario.findOneAndUpdate(
    { title: "Classroom Fire Drill" },
    {
      nodes: [
        {
          nodeId: "n1",
          situationText:
            "You notice smoke coming from a nearby room. What should you do?",
          isEnding: false,
          options: [
            {
              optionText:
                "Raise the alarm and move toward the designated exit.",
              nextNodeId: "n2",
              isCorrectChoice: true,
              feedback:
                "Alerting others and using the designated exit is the safer response.",
            },
            {
              optionText:
                "Enter the smoky room to investigate before telling anyone.",
              nextNodeId: "n4",
              isCorrectChoice: false,
              feedback:
                "Entering smoke can cause inhalation injury and delay the alarm.",
            },
          ],
        },
        {
          nodeId: "n2",
          situationText:
            "You reach the corridor. What should you do next?",
          isEnding: false,
          options: [
            {
              optionText:
                "Follow the evacuation route to the assembly area.",
              nextNodeId: "n3",
              isCorrectChoice: true,
              feedback:
                "Following the designated evacuation route helps everyone reach safety.",
            },
            {
              optionText:
                "Use the lift to leave before the other students.",
              nextNodeId: "n5",
              isCorrectChoice: false,
              feedback:
                "Lifts may fail or open into smoke during a fire; use the planned route.",
            },
          ],
        },
        {
          nodeId: "n3",
          situationText:
            "You reach the assembly area safely and wait for further instructions.",
          isEnding: true,
          endingType: "safe",
          options: [],
        },
        {
          nodeId: "n4",
          situationText:
            "Smoke fills the room before you can investigate. You need trained emergency help.",
          isEnding: true,
          endingType: "critical",
          options: [],
        },
        {
          nodeId: "n5",
          situationText:
            "The lift stops as smoke reaches the lobby. You need trained emergency help.",
          isEnding: true,
          endingType: "injured",
          options: [],
        },
      ],
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

const seedContent = async () => {
  await connectDB();

  for (const scenarioData of drillScenarios) {
    await DrillScenario.findOneAndUpdate(
      { title: scenarioData.title },
      scenarioData,
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );
  }

  for (const lessonData of lessons) {
    const lesson = await Lesson.findOneAndUpdate(
      { title: lessonData.title },
      {
        title: lessonData.title,
        grade: lessonData.grade,
        disasterType: lessonData.disasterType,
        content: lessonData.content,
        order: lessonData.order,
        isActive: true,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    await Quiz.findOneAndUpdate(
      { lesson: lesson._id },
      {
        lesson: lesson._id,
        questions: lessonData.questions,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );
  }

  await repairExistingScenarios();

  console.log(
    `Seeded ${drillScenarios.length} scenarios and ${lessons.length} lessons with ${lessons.reduce(
      (total, lesson) => total + lesson.questions.length,
      0
    )} quiz questions.`
  );
};

if (require.main === module) {
  seedContent()
    .then(async () => {
      await mongoose.connection.close();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error("Content seed failed:", error);

      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }

      process.exit(1);
    });
}

module.exports = seedContent;
