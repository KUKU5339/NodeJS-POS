import { Request, Response } from 'express';
import Product from '../models/Product.js';
import path from 'path';

function imageUrl(req: Request, rel?: string | null) {
  if (!rel) return null;
  const host = req.get('host') || '127.0.0.1:3000';
  return `http://${host}/storage/${rel}`;
}

export async function index(req: Request, res: Response) {
  const userId = (req as any).userId || 1;
  const search = String(req.query.search || '');
  const products = await Product.findAll({
    where: search ? { userId, name: { contains: search } as any } : { userId },
    order: [['id', 'DESC']]
  });
  const mapped = products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    stock: p.stock,
    image: p.image,
    image_url: imageUrl(req, p.image || null)
  }));
  res.json({
    products: mapped,
    pagination: { current_page: 1, last_page: 1, total: mapped.length, has_pages: false }
  });
}

export async function store(req: Request, res: Response) {
  const userId = (req as any).userId || 1;
  const { name, price, stock } = req.body || {};
  if (!name) return res.status(422).json({ message: 'name required' });
  const file = (req as any).file as Express.Multer.File | undefined;
  const rel = file ? path.join('products', file.filename) : null;
  await Product.create({
    userId,
    name: String(name),
    price: Number(price),
    stock: Number(stock),
    image: rel || undefined
  });
  res.json({ success: true });
}
