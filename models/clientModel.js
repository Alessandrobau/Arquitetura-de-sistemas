const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const Client = {
    findAll: async () => {
        return await prisma.client.findMany();
    },

    create: async ({ name, email }) => {
        return await prisma.client.create({
            data: { name, email }
        });
    },

    findById: async (id) => {
        return await prisma.client.findUnique({
            where: { id: parseInt(id, 10) }
        });
    },

    findByEmail: async (email) => {
        return await prisma.client.findUnique({
            where: { email }
        });
    },
};

module.exports = Client;