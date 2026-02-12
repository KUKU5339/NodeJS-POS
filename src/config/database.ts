import { Sequelize } from 'sequelize';
import path from 'path';
const isVercel = !!process.env.VERCEL;
const dbPath = isVercel ? path.join('/tmp', 'dev.sqlite') : path.resolve(process.cwd(), 'data', 'dev.sqlite');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false
});
export default sequelize;
