const express = require('express');
const router = express.Router();

// Example route
router.get('/', (req, res) => {
  res.send('Bills API is working');
});

module.exports = router;
