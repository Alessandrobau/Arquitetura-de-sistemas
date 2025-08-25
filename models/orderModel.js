const { findById } = require("./productModel");

let orders = [];
let nextOrderId = 1;

const Order = {
    findAll: () => orders,

    findById: (id) => {
        const parsedId = parseInt(id, 10);
        return orders.find(order => order.id === parsedId);
    },

    create: (orderData) => {
        const newOrder = {
            id: nextOrderId++,
            ...orderData,
            status: "Processando",
            data: new Date().toISOString()
        };
        orders.push(newOrder);
        return newOrder;
    }
};

module.exports = Order;