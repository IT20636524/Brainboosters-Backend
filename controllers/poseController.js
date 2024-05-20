const { db } = require("../config/firebase");
const firebase = require('firebase-admin');

// Create a new pose
const createPose = async (req, res) => {
  const { childName, takenTime, files, points } = req.body;

  if (!childName || !takenTime || !Array.isArray(files) || !points) {
    return res.status(400).send("Missing required fields: childName, takenTime, files (array), points");
  }

  try {
    const poseRef = db.collection("poses").doc();
    const poseData = {
      childName,
      takenTime,  // Ensure takenTime is a string in the request body
      files,
      points
    };
    await poseRef.set(poseData);
    res.status(201).send("Pose created successfully");
  } catch (error) {
    console.error("Error creating pose:", error);
    res.status(500).send("Error creating pose");
  }
};

// Retrieve all poses
const getAllPoses = async (req, res) => {
  try {
    const posesSnapshot = await db.collection("poses").get();
    const poses = posesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(poses);
  } catch (error) {
    console.error("Error getting all poses:", error);
    res.status(500).send("Error getting poses");
  }
};

// Retrieve one pose by ID
const getOnePose = async (req, res) => {
  const poseId = req.params.poseId;

  if (!poseId) {
    return res.status(400).send("Missing poseId parameter");
  }

  try {
    const poseDoc = await db.collection("poses").doc(poseId).get();

    if (poseDoc.exists) {
      const poseData = {
        id: poseDoc.id,
        ...poseDoc.data(),
      };
      return res.status(200).json(poseData);
    } else {
      console.warn("No pose document found with poseId", poseId);
      return res.status(404).send("Pose not found");
    }
  } catch (error) {
    console.error("Error getting pose:", error);
    res.status(500).send("Error getting pose");
  }
};

// Update a pose by ID
const updatePose = async (req, res) => {
  const poseId = req.params.poseId;
  const { childName, takenTime, files, points } = req.body; // Assuming these are the updatable fields

  if (!poseId) {
    return res.status(400).send("Missing poseId parameter");
  }

  try {
    const poseRef = db.collection("poses").doc(poseId);
    const updateData = {
      childName, // Update only provided fields
      takenTime,
      files,
      points
    };
    await poseRef.update(updateData);
    res.status(200).send("Pose updated successfully");
  } catch (error) {
    console.error("Error updating pose:", error);
    res.status(500).send("Error updating pose");
  }
};

// Delete a pose by ID
const deletePose = async (req, res) => {
  const poseId = req.params.poseId;

  if (!poseId) {
    return res.status(400).send("Missing poseId parameter");
  }

  try {
    const poseRef = db.collection("poses").doc(poseId);
    await poseRef.delete();
    res.status(200).send("Pose deleted successfully");
  } catch (error) {
    console.error("Error deleting pose:", error);
    res.status(500).send("Error deleting pose");
  }
};

module.exports = {
  createPose,
  getAllPoses,
  getOnePose,
  updatePose,
  deletePose
};
