const { PrismaClient } = require('@prisma/client');
const { updateProduct } = require('../controllers/productController');
const prisma = new PrismaClient();

const Product = {
    findAll: async () => {
        return await prisma.product.findMany();
    },

    findById: async (id) => {
        return await prisma.product.findUnique({
            where: { id: parseInt(id, 10) }
        });
    },

    create: async ({ name, price, stock }) => {
        return await prisma.product.create({
            data: { name, price, stock }
        });
    },

    updateStock: async (id, quantidade) => {
        if (typeof quantidade !== 'number' || isNaN(quantidade)) {
            throw new Error('Invalid quantity for stock update.');
        }
        return await prisma.product.update({
            where: { id: parseInt(id, 10) },
            data: { stock: { decrement: quantidade } }
        });
    },

    updateStockbyId: async (id, stock) => {
        return await prisma.product.update({
            where: { id: parseInt(id, 10) },
            data: { stock: stock }
        });
    },

    updateById: async (id, productData) => {
        const product = await prisma.product.update({
            where: { id: id },
            data: productData,
        });
        return product;
    },

    delete: async (id) => {
        const related = await prisma.orderProduct.findFirst({
            where: { id_product: parseInt(id, 10) }
        });
        if (related) {
            throw new Error('Não é possível excluir: produto já está vinculado a um pedido.');
        }
        const deletedProduct = await prisma.product.delete({
            where: { id: parseInt(id, 10) }
        });
        return deletedProduct;
    }
};

module.exports = Product;
