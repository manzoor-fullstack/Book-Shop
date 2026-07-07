import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

class Cart extends Model {
  public id!: number;
  public userId!: number;
}

Cart.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: 'carts',
  }
);

export default Cart;