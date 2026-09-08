const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/settingController');
const { protect, adminOnly } = require('../middleware/auth');
const { handleSingleUpload } = require('../middleware/upload');

router.get('/', ctrl.getSettings);
router.get('/:key', ctrl.getSetting);
router.put('/:key', protect, adminOnly, handleSingleUpload, ctrl.updateSetting);

module.exports = router;
