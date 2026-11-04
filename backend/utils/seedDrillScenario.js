const seedContent = require("./seedContent");

seedContent()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Content seed failed:", error);
    process.exit(1);
  });
