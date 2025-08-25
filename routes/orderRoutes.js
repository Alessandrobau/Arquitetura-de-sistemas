const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const productController = require('../controllers/productController');

router.get('/orders', orderController.listOrders);

router.get('/orders/:id', orderController.listOrdersById);

router.post('/orders', orderController.createOrder);

router.get('/products', productController.listProducts);

module.exports = router;