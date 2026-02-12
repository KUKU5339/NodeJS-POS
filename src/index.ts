import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import sequelize from './config/database.js';
import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import dashboardRoutes from './routes/dashboard.js';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const projectRoot = path.resolve(process.cwd());
const publicDir = path.join(projectRoot, 'public');
const isVercel = !!process.env.VERCEL;
const storageBase = isVercel ? path.join('/tmp', 'storage') : path.join(publicDir, 'storage');
const productsDir = path.join(storageBase, 'products');
try {
  fs.mkdirSync(productsDir, { recursive: true });
} catch (e) {
  if (!isVercel) throw e;
}

app.set('views', path.join(projectRoot, 'views'));
app.set('view engine', 'ejs');
app.use('/storage', express.static(storageBase));
app.use('/', express.static(publicDir));

app.get('/csrf-token', (req, res) => res.json({ csrf_token: 'node' }));

app.use('/api', authRoutes);
app.use('/api', productsRoutes);
app.use('/api', dashboardRoutes);

app.get('/', (_req, res) => res.render('index', { title: 'NodePOS' }));
app.get('/dashboard', (_req, res) => res.render('dashboard'));
app.get('/healthz', (_req, res) => res.json({ ok: true, vercel: !!process.env.VERCEL }));

// Best-effort DB init without blocking serverless cold start
const conn = (process.env.DB_CONNECTION || 'sqlite').toLowerCase();
if (!process.env.VERCEL || (process.env.VERCEL && conn !== 'sqlite')) {
  (async () => {
    try {
      if (sequelize) {
        await sequelize.authenticate();
        const users = await User.count();
        if (users === 0) {
          const hash = await bcrypt.hash('password', 10);
          await User.create({ name: 'Test User', email: 'test@example.com', password: hash });
        }
      }
    } catch (e) {}
  })();
}

// Local development server; Vercel will import the app and handle requests
if (!process.env.VERCEL) {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  app.listen(port, () => {
    console.log(`NodePOS running at http://127.0.0.1:${port}`);
  });
}

export default app;
