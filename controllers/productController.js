const Product = require('../models/productModel');

const productController = {
    // listar todos os produtos
    listProducts: async (req, res) => {
        try {
            const products = await Product.findAll();
            res.status(200).json(products);
        } catch (error) {
            console.error("Erro ao listar produtos:", error);
            res.status(500).json({ message: "Erro no servidor" });
        }
    },

    // buscar produto por ID
    getProductById: async (req, res) => {
        try {
            const { id } = req.params;
            const product = await Product.findById(id);

            if (!product) {
                return res.status(404).json({ message: "Produto não encontrado." });
            }

            res.status(200).json(product);
        } catch (error) {
            console.error("Erro ao buscar produto:", error);
            res.status(500).json({ message: "Erro no servidor" });
        }
    },

    // criar novo produto
    createProduct: async (req, res) => {
        try {
            const { name, price, stock } = req.body;

            if (!name || !price || stock == null) {
                return res.status(400).json({ message: "Dados inválidos. Informe nome, preço e estoque." });
            }

            const newProduct = await Product.create({ name, price, stock });
            res.status(201).json(newProduct);
        } catch (error) {
            console.error("Erro ao criar produto:", error);
            res.status(500).json({ message: "Erro no servidor" });
        }
    }
};

module.exports = productController;
