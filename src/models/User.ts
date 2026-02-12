import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserAttrs {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreation = Optional<UserAttrs, 'id'>;

class User extends Model<UserAttrs, UserCreation> implements UserAttrs {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false }
  },
  { sequelize, tableName: 'users' }
);

export default User;
