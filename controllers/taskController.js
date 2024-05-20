const { db } = require("../config/firebase");
const firebase = require('firebase-admin');

// Create a new task
const createTask = async (req, res) => {
  const { childName, test, difficulty, takenTime, points, takenDate } = req.body;

  if (!childName || !test || !difficulty || !takenTime || !points || !takenDate) {
    return res.status(400).send("Missing required fields: childName, test, difficulty, takenTime, points, takenDate");
  }

  try {
    const taskRef = db.collection("tasks").doc();
    const taskData = {
      childName,
      test,
      difficulty,
      takenTime,  // Ensure takenTime is a string in the request body
      points,
      takenDate: firebase.firestore.Timestamp.fromDate(new Date(takenDate))  // Store takenDate as a timestamp
    };
    await taskRef.set(taskData);
    res.status(201).send("Task created successfully");
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).send("Error creating task");
  }
};

// Retrieve all tasks
const getAllTasks = async (req, res) => {
  try {
    const tasksSnapshot = await db.collection("tasks").get();
    const tasks = tasksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error getting all tasks:", error);
    res.status(500).send("Error getting tasks");
  }
};

// Retrieve one task by ID
const getOneTask = async (req, res) => {
  const taskId = req.params.taskId;

  if (!taskId) {
    return res.status(400).send("Missing taskId parameter");
  }

  try {
    const taskDoc = await db.collection("tasks").doc(taskId).get();

    if (taskDoc.exists) {
      const taskData = {
        id: taskDoc.id,
        ...taskDoc.data(),
      };
      return res.status(200).json(taskData);
    } else {
      console.warn("No task document found with taskId", taskId);
      return res.status(404).send("Task not found");
    }
  } catch (error) {
    console.error("Error getting task:", error);
    res.status(500).send("Error getting task");
  }
};

// Update a task by ID
const updateTask = async (req, res) => {
  const taskId = req.params.taskId;
  const { childName, test, difficulty, takenTime, points, takenDate } = req.body; // Assuming these are the updatable fields

  if (!taskId) {
    return res.status(400).send("Missing taskId parameter");
  }

  try {
    const taskRef = db.collection("tasks").doc(taskId);
    const updateData = {
      childName, // Update only provided fields
      test,
      difficulty,
      takenTime,
      points,
      takenDate: takenDate ? firebase.firestore.Timestamp.fromDate(new Date(takenDate)) : undefined
    };
    await taskRef.update(updateData);
    res.status(200).send("Task updated successfully");
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).send("Error updating task");
  }
};

// Delete a task by ID
const deleteTask = async (req, res) => {
  const taskId = req.params.taskId;

  if (!taskId) {
    return res.status(400).send("Missing taskId parameter");
  }

  try {
    const taskRef = db.collection("tasks").doc(taskId);
    await taskRef.delete();
    res.status(200).send("Task deleted successfully");
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).send("Error deleting task");
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getOneTask,
  updateTask,
  deleteTask
};
