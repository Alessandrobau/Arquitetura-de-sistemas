const Product = require('../models/productModel');

const productController = {
  listProducts: async (req, res) => {
    try {
      const products = await Product.findAll();
      return res.status(200).json(products);
    } catch (error) {
      console.error("Erro ao listar produtos:", error);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
  },

  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado." });
      }

      return res.status(200).json(product);
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
  },

  createProduct: async (req, res) => {
    try {
      const { name, price, stock } = req.body;

      if (!name || !price || stock == null) {
        return res.status(400).json({ message: "Nome, preço e estoque são obrigatórios." });
      }

      const newProduct = await Product.create({ name, price, stock });
      return res.status(201).json(newProduct);
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
  },

  updateProduct: async (req, res) => {
    const id = parseInt(req.params.id);
    const { stock, ...productData } = req.body;

    if (stock !== undefined) {
      return res.status(400).json({
        message: "Atualização de estoque não é permitida aqui. Use /products/:id/stock."
      });
    }

    try {
      const updatedProduct = await Product.updateById(id, productData);

      if (!updatedProduct) {
        return res.status(404).json({ message: 'Produto não encontrado.' });
      }

      return res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  },

  deleteProduct: async (req, res) => {
    const id = parseInt(req.params.id);

    try {
      const deletedProduct = await Product.delete(id);
      if (!deletedProduct) {
        return res.status(404).json({ message: 'Produto não encontrado.' });
      }
      return res.status(204).send();
    } catch (error) {
      if (error.message && error.message.includes('vinculado a um pedido')) {
        return res.status(409).json({ message: error.message });
      }
      console.error("Erro ao excluir produto:", error);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  },

  updateProductStock: async (req, res) => {
    const id = parseInt(req.params.id);
    const { quantidade } = req.body;

    if (typeof quantidade !== 'number' || isNaN(quantidade)) {
      return res.status(400).json({ message: 'O campo "quantidade" deve ser um número.' });
    }

    try {
      const updatedProduct = await Product.updateStock(id, quantidade);

      if (!updatedProduct) {
        return res.status(404).json({ message: 'Produto não encontrado.' });
      }

      return res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Erro ao atualizar estoque do produto:", error);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }
};

module.exports = productController;
