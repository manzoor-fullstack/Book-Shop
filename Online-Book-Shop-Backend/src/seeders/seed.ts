/**
 * Database seeder — creates demo admin, customer, categories and books.
 * Run with: npm run seed
 *
 * Idempotent-ish: it clears books/categories/order data and re-inserts a fresh
 * catalogue, and ensures the two demo accounts exist with known passwords.
 * Existing real users are left untouched.
 */
import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcrypt';
import sequelize from '../config/db';
import {
  Book,
  Category,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Review,
  Wishlist,
  Notification,
  UserSetting,
} from '../models';
import User from '../models/User.models';
import { OrderStatus, PaymentMethod } from '../enums/orderStatus.enum';
import { PaymentStatus } from '../enums/paymentStatus.enum';

const DEMO_ADMIN = {
  firstName: 'Aisha',
  lastName: 'Khan',
  email: 'admin@bookshop.com',
  password: 'Admin@123',
  phone: '03001112233',
  address: '12 Mall Road, Lahore',
  role: 'admin' as const,
};

const DEMO_CUSTOMER = {
  firstName: 'Bilal',
  lastName: 'Ahmed',
  email: 'customer@bookshop.com',
  password: 'Customer@123',
  phone: '03004445566',
  address: '45 Gulberg, Karachi',
  role: 'user' as const,
};

const EXTRA_CUSTOMERS = [
  { firstName: 'Sara', lastName: 'Malik', email: 'sara@bookshop.com', password: 'Customer@123', phone: '03007778899', address: '9 DHA, Islamabad', role: 'user' as const },
  { firstName: 'Usman', lastName: 'Tariq', email: 'usman@bookshop.com', password: 'Customer@123', phone: '03002223344', address: '77 Model Town, Lahore', role: 'user' as const },
  { firstName: 'Zara', lastName: 'Hussain', email: 'zara@bookshop.com', password: 'Customer@123', phone: '03005556677', address: '3 Clifton, Karachi', role: 'user' as const },
];

const SAMPLE_REVIEWS = [
  { bookIndex: 0, rating: 5, comment: 'Absolutely gripping from start to finish!' },
  { bookIndex: 0, rating: 4, comment: 'Really enjoyed the atmosphere and mystery.' },
  { bookIndex: 3, rating: 5, comment: 'Changed how I approach my workday. Highly recommend.' },
  { bookIndex: 3, rating: 4, comment: 'Solid, practical advice.' },
  { bookIndex: 7, rating: 5, comment: 'Every engineer should read this.' },
  { bookIndex: 5, rating: 4, comment: 'Made complex science genuinely fun.' },
  { bookIndex: 9, rating: 5, comment: 'A must-read for any founder.' },
  { bookIndex: 15, rating: 5, comment: 'My kids adore this one!' },
];

const CATEGORIES = [
  'Fiction',
  'Non-Fiction',
  'Science',
  'Technology',
  'History',
  'Business',
  'Self-Help',
  "Children's",
];

type SeedBook = {
  title: string;
  author: string;
  description: string;
  price: number;
  stock: number;
  category: string;
};

