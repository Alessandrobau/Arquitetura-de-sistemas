const Order = require('../models/orderModel');

const orderController = {
  listOrders: async (req, res) => {
    try {
      const orders = await Order.findAll();
      return res.status(200).json(orders);
    } catch (error) {
      console.error("Erro ao listar os pedidos:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  listOrdersById: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({ message: 'pedido não encontrado.' });
      }

      return res.status(200).json(order);
    } catch (error) {
      console.error("erro ao listar pedidos por id:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  createOrder: async (req, res) => {
    const { clientId, itens } = req.body;

    if (!clientId || !itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ message: "cliente e itens são obrigatórios." });
    }

    try {
      const newOrder = await Order.create({ clientId, itens });
      return res.status(201).json({ message: "pedido criado com sucesso", order: newOrder });
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  listOrdersByClient: async (req, res) => {
    try {
      const { clientId } = req.params;
      const orders = await Order.findByClientId(clientId);

      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: 'não foram encontrados pedidos para este cliente.' });
      }

      return res.status(200).json(orders);
    } catch (error) {
      console.error("erro ao listar pedidos por cliente:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  confirmPayment: async (req, res) => {
    const { id } = req.params;
    const { payments } = req.body;

    if (!payments || !Array.isArray(payments) || payments.length === 0) {
      return res.status(400).json({ message: "pagamentos são obrigatórios." });
    }

    try {
      const result = await Order.confirmPayment(Number(id), payments);

      if (result === true) {
        return res.status(200).json({ message: "pagamento confirmado com sucesso." });
      } else if (result === false) {
        const order = await Order.findById(id);
        if (order.status === 'CANCELADO') {
          return res.status(402).json({ message: "pagamento falhou, pedido cancelado." });
        }
      }
    } catch (error) {
      if (error.message === 'pedido não encontrado.') {
        return res.status(404).json({ message: "pedido não encontrado." });
      }
      if (error.message === 'não é possível confirmar o pagamento de um pedido cancelado.') {
        return res.status(409).json({ message: "não é possível confirmar o pagamento de um pedido cancelador." });
      }
      console.error("erro ao confirmar pagamento:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getPayments: async (req, res) => {
    const { id } = req.params;
    try {
      const payments = await Order.getPaymentsByOrder(Number(id));
      return res.status(200).json(payments);
    } catch (error) {
      console.error("erro ao listar pagamentos:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

module.exports = orderController;
