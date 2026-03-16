import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { createObjectCsvWriter } from "csv-writer";
import { generatePassword } from "../utils/generatePassword.js";
import { User } from "../models/userModel.js";
import { Team } from "../models/teamModel.js";

dotenv.config();

const teamNames = [
  "Alpha Coders",
  "Binary Beasts",
  "Code Ninjas",
  "Logic Lords",
  "Stack Smashers",
  // Add real team names here
];

async function bulkCreate() {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("Connected to DB");

  const credentials: any[] = [];

  for (let i = 0; i < teamNames.length; i++) {
    const email = `team${i + 1}@contest.local`;
    const plainPassword = generatePassword(12);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const team = await Team.create({
      teamName: teamNames[i]!,
      teamMembers: ["Member1", "Member2"],
    });

    await User.create({
      email,
      password: hashedPassword,
      role: "TEAM",
      teamId: team._id,
    });

    credentials.push({
      teamName: teamNames[i],
      email,
      password: plainPassword,
    });
  }

  // Create CSV
  const csvWriter = createObjectCsvWriter({
    path: "team_credentials.csv",
    header: [
      { id: "teamName", title: "Team Name" },
      { id: "email", title: "Email" },
      { id: "password", title: "Password" },
    ],
  });

  await csvWriter.writeRecords(credentials);

  console.log("Bulk creation complete!");
  console.log("Credentials saved in team_credentials.csv");

  process.exit(0);
}

bulkCreate().catch((err) => {
  console.error(err);
  process.exit(1);
});