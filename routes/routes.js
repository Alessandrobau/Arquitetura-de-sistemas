const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const productController = require('../controllers/productController');
const clientController = require('../controllers/clientController');

router.get('/orders', orderController.listOrders);
router.get('/orders/:id', orderController.listOrdersById);
router.post('/orders', orderController.createOrder);
router.get('/orders/client/:clientId', orderController.listOrdersByClient);
router.post('/orders/:id/confirm-payment', orderController.confirmPayment);
router.get('/orders/:id/payments', orderController.getPayments);


router.get('/products', productController.listProducts);
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);
router.get('/products/:id', productController.getProductById);
router.put('/products/:id/stock', productController.updateProductStock);

router.get('/clients', clientController.listClients);
router.post('/clients', clientController.createClient);

module.exports = router;
