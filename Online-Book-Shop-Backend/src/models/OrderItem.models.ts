import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

class OrderItem extends Model {
  public id!: number;
  public orderId!: number;
  public bookId!: number;
  public quantity!: number;
  public price!: number;
}

OrderItem.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  bookId: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
}, {
  sequelize,
  modelName: 'OrderItem',
});

export default OrderItem;