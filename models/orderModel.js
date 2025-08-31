const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const Order = {
  // Listar todas as ordens com produtos
  findAll: async () => {
    return await prisma.order.findMany({
      include: {
        orderProducts: { // relacionamentos corretos
          include: { product: true } // inclui os detalhes do produto
        }
      }
    });
  },

  // Buscar ordem por ID
  findById: async (id) => {
    return await prisma.order.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        orderProducts: {
          include: { product: true }
        }
      }
    });
  },

  // Criar ordem com itens e atualizar estoque
  create: async (orderData) => {
    return await prisma.$transaction(async (tx) => {
      // Criar ordem com valor inicial 0
      const order = await tx.order.create({
        data: { date: new Date(), total_value: 0 }
      });

      let totalOrder = 0;

      for (const item of orderData.itens) {
        const product = await tx.product.findUnique({
          where: { id: item.product_id }
        });

        if (!product) {
          throw new Error(`Produto ${item.product_id} não encontrado`);
        }

        if (product.stock < item.quantidade) {
          throw new Error(`Estoque insuficiente para o produto ${product.name}`);
        }

        const unitValue = Number(product.price);
        const totalValue = unitValue * item.quantidade;

        // Criar item na tabela OrderProduct
        await tx.orderProduct.create({
          data: {
            quant: item.quantidade,
            unit_value: unitValue,
            total_value: totalValue,
            id_product: product.id,
            id_order: order.id
          }
        });

        // Atualizar estoque do produto
        await tx.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantidade }
        });

        totalOrder += totalValue;
      }

      // Atualizar total da ordem
      await tx.order.update({
        where: { id: order.id },
        data: { total_value: totalOrder }
      });

      return order;
    });
  }
};

module.exports = Order;
