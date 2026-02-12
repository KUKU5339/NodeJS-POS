import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SaleAttrs {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  total: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type SaleCreation = Optional<SaleAttrs, 'id'>;

class Sale extends Model<SaleAttrs, SaleCreation> implements SaleAttrs {
  public id!: number;
  public userId!: number;
  public productId!: number;
  public quantity!: number;
  public total!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Sale.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    total: { type: DataTypes.FLOAT, allowNull: false }
  },
  { sequelize, tableName: 'sales' }
);

export default Sale;
