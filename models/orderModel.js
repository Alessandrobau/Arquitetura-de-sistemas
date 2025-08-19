let orders = [];
let nextOrderId = 1;

const Order = {
    findAll: () => orders,

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