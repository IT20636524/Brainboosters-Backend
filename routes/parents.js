const express = require('express');
const { createParent, getOneParent, getParentByEmail } = require('../controllers/parentController');

const router = express.Router();

router.post('/parent', createParent);
router.get('/parent/:parentId', getOneParent);
router.get('/parent/email/:email', getParentByEmail);

module.exports = router;
