import { Request, Response } from 'express';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import { Op } from 'sequelize';

export async function productsInStock(req: Request, res: Response) {
  const userId = (req as any).userId || 1;
  const products = await (Product as any).findAll({ where: { userId, stock: { [Op.gt]: 0 } }, order: [['name', 'ASC']] });
  res.json({
    products: products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      image: p.image,
      image_url: p.image ? `${req.protocol}://${req.get('host')}/storage/${p.image}` : null
    }))
  });
}

export async function index(req: Request, res: Response) {
  const userId = (req as any).userId || 1;
  const sales = await (Sale as any).findAll({ where: { userId }, order: [['id', 'DESC']], limit: 100 });
  const ids = Array.from(new Set(sales.map(s => s.productId)));
  const products = ids.length ? await (Product as any).findAll({ where: { id: { [Op.in]: ids } } }) : [];
  const nameMap = new Map(products.map(p => [p.id, p.name]));
  res.json({
    sales: sales.map(s => ({
      id: s.id,
      product_name: nameMap.get(s.productId) || String(s.productId),
      quantity: s.quantity,
      total: Number(s.total).toFixed(2),
      date: new Date(s.createdAt as any).toLocaleString()
    }))
  });
}

export async function store(req: Request, res: Response) {
  const userId = (req as any).userId || 1;
  const { product_id, quantity } = req.body || {};
  const pid = Number(product_id);
  const qty = Number(quantity);
  if (!pid || !qty || qty <= 0) return res.status(422).json({ message: 'invalid' });
  const product = await (Product as any).findOne({ where: { id: pid, userId } });
  if (!product) return res.status(404).json({ message: 'product not found' });
  if (product.stock < qty) return res.status(422).json({ message: 'insufficient stock' });
  const total = Number(product.price) * qty;
  const sale = await (Sale as any).create({ userId, productId: pid, quantity: qty, total });
  await product.update({ stock: product.stock - qty });
  res.json({ success: true, id: sale.id });
}
