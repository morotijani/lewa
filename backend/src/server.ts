import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { SocketService } from './services/socket.service';

import authRoutes from './routes/auth.routes';
import pricingRoutes from './routes/pricing.routes';
import orderRoutes from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';

dotenv.config();

const app = express();
const httpServer = createServer(app); // Wrap express app
const PORT = process.env.PORT || 3000;

// Initialize Socket.io
SocketService.init(httpServer);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Lewa Backend is running', timestamp: new Date() });
});

// Use httpServer.listen instead of app.listen
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.io server initialized`);
});

