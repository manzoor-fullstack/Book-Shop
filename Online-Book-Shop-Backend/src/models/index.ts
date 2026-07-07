import Book from "./Book.models";
import Category from "./Category.models";
import Cart from "./Cart.models";
import CartItem from "./CartItem.models";
import Order from "./order.models";
import OrderItem from "./OrderItem.models";
import User from "./User.models";
import Review from "./Review.models";
import Wishlist from "./Wishlist.models";
import Notification from "./Notification.models";
import UserSetting from "./UserSetting.models";

// Category <-> Book
Category.hasMany(Book, { foreignKey: 'categoryId' });
Book.belongsTo(Category, { foreignKey: 'categoryId' });

// Cart <-> CartItem <-> Book
Cart.hasMany(CartItem, { foreignKey: 'cartId' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });
CartItem.belongsTo(Book, { foreignKey: 'bookId' });

// User <-> Cart
User.hasOne(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });

// User <-> Order
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

// Order <-> OrderItem <-> Book
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Book, { foreignKey: 'bookId' });
Book.hasMany(OrderItem, { foreignKey: 'bookId' });

// Reviews
Book.hasMany(Review, { foreignKey: 'bookId' });
Review.belongsTo(Book, { foreignKey: 'bookId' });
User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

// Wishlist
User.hasMany(Wishlist, { foreignKey: 'userId' });
Wishlist.belongsTo(User, { foreignKey: 'userId' });
Book.hasMany(Wishlist, { foreignKey: 'bookId' });
Wishlist.belongsTo(Book, { foreignKey: 'bookId' });

// Notifications
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// User settings
User.hasOne(UserSetting, { foreignKey: 'userId' });
UserSetting.belongsTo(User, { foreignKey: 'userId' });

export {
  Book,
  Category,
  Cart,
  CartItem,
  Order,
  OrderItem,
  User,
  Review,
  Wishlist,
  Notification,
  UserSetting,
};
