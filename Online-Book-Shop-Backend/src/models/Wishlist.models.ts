import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

class Wishlist extends Model {
  public id!: number;
  public userId!: number;
  public bookId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Wishlist.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    bookId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    modelName: 'Wishlist',
    indexes: [{ unique: true, fields: ['userId', 'bookId'] }],
  }
);

export default Wishlist;
