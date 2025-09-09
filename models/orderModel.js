const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const Order = {
  findAll: async () => {
    return await prisma.order.findMany({
      include: {
        orderProducts: { 
          include: { product: true } 
        },
        client: true
      }
    });
  },

  findById: async (id) => {
    return await prisma.order.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        orderProducts: {
          include: { product: true }
        },
        client: true
      }
    });
  },

  create: async (orderData) => {
    return await prisma.$transaction(async (tx) => {
        const { clientId, itens } = orderData;
        const order = await tx.order.create({
            data: { 
                date: new Date(), 
                total_value: 0,
                clientId: clientId,
            }
        });

        let totalOrder = 0;

        for (const item of itens) {
            const productId = item.product_id || item.productId;
            const quantidade = item.quantidade || item.quantity;
            if (!productId) throw new Error('Product ID missing in item.');
            if (!quantidade) throw new Error('Quantity missing in item.');

            const product = await tx.product.findUnique({ where: { id: productId } });
            if (!product) throw new Error(`Product ${productId} not found`);
            if (product.stock < quantidade) throw new Error(`Insufficient stock for product ${product.name}`);

            const unitValue = Number(product.price);
            const totalValue = unitValue * quantidade;

            await tx.orderProduct.create({
                data: {
                    quant: quantidade,
                    unit_value: unitValue,
                    total_value: totalValue,
                    id_product: product.id,
                    id_order: order.id
                }
            });

            await tx.product.update({
                where: { id: product.id },
                data: { stock: product.stock - quantidade }
            });

            totalOrder += totalValue;
        }

        await tx.order.update({
            where: { id: order.id },
            data: { total_value: totalOrder }
        });

        const updatedOrder = await tx.order.findUnique({
            where: { id: order.id },
            include: {
                orderProducts: {
                    include: { product: true }
                },
                client: true
            }
        });

        return updatedOrder;
    });
  },

    findByClientId: async (clientId) => {
        return await prisma.order.findMany({
            where: { clientId: parseInt(clientId, 10) },
            include: {
                orderProducts: {
                    include: { product: true }
                },
                client: true
            }
        });
    },
};

const confirmPayment = async (orderId, payments) => {
    const id = Number(orderId);
    if (isNaN(id)) throw new Error('ID do pedido inválido.');

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new Error('Pedido não encontrado.');

    if (order.status === 'CANCELADO') {
        throw new Error('Não é possível confirmar pagamento para um pedido cancelado.');
    }

    if (order.status === 'PAGO') {
        return true;
    }

    const totalPayments = payments.reduce((sum, p) => sum + Number(p.value), 0);
    const totalOrder = Number(order.total_value);

    // simula pagamento
    let failed = false;
    for (const payment of payments) {
        if (Math.random() < 0.2) {
            failed = true;
            break;
        }
    }

    for (const payment of payments) {
        await prisma.payment.create({
            data: {
                method: payment.method,
                value: payment.value,
                orderId: id
            }
        });
    }

    if (failed) {
        await prisma.order.update({
            where: { id },
            data: { status: 'CANCELADO' }
        });
        return false;
    }

    if (totalPayments >= totalOrder) {
        await prisma.order.update({
            where: { id },
            data: { status: 'PAGO' }
        });
        return true;
    } else {
        await prisma.order.update({
            where: { id },
            data: { status: 'AGUARDANDO_PAGAMENTO' }
        });
        return false;
    }
};

const getPaymentsByOrder = async (orderId) => {
    return prisma.payment.findMany({
        where: { orderId: orderId }
    });
};

module.exports = {
    ...Order,
    confirmPayment,
    getPaymentsByOrder
};
