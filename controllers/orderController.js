const Order = require('../models/orderModel');

const orderController = {
  listOrders: async (req, res) => {
    try {
      const orders = await Order.findAll();
      res.status(200).json(orders);
    } catch (error) {
      console.error("Erro ao listar pedidos:", error);
      res.status(500).json({ message: "Erro no servidor", error: error.message });
    }
  },

  listOrdersById: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({ message: 'Pedido não encontrado.' });
      }

      res.status(200).json(order);
    } catch (error) {
      console.error("Erro ao buscar pedido por ID:", error);
      res.status(500).json({ message: "Erro no servidor", error: error.message });
    }
  },

  createOrder: async (req, res) => {
    const { itens } = req.body;

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ message: "Itens inválidos." });
    }

    try {
      const newOrder = await Order.create({ itens });
      res.status(201).json({ message: "Pedido criado com sucesso", order: newOrder });
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      res.status(500).json({ message: "Erro no servidor", error: error.message });
    }
  }
};

module.exports = orderController;
