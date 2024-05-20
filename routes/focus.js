const express = require('express');
const router = express.Router();
const playerRecordController = require('../controllers/focusController');

// Create or update a player's game record
router.post('/playerRecord', playerRecordController.createOrUpdatePlayerRecord);
router.get('/playerRecord', playerRecordController.getAllPlayerRecordsAll);

// Retrieve all records for a player
router.get('/playerRecord/:playerId', playerRecordController.getAllPlayerRecords);

// Retrieve a specific game record for a player
router.get('/playerRecord/:playerId/:gameType', playerRecordController.getPlayerGameRecord);

// Update a player's game record
router.put('/playerRecord/:playerId/:gameType', playerRecordController.updatePlayerGameRecord);

// Delete a player's game record
router.delete('/playerRecord/:playerId/:gameType', playerRecordController.deletePlayerGameRecord);

module.exports = router;
