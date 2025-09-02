const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const productController = require('../controllers/productController');

router.get('/orders', orderController.listOrders);

router.get('/orders/:id', orderController.listOrdersById);

router.post('/orders', orderController.createOrder);

router.get('/products', productController.listProducts);

router.post('/products', productController.createProduct);

router.post('/products/:id', productController.updateProduct);

router.delete('/products/:id', productController.deleteProduct);

router.get('/products/:id', productController.getProductById);

module.exports = router;
