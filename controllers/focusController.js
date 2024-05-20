const { db } = require("../config/firebase");
const firebase = require('firebase-admin');

// Create or update a player's game record
const createOrUpdatePlayerRecord = async (req, res) => {
  const { playerId, gameType, level, percentage, time, timestamp, username } = req.body;

  if (!playerId || !gameType || !level || !percentage || !time || !timestamp || !username) {
    return res.status(400).send("Missing required fields: playerId, gameType, level, percentage, time, timestamp, username");
  }

  try {
    const playerRecordRef = db.collection("playerRecord").doc(playerId).collection(gameType).doc('record');
    const recordData = {
      level,
      percentage,
      time,
      timestamp,
      username
    };
    await playerRecordRef.set(recordData, { merge: true });
    res.status(201).send("Player record created or updated successfully");
  } catch (error) {
    console.error("Error creating or updating player record:", error);
    res.status(500).send("Error creating or updating player record");
  }
};

// Retrieve all records for a player
const getAllPlayerRecords = async (req, res) => {
    const playerId = req.params.playerId;
  
    if (!playerId) {
      return res.status(400).send("Missing playerId parameter");
    }
  
    try {
      const playerRecordRef = db.collection("playerRecord").doc(playerId);
  
      // Retrieve all documents under the Puzzle subcollection
      const puzzleSnapshot = await playerRecordRef.collection("Puzzle").get();
      const puzzleRecords = puzzleSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      // Retrieve all documents under the Tetris subcollection
      const tetrisSnapshot = await playerRecordRef.collection("Tetris").get();
      const tetrisRecords = tetrisSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      const playerRecords = {
        Puzzle: puzzleRecords.length > 0 ? puzzleRecords : null,
        Tetris: tetrisRecords.length > 0 ? tetrisRecords : null,
      };
  
      res.status(200).json(playerRecords);
    } catch (error) {
      console.error("Error getting player records:", error);
      res.status(500).send("Error getting player records");
    }
  };

  const getAllPlayerRecordsAll = async (req, res) => {
    try {
        console.log("playerId")
      const playerRecordsSnapshot = await db.collection("playerRecord").get();
      const allPlayerRecords = {};
  
      for (const playerDoc of playerRecordsSnapshot.docs) {
        const playerId = playerDoc.id;
        console.log("playerId")
        const playerRecordRef = db.collection("playerRecord").doc(playerId);
  
        // Retrieve all documents under the Puzzle subcollection
        const puzzleSnapshot = await playerRecordRef.collection("Puzzle").get();
        const puzzleRecords = puzzleSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
  
        // Retrieve all documents under the Tetris subcollection
        const tetrisSnapshot = await playerRecordRef.collection("Tetris").get();
        const tetrisRecords = tetrisSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
  
        allPlayerRecords[playerId] = {
          Puzzle: puzzleRecords.length > 0 ? puzzleRecords : null,
          Tetris: tetrisRecords.length > 0 ? tetrisRecords : null,
        };
      }
  
      res.status(200).json(allPlayerRecords);
    } catch (error) {
      console.error("Error getting all player records:", error);
      res.status(500).send("Error getting all player records");
    }
  };
  

// Retrieve a specific game record for a player
const getPlayerGameRecord = async (req, res) => {
  const { playerId, gameType } = req.params;

  if (!playerId || !gameType) {
    return res.status(400).send("Missing playerId or gameType parameter");
  }

  try {
    const gameDoc = await db.collection("playerRecord").doc(playerId).collection(gameType).doc('record').get();

    if (gameDoc.exists) {
      return res.status(200).json(gameDoc.data());
    } else {
      return res.status(404).send("Game record not found");
    }
  } catch (error) {
    console.error("Error getting player game record:", error);
    res.status(500).send("Error getting player game record");
  }
};

// Update a player's game record
const updatePlayerGameRecord = async (req, res) => {
  const { playerId, gameType } = req.params;
  const { level, percentage, time, timestamp, username } = req.body;

  if (!playerId || !gameType) {
    return res.status(400).send("Missing playerId or gameType parameter");
  }

  try {
    const playerRecordRef = db.collection("playerRecord").doc(playerId).collection(gameType).doc('record');
    const updateData = {
      level,
      percentage,
      time,
      timestamp,
      username
    };
    await playerRecordRef.update(updateData);
    res.status(200).send("Player game record updated successfully");
  } catch (error) {
    console.error("Error updating player game record:", error);
    res.status(500).send("Error updating player game record");
  }
};

// Delete a player's game record
const deletePlayerGameRecord = async (req, res) => {
  const { playerId, gameType } = req.params;

  if (!playerId || !gameType) {
    return res.status(400).send("Missing playerId or gameType parameter");
  }

  try {
    const playerRecordRef = db.collection("playerRecord").doc(playerId).collection(gameType).doc('record');
    await playerRecordRef.delete();
    res.status(200).send("Player game record deleted successfully");
  } catch (error) {
    console.error("Error deleting player game record:", error);
    res.status(500).send("Error deleting player game record");
  }
};

module.exports = {
  createOrUpdatePlayerRecord,
  getAllPlayerRecords,
  getPlayerGameRecord,
  updatePlayerGameRecord,
  deletePlayerGameRecord,
  getAllPlayerRecordsAll
};
