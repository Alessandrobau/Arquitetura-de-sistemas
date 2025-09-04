const Client = require('../models/clientModel');

const clientController = {
  listClients: async (req, res) => {
    try {
      const clients = await Client.findAll();
      return res.status(200).json(clients);
    } catch (error) {
      console.error("Erro ao listar os clientes:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  createClient: async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "nome e email são obrigatórios." });
    }

    try {
      const existing = await Client.findByEmail(email);
      if (existing) {
        return res.status(409).json({ message: "Email já cadastrado." });
      }

      const newClient = await Client.create({ name, email });
      return res.status(201).json({ message: "Cliente criado com sucesso", client: newClient });
    } catch (error) {
      console.error("erro ao criar cliente:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

module.exports = clientController;