const { db } = require("../config/firebase");
const firebase = require('firebase-admin');

// Create a new quiz
const createQuiz = async (req, res) => {
  const { childName, takenDate, points, emotion, testName, timeTaken } = req.body;

  if (!childName || !takenDate || !points || !emotion || !testName || !timeTaken) {
    return res.status(400).send("Missing required fields: childName, takenDate, points, emotion, testName, timeTaken");
  }

  try {
    const quizRef = db.collection("quizzes").doc();
    const quizData = {
      childName,
      takenDate,
      points,
      emotion,
      testName,
      timeTaken
    };
    await quizRef.set(quizData);
    res.status(201).send("Quiz created successfully");
  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).send("Error creating quiz");
  }
};

// Retrieve all quizzes
const getAllQuizzes = async (req, res) => {
  try {
    const quizzesSnapshot = await db.collection("quizzes").get();
    const quizzes = quizzesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(quizzes);
  } catch (error) {
    console.error("Error getting all quizzes:", error);
    res.status(500).send("Error getting quizzes");
  }
};

// Retrieve one quiz by ID
const getOneQuiz = async (req, res) => {
  const quizId = req.params.quizId;

  if (!quizId) {
    return res.status(400).send("Missing quizId parameter");
  }

  try {
    const quizDoc = await db.collection("quizzes").doc(quizId).get();

    if (quizDoc.exists) {
      const quizData = {
        id: quizDoc.id,
        ...quizDoc.data(),
      };
      return res.status(200).json(quizData);
    } else {
      console.warn("No quiz document found with quizId", quizId);
      return res.status(404).send("Quiz not found");
    }
  } catch (error) {
    console.error("Error getting quiz:", error);
    res.status(500).send("Error getting quiz");
  }
};

// Update a quiz by ID
const updateQuiz = async (req, res) => {
  const quizId = req.params.quizId;
  const { childName, takenDate, points, emotion, testName, timeTaken } = req.body; // Assuming these are the updatable fields

  if (!quizId) {
    return res.status(400).send("Missing quizId parameter");
  }

  try {
    const quizRef = db.collection("quizzes").doc(quizId);
    const updateData = {
      childName, // Update only provided fields
      takenDate,
      points,
      emotion,
      testName,
      timeTaken
    };
    await quizRef.update(updateData);
    res.status(200).send("Quiz updated successfully");
  } catch (error) {
    console.error("Error updating quiz:", error);
    res.status(500).send("Error updating quiz");
  }
};

// Delete a quiz by ID
const deleteQuiz = async (req, res) => {
  const quizId = req.params.quizId;

  if (!quizId) {
    return res.status(400).send("Missing quizId parameter");
  }

  try {
    const quizRef = db.collection("quizzes").doc(quizId);
    await quizRef.delete();
    res.status(200).send("Quiz deleted successfully");
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).send("Error deleting quiz");
  }
};

module.exports = {
  createQuiz,
  getAllQuizzes,
  getOneQuiz,
  updateQuiz,
  deleteQuiz
};