const BOOKS: SeedBook[] = [
  { title: 'The Silent Library', author: 'Hana Yusuf', description: 'A gripping mystery set inside an old university library where every book hides a secret.', price: 14.99, stock: 32, category: 'Fiction' },
  { title: 'Midnight in Marrakech', author: 'Omar Farooq', description: 'A sweeping literary novel about love, exile and the streets of an ancient city.', price: 18.5, stock: 21, category: 'Fiction' },
  { title: 'The Last Cartographer', author: 'Elena Rossi', description: 'An adventure of maps, memory and the places that never made it onto paper.', price: 16.0, stock: 4, category: 'Fiction' },
  { title: 'Atomic Focus', author: 'James Clarke', description: 'Practical strategies to build deep focus and beat digital distraction.', price: 21.99, stock: 58, category: 'Self-Help' },
  { title: 'The Calm Mind', author: 'Priya Nair', description: 'A modern guide to mindfulness and managing anxiety in a busy world.', price: 12.75, stock: 40, category: 'Self-Help' },
  { title: 'A Brief History of Almost Everything', author: 'Daniel Weber', description: 'From the Big Bang to modern civilisation, science made wonderfully readable.', price: 24.0, stock: 27, category: 'Science' },
  { title: 'Quantum, Simply', author: 'Sara Lindqvist', description: 'Quantum physics explained without a single scary equation.', price: 19.99, stock: 15, category: 'Science' },
  { title: 'The Coding Mindset', author: 'Michael Chen', description: 'How great engineers think — habits, patterns and problem solving.', price: 29.99, stock: 46, category: 'Technology' },
  { title: 'Designing Data Systems', author: 'Ravi Menon', description: 'A deep, practical dive into building reliable and scalable data platforms.', price: 42.5, stock: 9, category: 'Technology' },
  { title: 'The Startup Playbook', author: 'Nadia Sheikh', description: 'From idea to first revenue — a founder-tested guide to building a company.', price: 22.0, stock: 33, category: 'Business' },
  { title: 'Numbers That Sell', author: 'Tom Baxter', description: 'Understand the finance and metrics behind every growing business.', price: 17.25, stock: 24, category: 'Business' },
  { title: 'Empires of the Silk Road', author: 'Layla Hassan', description: 'A vivid history of the trade routes that shaped the ancient world.', price: 26.99, stock: 12, category: 'History' },
  { title: 'The Age of Revolutions', author: 'George Adams', description: 'How three revolutions reshaped politics, science and society forever.', price: 23.5, stock: 6, category: 'History' },
  { title: 'Deep Work Habits', author: 'Cara Dominguez', description: 'Reclaim your attention and produce meaningful work every single day.', price: 15.99, stock: 51, category: 'Non-Fiction' },
  { title: 'The Honest Truth About Us', author: 'Ibrahim Ali', description: 'A thoughtful exploration of human behaviour and decision making.', price: 20.0, stock: 3, category: 'Non-Fiction' },
  { title: 'The Dragon Who Lost His Roar', author: 'Mimi Turner', description: 'A heart-warming picture book about finding your own voice. Ages 4-8.', price: 9.99, stock: 60, category: "Children's" },
  { title: 'Adventures of Robo-Cat', author: 'Sunil Rao', description: 'A funny illustrated chapter book about a robot cat and his human friend.', price: 11.5, stock: 44, category: "Children's" },
  { title: 'The Garden of Ideas', author: 'Amara Okafor', description: 'A beautifully told story that teaches kids about creativity and patience.', price: 10.25, stock: 0, category: "Children's" },
];

// Deterministic, always-available cover images for a rich-looking demo.
const coverFor = (index: number) =>
  `https://picsum.photos/seed/bookshop-${index + 1}/400/600`;

