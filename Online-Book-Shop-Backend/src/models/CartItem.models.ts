import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

class CartItem extends Model {
  public id!: number;
  public cartId!: number;
  public bookId!: number;
  public quantity!: number;
}

CartItem.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    cartId: { type: DataTypes.INTEGER, allowNull: false },
    bookId: { type: DataTypes.INTEGER, allowNull: false },

    quantity: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: 'cart_items',
  }
);

export default CartItem;