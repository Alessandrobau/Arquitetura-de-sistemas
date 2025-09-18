const express = require('express');
const app = express();
const port = 3000;

const orderRoutes = require('./routes/routes');

app.use(express.json());

app.use('/', orderRoutes);

app.get('/', (req, res) => {
    res.send('API de Pedidos funcionando!');
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});