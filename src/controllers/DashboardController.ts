import { Request, Response } from 'express';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import { Op } from 'sequelize';

export async function stats(req: Request, res: Response) {
  const userId = (req as any).userId || 1;
  const productsCount = await Product.count({ where: { userId } });
  const sales = await Sale.findAll({ where: { userId } });
  const totalSales = sales.reduce((s, v) => s + v.total, 0);
  const totalItemsSold = sales.reduce((s, v) => s + v.quantity, 0);
  res.json({ totalSales, totalProducts: productsCount, totalItemsSold });
}

export async function recentSales(req: Request, res: Response) {
  const userId = (req as any).userId || 1;
  const sales = await Sale.findAll({ where: { userId }, order: [['id', 'DESC']], limit: 10 });
  const ids = Array.from(new Set(sales.map(s => s.productId)));
  const products = ids.length ? await Product.findAll({ where: { id: { [Op.in]: ids } } }) : [];
  const nameMap = new Map(products.map(p => [p.id, p.name]));
  res.json({
    sales: sales.map(s => ({
      id: s.id,
      product_name: nameMap.get(s.productId) || String(s.productId),
      quantity: s.quantity,
      total: s.total.toFixed(2),
      date: new Date(s.createdAt as any).toLocaleString()
    }))
  });
}

export async function lowStock(req: Request, res: Response) {
  const userId = (req as any).userId || 1;
  const products = await Product.findAll({ where: { userId }, order: [['stock', 'ASC']], limit: 5 });
  res.json({
    count: products.length,
    products: products.map(p => ({ name: p.name, stock: p.stock }))
  });
}

export async function topProducts(req: Request, res: Response) {
  const userId = (req as any).userId || 1;
  const sales = await Sale.findAll({ where: { userId } });
  const counts: Record<string, number> = {};
  sales.forEach(s => {
    const key = String(s.productId);
    counts[key] = (counts[key] || 0) + s.quantity;
  });
  const topIds = Object.entries(counts)
    .map(([id, total_sold]) => ({ id: parseInt(id, 10), total_sold }))
    .sort((a, b) => b.total_sold - a.total_sold)
    .slice(0, 5);
  const products = topIds.length ? await Product.findAll({ where: { id: { [Op.in]: topIds.map(i => i.id) } } }) : [];
  const nameMap = new Map(products.map(p => [p.id, p.name]));
  res.json({ products: topIds.map(i => ({ name: nameMap.get(i.id) || String(i.id), total_sold: i.total_sold })) });
}
