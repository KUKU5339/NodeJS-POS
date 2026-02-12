import { Router } from 'express';
import { stats, recentSales, lowStock } from '../controllers/DashboardController.js';
const router = Router();
router.get('/dashboard/stats', stats);
router.get('/dashboard/recent-sales', recentSales);
router.get('/dashboard/low-stock', lowStock);
export default router;
