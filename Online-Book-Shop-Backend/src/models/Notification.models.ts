import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

class Notification extends Model {
  public id!: number;
  public userId!: number;
  public title!: string;
  public message!: string;
  public type!: string; // order, system, promo
  public isRead!: boolean;
  public link!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Notification.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.STRING, defaultValue: 'system' },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
    link: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    modelName: 'Notification',
  }
);

export default Notification;
