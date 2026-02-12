import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ProductAttrs {
  id: number;
  userId: number;
  name: string;
  price: number;
  stock: number;
  image?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type ProductCreation = Optional<ProductAttrs, 'id' | 'image'>;

class Product extends Model<ProductAttrs, ProductCreation> implements ProductAttrs {
  public id!: number;
  public userId!: number;
  public name!: string;
  public price!: number;
  public stock!: number;
  public image!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    image: { type: DataTypes.STRING, allowNull: true }
  },
  { sequelize, tableName: 'products' }
);

export default Product;
