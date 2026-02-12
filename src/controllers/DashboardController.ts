import { Request, Response } from 'express';
import Product from '../models/Product';
import Sale from '../models/Sale';

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
  res.json({
    sales: sales.map(s => ({
      id: s.id,
      product_name: String(s.productId),
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
