import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import { OrderStatus, PaymentMethod } from "../enums/orderStatus.enum";
import { PaymentStatus } from "../enums/paymentStatus.enum";

class Order extends Model {
  public id!: number;
  public userId!: number;
  public totalAmount!: number;
  public status!: string;
  public paymentStatus!: string;
  public paymentMethod!: string;
  public shippingAddress!: string | null;
  public stripeSessionId!: string | null;
  public paymentIntentId!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    totalAmount: { type: DataTypes.FLOAT, allowNull: false },
    status: {
      type: DataTypes.STRING,
      defaultValue: OrderStatus.PENDING,
    },
    paymentStatus: {
      type: DataTypes.STRING,
      defaultValue: PaymentStatus.PENDING,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      defaultValue: PaymentMethod.COD,
    },
    shippingAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    stripeSessionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentIntentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Order",
  },
);

export default Order;
