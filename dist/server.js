// src/config/config.ts
import dotenv from "dotenv";
dotenv.config();
var config = {
  port: Number(process.env.PORT) || 3e3,
  nodeEnv: process.env.NODE_ENV || "development",
  atlasUri: process.env.ATLAS_URI || ""
};
var config_default = config;

// src/app.ts
import express from "express";

// src/routes/profileRoutes.ts
import { Router } from "express";

// src/models/profile.ts
var profiles = [];

// src/config/db.ts
import { MongoClient } from "mongodb";
var connectionString = config_default.atlasUri;
var client = new MongoClient(connectionString);
var db = null;
async function getDb() {
  if (!db) {
    await client.connect();
    db = client.db("nexus");
  }
  return db;
}

// src/controllers/profileController.ts
var createProfile = async (req, res, next) => {
  try {
    const { name, uri, picture, userId } = req.body;
    const newProfile = { id: Date.now(), name, uri, picture, userId };
    const db2 = await getDb();
    const collection = await db2?.collection("profiles");
    await collection?.insertOne(newProfile);
    res.send(newProfile).status(201);
  } catch (error) {
    next(error);
  }
};
var getProfiles = async (req, res, next) => {
  try {
    const db2 = await getDb();
    const collection = await db2?.collection("profiles");
    const profiles2 = await collection?.find().toArray();
    res.json(profiles2).status(200);
  } catch (error) {
    next(error);
  }
};
var getProfileById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const db2 = await getDb();
    const collection = await db2?.collection("profiles");
    const profile = await collection?.findOne({ id });
    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }
    res.json(profile).status(200);
  } catch (error) {
    next(error);
  }
};
var updateProfile = (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name } = req.body;
    const profileIndex = profiles.findIndex((i) => i.id === id);
    if (profileIndex === -1) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }
    profiles[profileIndex].name = name;
    res.json(profiles[profileIndex]);
  } catch (error) {
    next(error);
  }
};
var deleteProfile = (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const profileIndex = profiles.findIndex((i) => i.id === id);
    if (profileIndex === -1) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }
    const deletedProfile = profiles.splice(profileIndex, 1)[0];
    res.json(deletedProfile);
  } catch (error) {
    next(error);
  }
};

// src/routes/profileRoutes.ts
var router = Router();
router.get("/", getProfiles);
router.get("/:id", getProfileById);
router.post("/", createProfile);
router.put("/:id", updateProfile);
router.delete("/:id", deleteProfile);
var profileRoutes_default = router;

// src/middlewares/errorHandler.ts
var errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error"
  });
};

// src/app.ts
var app = express();
app.use(express.json());
app.use("/profiles", profileRoutes_default);
app.use(errorHandler);
var app_default = app;

// src/server.ts
var PORT = config_default.port || 3e3;
app_default.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map