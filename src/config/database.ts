import { Sequelize } from 'sequelize';
import path from 'path';
const dbPath = path.resolve(process.cwd(), 'data', 'dev.sqlite');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false
});
export default sequelize;
