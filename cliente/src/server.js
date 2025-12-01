const express = require("express");
const clienteRoutes = require("./routes/cliente_routes");

const app = express();
const PORT = process.env.PORT || 3001; 

app.use(express.json({ limit: '200kb' }));

app.use("/api", clienteRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor de Clientes rodando na porta ${PORT}`);
});