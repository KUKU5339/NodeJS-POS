import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { productsInStock, index, store } from '../controllers/SaleController.js';

const router = Router();
router.get('/products/in-stock', auth, productsInStock);
router.get('/sales', auth, index);
router.post('/sales', auth, store);
export default router;
