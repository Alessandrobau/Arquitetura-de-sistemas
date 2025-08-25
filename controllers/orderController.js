const Product = require('../models/productModel');
const Order = require('../models/orderModel');

const orderController = {
    listOrders: (req, res) => {
        const orders = Order.findAll();
        res.json(orders);
    },

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

            if (!product) {
                stockErros.push(`product com ID ${item.product_id} não encontrado.`);
                continue;
            }

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