async function ensureUser(u: typeof DEMO_ADMIN | typeof DEMO_CUSTOMER) {
  const existing = await User.findOne({ where: { email: u.email } });
  const hashed = await bcrypt.hash(u.password, 10);
  if (existing) {
    await existing.update({
      firstName: u.firstName,
      lastName: u.lastName,
      password: hashed,
      phone: u.phone,
      address: u.address,
      role: u.role,
    });
    console.log(`↺ Updated ${u.role}: ${u.email}`);
  } else {
    await User.create({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      password: hashed,
      phone: u.phone,
      address: u.address,
      role: u.role,
    } as any);
    console.log(`＋ Created ${u.role}: ${u.email}`);
  }
}

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    await sequelize.sync({ alter: true });
    console.log('Models synced');

    // Clear catalogue + transactional data (children first for FK safety)
    await OrderItem.destroy({ where: {}, truncate: false });
    await Order.destroy({ where: {}, truncate: false });
    await CartItem.destroy({ where: {}, truncate: false });
    await Cart.destroy({ where: {}, truncate: false });
    await Review.destroy({ where: {}, truncate: false });
    await Wishlist.destroy({ where: {}, truncate: false });
    await Notification.destroy({ where: {}, truncate: false });
    await UserSetting.destroy({ where: {}, truncate: false });
    await Book.destroy({ where: {}, truncate: false });
    await Category.destroy({ where: {}, truncate: false });
    console.log('Cleared existing catalogue & transactional data');

    // Demo accounts
    await ensureUser(DEMO_ADMIN);
    await ensureUser(DEMO_CUSTOMER);
    for (const c of EXTRA_CUSTOMERS) await ensureUser(c);

    // Categories
    const categoryMap: Record<string, number> = {};
    for (const name of CATEGORIES) {
      const cat = await Category.create({ name } as any);
      categoryMap[name] = cat.id;
    }
    console.log(`＋ Created ${CATEGORIES.length} categories`);

    // Books
    const createdBooks: Book[] = [];
    let i = 0;
    for (const b of BOOKS) {
      const book = await Book.create({
        title: b.title,
        author: b.author,
        description: b.description,
        price: b.price,
        stock: b.stock,
        image: coverFor(i),
        categoryId: categoryMap[b.category],
      } as any);
      createdBooks.push(book);
      i++;
    }
    console.log(`＋ Created ${BOOKS.length} books`);

    // Reviewers (demo customer + extras)
    const customer = await User.findOne({ where: { email: DEMO_CUSTOMER.email } });
    const reviewers = await User.findAll({
      where: { email: [DEMO_CUSTOMER.email, ...EXTRA_CUSTOMERS.map((c) => c.email)] },
    });

    // Sample reviews
    let r = 0;
    for (const rev of SAMPLE_REVIEWS) {
      const book = createdBooks[rev.bookIndex];
      const reviewer = reviewers[r % reviewers.length];
      if (book && reviewer) {
        await Review.create({
          bookId: book.id,
          userId: reviewer.id,
          rating: rev.rating,
          comment: rev.comment,
        } as any);
      }
      r++;
    }
    console.log(`＋ Created ${SAMPLE_REVIEWS.length} reviews`);

    // Sample orders for the demo customer, backdated across the last 6 days
    if (customer) {
      const orderSpecs = [
        { items: [{ b: 0, q: 1 }, { b: 3, q: 2 }], status: OrderStatus.DELIVERED, daysAgo: 5 },
        { items: [{ b: 7, q: 1 }], status: OrderStatus.DELIVERED, daysAgo: 3 },
        { items: [{ b: 9, q: 1 }, { b: 5, q: 1 }], status: OrderStatus.SHIPPED, daysAgo: 2 },
        { items: [{ b: 1, q: 1 }], status: OrderStatus.PROCESSING, daysAgo: 1 },
        { items: [{ b: 4, q: 3 }], status: OrderStatus.PENDING, daysAgo: 0 },
      ];

      let orderCount = 0;
      for (const spec of orderSpecs) {
        const when = new Date();
        when.setDate(when.getDate() - spec.daysAgo);
        let total = 0;
        const order = await Order.create({
          userId: customer.id,
          totalAmount: 0,
          status: spec.status,
          paymentStatus:
            spec.status === OrderStatus.DELIVERED
              ? PaymentStatus.PAID
              : PaymentStatus.PENDING,
          paymentMethod: PaymentMethod.COD,
          shippingAddress: customer.address,
          createdAt: when,
          updatedAt: when,
        } as any);

        for (const it of spec.items) {
          const book = createdBooks[it.b];
          total += Number(book.price) * it.q;
          await OrderItem.create({
            orderId: order.id,
            bookId: book.id,
            quantity: it.q,
            price: book.price,
            createdAt: when,
            updatedAt: when,
          } as any);
          await book.decrement('stock', { by: it.q });
        }
        order.totalAmount = total;
        await order.save({ silent: true });
        orderCount++;
      }
      console.log(`＋ Created ${orderCount} sample orders (backdated)`);

      // A welcome notification
      await Notification.create({
        userId: customer.id,
        title: 'Welcome to BookShop! 📚',
        message: 'Explore our catalogue and enjoy free delivery on your first order.',
        type: 'system',
        link: '/browse',
      } as any);
    }

    console.log('\n✅ Seeding complete!');
    console.log('   Admin    → admin@bookshop.com / Admin@123');
    console.log('   Customer → customer@bookshop.com / Customer@123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
