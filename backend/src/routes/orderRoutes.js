const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, ctrl.getOrders);
router.get('/:id', protect, ctrl.getOrder);
router.post('/', ctrl.createOrder);
router.patch('/:id/status', protect, adminOnly, ctrl.updateOrderStatus);

module.exports = router;
