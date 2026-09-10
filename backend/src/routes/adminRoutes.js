const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');
const productCtrl = require('../controllers/productController');
const orderCtrl = require('../controllers/orderController');
const categoryCtrl = require('../controllers/categoryController');
const settingCtrl = require('../controllers/settingController');
const { protect, adminOnly } = require('../middleware/auth');
const { handleMultiUpload, handleSingleUpload } = require('../middleware/upload');

router.use(protect, adminOnly);

router.get('/dashboard', adminCtrl.getDashboard);
router.get('/cloudinary', adminCtrl.listCloudinaryImages);

router.post('/upload-image', handleSingleUpload, (req, res) => {
  if (!req.uploadedUrl) {
    return res.status(400).json({ success: false, message: 'No image uploaded' });
  }
  res.json({ success: true, data: { url: req.uploadedUrl } });
});

router.post('/upload-multiple', handleMultiUpload, (req, res) => {
  if (!req.uploadedUrls?.length) {
    return res.status(400).json({ success: false, message: 'No images uploaded' });
  }
  res.json({ success: true, data: { urls: req.uploadedUrls } });
});


router.get('/products', productCtrl.getProducts);
router.post('/products', handleMultiUpload, productCtrl.createProduct);
router.put('/products/:id', handleMultiUpload, productCtrl.updateProduct);
router.delete('/products/:id', productCtrl.deleteProduct);
router.patch('/products/:id/stock', productCtrl.updateStock);

router.get('/orders', orderCtrl.getOrders);
router.patch('/orders/:id/status', orderCtrl.updateOrderStatus);
router.delete('/orders/:id', orderCtrl.deleteOrder);

router.get('/categories', categoryCtrl.getCategories);
router.post('/categories', handleSingleUpload, categoryCtrl.createCategory);
router.put('/categories/:id', handleSingleUpload, categoryCtrl.updateCategory);
router.delete('/categories/:id', categoryCtrl.deleteCategory);

router.get('/settings', settingCtrl.getSettings);
router.put('/settings/:key', handleSingleUpload, settingCtrl.updateSetting);

module.exports = router;
