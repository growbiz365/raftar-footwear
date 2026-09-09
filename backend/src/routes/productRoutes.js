const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const { handleMultiUpload, handleSingleUpload } = require('../middleware/upload');

router.get('/', ctrl.getProducts);
router.get('/:id', ctrl.getProduct);
router.post('/', protect, adminOnly, handleMultiUpload, ctrl.createProduct);
router.put('/:id', protect, adminOnly, handleMultiUpload, ctrl.updateProduct);
router.delete('/:id', protect, adminOnly, ctrl.deleteProduct);
router.patch('/:id/stock', protect, adminOnly, ctrl.updateStock);

module.exports = router;
