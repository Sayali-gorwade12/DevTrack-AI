require("dotenv").config();

const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

async function createAdmin() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();

    const db = client.db();
    const users = db.collection("users");

    const email = "admin@devtrack.com";

    const existingAdmin = await users.findOne({ email });

    if (existingAdmin) {
      console.log("Admin account already exists.");
      return;
    }

    const password = "Admin@12345";
    const hashedPassword = await bcrypt.hash(password, 10);

    await users.insertOne({
      name: "DevTrack Admin",
      email,
      password: hashedPassword,
      role: "admin",
      createdAt: new Date(),
    });

    console.log("Admin created successfully!");
  } catch (error) {
    console.error("Admin creation failed:", error.message);
  } finally {
    await client.close();
  }
}

createAdmin();