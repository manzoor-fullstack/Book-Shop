import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface UserAttributes {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  profileImage?: string;
  role: 'user' | 'admin';
  isActive?: boolean;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role' | 'isActive'> {}

class User extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public password!: string;
  public phone!: string;
  public address!: string;
  public profileImage?: string;
  public role!: 'user' | 'admin';
  public isActive?: boolean;
  public resetToken?: string | null;
  public resetTokenExpiry?: Date | null;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },

    email: { type: DataTypes.STRING, unique: true, allowNull: false },

    password: { type: DataTypes.STRING, allowNull: false },

    phone: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.TEXT, allowNull: false },

    profileImage: { type: DataTypes.STRING },

    role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },

    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },

    resetToken: { type: DataTypes.STRING },
    resetTokenExpiry: { type: DataTypes.DATE },
  },
  {
    sequelize,
    tableName: 'users',
  }
);

export default User;