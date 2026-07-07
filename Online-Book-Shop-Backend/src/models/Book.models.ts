import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import Category from "./Category.models";

class Book extends Model {
  public id!: number;
  public title!: string;
  public author!: string | null;        // author can be optional
  public description!: string | null;   // optional
  public price!: number;
  public stock!: number;
  public image!: string | null;         // Cloudinary URL
  public categoryId!: number;
}

Book.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    author: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Unknown"
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true    // store Cloudinary URL
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: "id"
      },
      onDelete: "CASCADE"
    }
  },
  {
    sequelize,
    tableName: "books",
    timestamps: true      // createdAt, updatedAt
  }
);

export default Book;