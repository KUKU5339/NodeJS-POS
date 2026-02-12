import { Sequelize } from 'sequelize';
import path from 'path';
const isVercel = !!process.env.VERCEL;
const conn = (process.env.DB_CONNECTION || 'sqlite').toLowerCase();

function createSequelize(): Sequelize | null {
  try {
    if (isVercel && conn === 'sqlite') {
      return null;
    }
    if (conn === 'sqlite') {
      const dbPath = isVercel ? path.join('/tmp', 'dev.sqlite') : path.resolve(process.cwd(), 'data', 'dev.sqlite');
      return new Sequelize({ dialect: 'sqlite', storage: dbPath, logging: false });
    }
    if (conn === 'mysql') {
      return new Sequelize(process.env.DB_DATABASE || '', process.env.DB_USERNAME || '', process.env.DB_PASSWORD || '', {
        dialect: 'mysql',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
        logging: false
      });
    }
    if (conn === 'postgres') {
      const url = process.env.DATABASE_URL;
      const sslEnabled = (process.env.DB_SSL || 'true').toLowerCase() === 'true';
      if (url) {
        return new Sequelize(url, {
          dialect: 'postgres',
          logging: false,
          dialectOptions: sslEnabled ? { ssl: { require: true, rejectUnauthorized: false } } : {}
        });
      }
      return new Sequelize(process.env.DB_DATABASE || '', process.env.DB_USERNAME || '', process.env.DB_PASSWORD || '', {
        dialect: 'postgres',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
        logging: false,
        dialectOptions: sslEnabled ? { ssl: { require: true, rejectUnauthorized: false } } : {}
      });
    }
    return null;
  } catch {
    return null;
  }
}

const sequelize = createSequelize() as any;
export default sequelize;
