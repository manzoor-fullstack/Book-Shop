import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../app';
import sequelize from '../config/db';
import { User, Category, Book } from '../models';

let adminToken = '';
let customerToken = '';
let categoryId = 0;
let bookId = 0;

const admin = { email: 'admin@test.com', password: 'Admin@123' };
const customer = { email: 'buyer@test.com', password: 'Buyer@123' };

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const adminHash = await bcrypt.hash(admin.password, 10);
  const custHash = await bcrypt.hash(customer.password, 10);

  await User.create({
    firstName: 'Admin', lastName: 'User', email: admin.email, password: adminHash,
    phone: '0300', address: 'HQ', role: 'admin',
  } as any);
  await User.create({
    firstName: 'Buyer', lastName: 'User', email: customer.email, password: custHash,
    phone: '0301', address: 'Home', role: 'user',
  } as any);

  const cat = await Category.create({ name: 'Fiction' } as any);
  categoryId = cat.id;
  const book = await Book.create({
    title: 'Test Novel', author: 'Tester', price: 20, stock: 5, categoryId,
  } as any);
  bookId = book.id;

  adminToken = (await request(app).post('/api/auth/login').send(admin)).body.data.token;
  customerToken = (await request(app).post('/api/auth/login').send(customer)).body.data.token;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Auth', () => {
  it('registers a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'New', lastName: 'Guy', email: 'new@test.com',
      password: 'New@1234', phone: '0302', address: 'Street 1',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe('new@test.com');
  });

  it('rejects login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: admin.email, password: 'wrong',
    });
    expect(res.status).toBe(400);
  });

  it('returns the current user for a valid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(customer.email);
  });

  it('blocks /auth/me without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('Books & role enforcement', () => {
  it('lists books for an authenticated user', async () => {
    const res = await request(app).get('/api/books').set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.count).toBeGreaterThanOrEqual(1);
  });

  it('forbids a customer from creating a book', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${customerToken}`)
      .field('title', 'Hack').field('price', '5').field('categoryId', String(categoryId));
    expect(res.status).toBe(403);
  });

  it('allows an admin to create a book', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('title', 'Admin Book').field('price', '12').field('stock', '3').field('categoryId', String(categoryId));
    expect(res.status).toBe(201);
  });
});

describe('Cart & Checkout flow', () => {
  it('adds an item to the cart', async () => {
    const res = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ bookId, quantity: 2 });
    expect(res.status).toBe(200);
  });

  it('places an order and decrements stock', async () => {
    const before = await Book.findByPk(bookId);
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ paymentMethod: 'cod', shippingAddress: 'Home' });
    expect(res.status).toBe(201);
    expect(res.body.data.totalAmount).toBe(40);

    const after = await Book.findByPk(bookId);
    expect(after!.stock).toBe(before!.stock - 2);
  });

  it('lists the customer orders (previously a crash)', async () => {
    const res = await request(app).get('/api/orders/my-orders').set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('prevents overbooking beyond available stock', async () => {
    await request(app).post('/api/cart/add').set('Authorization', `Bearer ${customerToken}`).send({ bookId, quantity: 999 });
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ paymentMethod: 'cod' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/stock/i);
  });
});

describe('Admin orders & analytics', () => {
  it('lets an admin list all orders', async () => {
    const res = await request(app).get('/api/orders').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('rejects an invalid order status', async () => {
    const orders = await request(app).get('/api/orders').set('Authorization', `Bearer ${adminToken}`);
    const id = orders.body.data[0].id;
    const res = await request(app)
      .put(`/api/orders/${id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'banana' });
    expect(res.status).toBe(400);
  });

  it('restores stock when an order is cancelled', async () => {
    const orders = await request(app).get('/api/orders').set('Authorization', `Bearer ${adminToken}`);
    const order = orders.body.data.find((o: any) => o.status !== 'cancelled');
    const book = await Book.findByPk(bookId);
    const stockBefore = book!.stock;

    await request(app)
      .put(`/api/orders/${order.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'cancelled' });

    const after = await Book.findByPk(bookId);
    // qty in the seeded order was 2
    expect(after!.stock).toBe(stockBefore + 2);
  });

  it('returns dashboard analytics for an admin', async () => {
    const res = await request(app).get('/api/analytics/dashboard').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.stats).toBeDefined();
    expect(typeof res.body.data.stats.totalRevenue).toBe('number');
  });

  it('forbids a customer from analytics', async () => {
    const res = await request(app).get('/api/analytics/dashboard').set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(403);
  });
});
