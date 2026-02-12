import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { stats, recentSales, lowStock } from '../controllers/DashboardController.js';
const router = Router();
router.get('/dashboard/stats', auth, stats);
router.get('/dashboard/recent-sales', auth, recentSales);
router.get('/dashboard/low-stock', auth, lowStock);
export default router;
