const Product = require('../models/productModel');

const productController = {
    listProducts: (req, res) => {
        const products = Product.findAll();
        res.json(products);
    },
};

module.exports = productController;