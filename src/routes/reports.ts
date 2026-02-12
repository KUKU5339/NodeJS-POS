import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { daily } from '../controllers/ReportController.js';

const router = Router();
router.get('/reports/daily', auth, daily);
export default router;
