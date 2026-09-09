const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/auth');
const { handleSingleUpload } = require('../middleware/upload');

router.get('/', ctrl.getCategories);
router.post('/', protect, adminOnly, handleSingleUpload, ctrl.createCategory);
router.put('/:id', protect, adminOnly, handleSingleUpload, ctrl.updateCategory);
router.delete('/:id', protect, adminOnly, ctrl.deleteCategory);

module.exports = router;
