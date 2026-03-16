
//for development

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { generatePassword } from "../utils/generatePassword.js";
import { User } from "../models/userModel.js";
import { Team } from "../models/teamModel.js";

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI!);

  console.log("Connected to DB");

  // Clear old test data
  await User.deleteMany({});
  await Team.deleteMany({});

  // Create Admin
  const adminPassword = "Admin@123";
  const adminHash = await bcrypt.hash(adminPassword, 10);

  await User.create({
    email: "admin@test.com",
    password: adminHash,
    role: "ADMIN",
  });

  console.log("Admin created → admin@test.com | Admin@123");

  // Create 10 test teams
  for (let i = 1; i <= 10; i++) {
    const teamName = `Team ${i}`;
    const email = `team${i}@test.com`;
    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const team = await Team.create({
      teamName: teamName,
      teamMembers: [`MemberA${i}`, `MemberB${i}`],
    });

    await User.create({
      email,
      password: hashedPassword,
      role: "TEAM",
      teamId: team._id,
    });

    console.log(`${email} | ${plainPassword}`);
  }

  console.log("Seeding complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});