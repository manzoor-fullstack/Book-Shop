import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

class Review extends Model {
  public id!: number;
  public userId!: number;
  public bookId!: number;
  public rating!: number;
  public comment!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Review.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    bookId: { type: DataTypes.INTEGER, allowNull: false },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: 'Review',
    indexes: [{ unique: true, fields: ['userId', 'bookId'] }],
  }
);

export default Review;
