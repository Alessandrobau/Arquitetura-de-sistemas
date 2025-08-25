const Product = require('../models/productModel');
const Order = require('../models/orderModel');

const orderController = {
    //listar todos os pedidos
    listOrders: (req, res) => {
        const orders = Order.findAll();
        res.json(orders);
    },

    // listar por ID
    listOrdersById: (req, res) => {
        try {
            const { id } = req.params;

            const order = Order.findById(id);

            if (!order) {
                return res.status(404).json({ message: 'Pedido nao encontrado. '});
            }

            res.status(200).json(order);

        } catch (error) {
            console.error('Erro ao buscar pedido por ID: ', error);
            res.status(500).json({ message: 'Ocorreu um erro no servidor '});
        }
    },

    //criar novo pedido
    createOrder: (req, res) => {
        const { cliente_id, itens } = req.body;

        if (!cliente_id || !itens || !Array.isArray(itens) || itens.length === 0) {
            return res.status(400).json({ mensagem: "Requisição inválida. Verifique os dados do pedido." });
        }

        let totalValue = 0;
        const orderItems = [];
        const stockErros = [];
        const productsToUpdate = [];

        for (const item of itens) {
            const product = Product.findById(item.product_id);

            // verificar se existe
            if (!product) {
                stockErros.push(`product com ID ${item.product_id} não encontrado.`);
                continue;
            }
            
            // verificar se tem no estoque
            if (product.estoque < item.quantidade) {
                stockErros.push(`Estoque insuficiente para o product '${product.nome}'. Solicitado: ${item.quantidade}, Disponível: ${product.estoque}.`);
            } else {
                totalValue += product.preco * item.quantidade;
                orderItems.push({
                    product_id: product.id,
                    nome_product: product.nome,
                    quantidade: item.quantidade,
                    preco_unitario: product.preco
                });
                productsToUpdate.push({ id: product.id, quantidade: item.quantidade });
            }
        }

        if (stockErros.length > 0) {
            return res.status(400).json({
                mensagem: "Não foi possível processar o pedido por falta de estoque.",
                erros: stockErros
            });
        }

        
        productsToUpdate.forEach(p => Product.updateStock(p.id, p.quantidade));
        
        const newOrder = Order.create({
            cliente_id,
            itens: orderItems,
            valor_total: totalValue
        });

        return res.status(201).json(newOrder);
    }
};

module.exports = orderController;