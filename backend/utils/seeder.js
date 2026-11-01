const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("../config/db");
const User = require("../models/User");
const Institution = require("../models/Institution");

const seedData = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Delete existing data only when --delete is provided
    if (process.argv.includes("--delete")) {
      console.log("Deleting existing Users and Institutions...");

      await User.deleteMany({});
      await Institution.deleteMany({});

      console.log("Existing data deleted.");
    }

    // Create Institution
    const institution = await Institution.create({
      name: "Shri Vaishnav Public School",
      type: "school",
      address: "Scheme No. 78",
      city: "Indore",
      state: "Madhya Pradesh",
      pincode: "452010",
      district: "Indore",
      adminUsers: [],
      emergencyContacts: [
        {
          label: "Principal",
          phone: "9876543210",
        },
        {
          label: "Emergency",
          phone: "112",
        },
      ],
    });

    // Create Admin
    const admin = await User.create({
      name: "Admin User",
      email: "admin@disasterready.test",
      password: "Admin@123",
      role: "admin",
      institution: institution._id,
    });

    // Add admin to institution
    institution.adminUsers.push(admin._id);

    // Create Teacher
    const teacher = await User.create({
      name: "Teacher User",
      email: "teacher@disasterready.test",
      password: "Teacher@123",
      role: "teacher",
      institution: institution._id,
    });

    // Create Student 1
    const student1 = await User.create({
      name: "Student One",
      email: "student1@disasterready.test",
      password: "Student@123",
      role: "student",
      grade: "8",
      institution: institution._id,
    });

    // Create Student 2
    const student2 = await User.create({
      name: "Student Two",
      email: "student2@disasterready.test",
      password: "Student@123",
      role: "student",
      grade: "10",
      institution: institution._id,
    });

    await institution.save();

    console.log("\n=================================");
    console.log("DisasterReady Seed Successful!");
    console.log("=================================");
    console.log(`Institution ID: ${institution._id}`);

    console.log("\nUsers created:");
    console.log(`Admin:   ${admin.email}`);
    console.log(`Teacher: ${teacher.email}`);
    console.log(`Student: ${student1.email}`);
    console.log(`Student: ${student2.email}`);

    console.log("\nRoles:");
    console.log(`Admin:   ${admin.role}`);
    console.log(`Teacher: ${teacher.role}`);
    console.log(`Student: ${student1.role} - Grade ${student1.grade}`);
    console.log(`Student: ${student2.role} - Grade ${student2.grade}`);

    console.log("\nSeed completed successfully.");

    process.exit(0);
  } catch (error) {
    console.error("\nSeeder Error:", error.message);

    process.exit(1);
  }
};

seedData();