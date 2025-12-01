const { produtoService } = require("../services/produto_service.js");
const cache = require('../cache');

async function createProduct(req, res) {
  try {
    const product = await produtoService.create(req.body);
    // invalidate products list cache
    try { await cache.del('products:all'); } catch(_) {}
    return res.status(201).json(product);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function getAllProducts(req, res) {
  try {
    const cacheKey = 'products:all';
    const cached = await cache.get(cacheKey);
    if (cached) return res.json(cached);

    const products = await produtoService.getAll();
    // TTL 4 horas
    await cache.set(cacheKey, products, 4 * 60 * 60);
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getProductById(req, res) {
  try {
    const id = req.params.id;
    // try cached individual product first
    const cached = await cache.get(`product:${id}`);
    if (cached) return res.json(cached);

    const product = await produtoService.getById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // cache individual product for a short time to reduce DB hits (e.g., 1 hour)
    await cache.set(`product:${id}`, product, 60 * 60);
    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function updateProduct(req, res) {
  try {
    const product = await produtoService.update(
      req.params.id,
      req.body
    );
    // invalidate products list and individual cache
    try { await cache.del('products:all'); await cache.del(`product:${req.params.id}`); } catch(_) {}
    return res.json(product);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function deleteProduct(req, res) {
  try {
    await produtoService.softDelete(req.params.id);
    try { await cache.del('products:all'); await cache.del(`product:${req.params.id}`); } catch(_) {}
    return res.status(204).send();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function updateStock(req, res) {
  try {
    const { quantity } = req.body;
    const product = await produtoService.updateStock(
      req.params.id,
      quantity
    );
    try { await cache.del('products:all'); await cache.del(`product:${req.params.id}`); } catch(_) {}
    return res.json(product);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
};