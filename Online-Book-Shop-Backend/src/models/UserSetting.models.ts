import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

class UserSetting extends Model {
  public id!: number;
  public userId!: number;
  public theme!: string; // light | dark | system
  public emailNotifications!: boolean;
  public orderUpdates!: boolean;
  public marketingEmails!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserSetting.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    theme: { type: DataTypes.STRING, defaultValue: 'system' },
    emailNotifications: { type: DataTypes.BOOLEAN, defaultValue: true },
    orderUpdates: { type: DataTypes.BOOLEAN, defaultValue: true },
    marketingEmails: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    modelName: 'UserSetting',
  }
);

export default UserSetting;
