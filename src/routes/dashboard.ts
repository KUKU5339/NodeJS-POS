import { Router } from 'express';
import { stats, recentSales, lowStock, topProducts } from '../controllers/DashboardController.js';
const router = Router();
router.get('/dashboard/stats', stats);
router.get('/dashboard/recent-sales', recentSales);
router.get('/dashboard/low-stock', lowStock);
router.get('/dashboard/top-products', topProducts);
export default router;
