import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';

export async function daily(req: Request, res: Response) {
  const userId = (req as any).userId || 1;
  const start = String(req.query.start || '');
  const end = String(req.query.end || '');
  const startDate = start ? new Date(start + 'T00:00:00') : new Date();
  const endDate = end ? new Date(end + 'T23:59:59') : new Date();
  const sales = await (Sale as any).findAll({
    where: { userId, createdAt: { [Op.between]: [startDate as any, endDate as any] } },
    order: [['createdAt', 'ASC']]
  });
  const totalRevenue = sales.reduce((s, v) => s + Number(v.total), 0);
  const totalItems = sales.reduce((s, v) => s + Number(v.quantity), 0);
  const byDate = new Map<string, { total: number }>();
  sales.forEach(s => {
    const d = new Date(s.createdAt as any).toISOString().slice(0, 10);
    const cur = byDate.get(d) || { total: 0 };
    cur.total += Number(s.total);
    byDate.set(d, cur);
  });
  const points = Array.from(byDate.entries()).map(([date, v]) => ({ date, total: Number(v.total.toFixed(2)) }));
  const byProduct = new Map<number, { quantity: number; revenue: number }>();
  sales.forEach(s => {
    const cur = byProduct.get(s.productId) || { quantity: 0, revenue: 0 };
    cur.quantity += Number(s.quantity);
    cur.revenue += Number(s.total);
    byProduct.set(s.productId, cur);
  });
  const ids = Array.from(byProduct.keys());
  const products = ids.length ? await (Product as any).findAll({ where: { id: { [Op.in]: ids } } }) : [];
  const nameMap = new Map(products.map(p => [p.id, p.name]));
  const topProducts = Array.from(byProduct.entries())
    .map(([id, v]) => ({ name: nameMap.get(id) || String(id), quantity: v.quantity, revenue: Number(v.revenue.toFixed(2)) }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  res.json({ totalRevenue: Number(totalRevenue.toFixed(2)), totalItems, points, topProducts });
}
