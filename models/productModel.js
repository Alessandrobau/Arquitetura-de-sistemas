let products = [
    { id: 1, nome: 'Notebook', preco: 3500.00, estoque: 5 },
    { id: 2, nome: 'Mouse', preco: 89.90, estoque: 10 },
    { id: 3, nome: 'Teclado', preco: 250.00, estoque: 3 },
    { id: 4, nome: 'Monitor"', preco: 950.00, estoque: 1 }
];

const Product = {
    findAll: () => products,
    
    findById: (id) => products.find(p => p.id === id),

    updateStock: (productId, quantity) => {
        const product = Product.findById(productId);
        if (product) {
            product.estoque -= quantity;
        }
    }
};

module.exports = Product;