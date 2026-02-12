import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import sequelize from './config/database';
import authRoutes from './routes/auth';
import productsRoutes from './routes/products';
import dashboardRoutes from './routes/dashboard';
import bcrypt from 'bcryptjs';
import User from './models/User';

const app = express();
const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: true, credentials: true } });

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const projectRoot = path.resolve(process.cwd());
const publicDir = path.join(projectRoot, 'public');
const storageDir = path.join(publicDir, 'storage');
const productsDir = path.join(storageDir, 'products');
fs.mkdirSync(productsDir, { recursive: true });

app.set('views', path.join(projectRoot, 'views'));
app.set('view engine', 'ejs');
app.use('/storage', express.static(storageDir));
app.use('/', express.static(publicDir));

app.get('/csrf-token', (req, res) => res.json({ csrf_token: 'node' }));

app.use('/api', authRoutes);
app.use('/api', productsRoutes);
app.use('/api', dashboardRoutes);

app.get('/', (_req, res) => res.render('index', { title: 'NodePOS' }));

io.on('connection', socket => {
  socket.emit('hello', { ok: true });
});

async function start() {
  await sequelize.sync();
  const users = await User.count();
  if (users === 0) {
    const hash = await bcrypt.hash('password', 10);
    await User.create({ name: 'Test User', email: 'test@example.com', password: hash });
    console.log('Seeded default user: test@example.com / password');
  }
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  server.listen(port, () => {
    console.log(`NodePOS running at http://127.0.0.1:${port}`);
  });
}

start();
