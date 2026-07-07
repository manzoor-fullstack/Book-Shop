import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import sequelize from './config/db';
import './models'; // register all models + associations before sync

import swaggerSpec from './docs/swagger';
import errorHandler from './middlewares/errorMiddleware';

import authRoutes from "./routes/authRoutes"

import bookRoutes from './routes/bookRoutes';
import categoryRoutes from './routes/categoryRoutes';

import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';

import paymentRoutes from './routes/paymentRoutes';

import analyticsRoutes from './routes/analyticsRoutes';
import userRoutes from './routes/userRoutes';
import reviewRoutes from './routes/reviewRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import notificationRoutes from './routes/notificationRoutes';
import settingsRoutes from './routes/settingsRoutes';

import { stripeWebhook } from './controllers/paymentController';
import { apiLimiter } from './middlewares/rateLimiter';

const app: Application = express();

app.post(
  '/api/payment/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use('/api', apiLimiter);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send('API running...');
});


// Skip auto-connect/sync under tests — the test harness controls the DB lifecycle.
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    try {
      await sequelize.authenticate();
      console.log('DB connected');

      await sequelize.sync({ alter: true }); // creates table if not exists
      console.log('Models synced');
    } catch (error) {
      console.error('DB connection failed:', error);
    }
  })();
}

app.use('/api/auth', authRoutes);

app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);

app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.use('/api/payment', paymentRoutes);

app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);

app.use(errorHandler);
  
export default app;