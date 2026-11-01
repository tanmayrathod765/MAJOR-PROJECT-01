require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const VideoResource = require("../models/VideoResource");

const curatedResources = [
  {
    title: "Video on Disaster Resilient School",
    description: "Educational resource for school disaster preparedness.",
    resourceType: "youtube",
    url: "https://www.youtube.com/watch?v=S_e4PdVuQEE",
    category: "school-safety",
    sourceOrganization: "NDMA India",
  },
  {
    title: "Disaster Ready Schools",
    description: "Disaster preparedness awareness resource for schools.",
    resourceType: "youtube",
    url: "https://www.youtube.com/watch?v=_PlTOAvtLVA",
    category: "general",
    sourceOrganization: "NDMA India",
  },
  {
    title: "Earthquake Safety Resources",
    description: "External educational video gallery for earthquake safety.",
    resourceType: "external",
    url: "https://sdma.up.gov.in/videos",
    category: "earthquake",
    sourceOrganization: "Uttar Pradesh State Disaster Management Authority",
  },
  {
    title: "Flood and Urban Flood Safety Resources",
    description: "External educational video gallery for flood preparedness.",
    resourceType: "external",
    url: "https://sdma.up.gov.in/videos",
    category: "flood",
    sourceOrganization: "Uttar Pradesh State Disaster Management Authority",
  },
  {
    title: "Heat Wave Preparedness Resources",
    description: "External educational video gallery for heat-related hazards.",
    resourceType: "external",
    url: "https://sdma.up.gov.in/videos",
    category: "heat-wave",
    sourceOrganization: "Uttar Pradesh State Disaster Management Authority",
  },
  {
    title: "Lightning Safety Resources",
    description: "External educational video gallery for lightning safety.",
    resourceType: "external",
    url: "https://sdma.up.gov.in/videos",
    category: "lightning",
    sourceOrganization: "Uttar Pradesh State Disaster Management Authority",
  },
  {
    title: "Basic First Aid Skills",
    description: "External video resource page for basic first-aid education.",
    resourceType: "external",
    url: "https://www.redcross.org.uk/first-aid/learn-first-aid/videos",
    category: "first-aid",
    sourceOrganization: "British Red Cross",
  },
  {
    title: "Fire Safety in Buildings",
    description: "External resource page for fire-safety education.",
    resourceType: "external",
    url: "https://nsc.org.in/school-safety.aspx",
    category: "fire",
    sourceOrganization: "National Safety Council of India",
  },
  {
    title: "School Fire Safety and Mock Drills",
    description: "External resource page for school evacuation and fire-drill awareness.",
    resourceType: "external",
    url: "https://nsc.org.in/school-safety.aspx",
    category: "school-safety",
    sourceOrganization: "National Safety Council of India",
  },
  {
    title: "Fire Extinguisher Safety Resources",
    description: "External resource page for fire-extinguisher safety education.",
    resourceType: "external",
    url: "https://nsc.org.in/school-safety.aspx",
    category: "fire",
    sourceOrganization: "National Safety Council of India",
  },
];

const seedVideos = async () => {
  await connectDB();
  let inserted = 0;
  let updated = 0;

  for (const resource of curatedResources) {
    const existing = await VideoResource.findOne({
      title: resource.title,
      sourceKind: "curated",
    });

    await VideoResource.findOneAndUpdate(
      { title: resource.title, sourceKind: "curated" },
      {
        ...resource,
        sourceKind: "curated",
        status: "published",
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    if (existing) updated += 1;
    else inserted += 1;
  }

  console.log(
    `Curated video seed complete: ${inserted} inserted, ${updated} updated, 0 skipped.`
  );
};

if (require.main === module) {
  seedVideos()
    .then(async () => {
      await mongoose.connection.close();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error("Video seed failed:", error);
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }
      process.exit(1);
    });
}

module.exports = { seedVideos, curatedResources };
