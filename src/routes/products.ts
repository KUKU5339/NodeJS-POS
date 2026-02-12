import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { auth } from '../middleware/auth';
import { index, store } from '../controllers/ProductController';

const storageRoot = path.resolve(path.join(process.cwd(), 'public', 'storage'));
const productsDir = path.join(storageRoot, 'products');
fs.mkdirSync(productsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, productsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '.png';
      cb(null, `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const router = Router();
router.get('/products', auth, index);
router.post('/products', auth, upload.single('image'), store);
export default router;
