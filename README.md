# 🛍️ Crypto E-Commerce Platform

A full-stack e-commerce platform that accepts cryptocurrency payments (Bitcoin, Ethereum, USDT). Built with modern technologies and featuring a complete admin dashboard, order tracking, wallet system, and customer reviews.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.2.0-blue)

## ✨ Features

### 🛒 Customer Features
- **Product Browsing**: 60+ products (smartphones & laptops) with high-quality images
- **Advanced Search & Filters**: Search by name, filter by category
- **Product Reviews**: 5-star rating system with customer reviews
- **Shopping Cart**: Add, remove, update quantities
- **Cryptocurrency Checkout**: Pay with BTC, ETH, or USDT
- **Order Tracking**: Real-time order status with tracking numbers
- **Wallet System**: Deposit funds, view balance, transaction history
- **Payment Requests**: Accept/reject custom payment fees from admin
- **User Profile**: Manage account details and view order history
## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- QR Code generation

### Frontend
- React 18
- Vite
- TailwindCSS
- Lucide React (icons)
- Axios for API calls

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Setup Steps

1. **Clone and Install Dependencies**
   ```bash
   npm run install-all
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure:
   - MongoDB connection string
   - JWT secret
   - Admin credentials
   - Crypto wallet addresses (can also be set via admin panel)

3. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

4. **Run the Application**
   ```bash
   # Development mode (runs both frontend and backend)
   npm run dev
   ```

   The application will be available at:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Default Admin Credentials

- **Email**: admin@cryptostore.com
- **Password**: admin123

⚠️ **Change these credentials immediately after first login!**

## Usage Guide

### For Admins

1. **Login to Admin Panel**
   - Navigate to `/admin/login`
   - Use default credentials or your configured credentials

2. **Configure Wallet Addresses**
   - Go to Settings
   - Add your BTC, ETH, and USDT wallet addresses
   - These addresses will be shown to customers during checkout

3. **Add Products**
   - Navigate to Products section
   - Click "Add Product"
   - Fill in product details, upload images
   - Set price and stock quantity

4. **Manage Orders**
   - View all orders in the Orders section
   - Verify payments manually
   - Update order status (Pending → Confirmed → Shipped → Delivered)

### For Customers

1. **Browse Products**
   - View all available products on the homepage
   - Click on products for detailed information

2. **Add to Cart**
   - Select products and add to cart
   - Adjust quantities as needed

3. **Checkout with Crypto**
   - Proceed to checkout
   - Select cryptocurrency (BTC, ETH, or USDT)
   - Copy wallet address or scan QR code
   - Send exact amount to the provided address
   - Submit transaction hash (optional)

4. **Track Order**
   - View order status in your account
   - Receive updates as admin processes your order

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/all` - Get all orders (admin)
- `PUT /api/orders/:id` - Update order status (admin)

### Settings
- `GET /api/settings` - Get wallet addresses
- `PUT /api/settings` - Update settings (admin)

## Payment Flow

1. Customer completes checkout and selects cryptocurrency
2. System displays admin's wallet address with QR code
3. Customer sends payment from their wallet
4. Customer submits order with optional transaction hash
5. Admin verifies payment on blockchain
6. Admin confirms order and updates status
7. Order is processed and shipped

## Security Notes

- Never commit `.env` file
- Change default admin credentials
- Use strong JWT secret in production
- Implement rate limiting for production
- Always verify payments on blockchain before shipping
- Use HTTPS in production
- Keep wallet private keys secure (never store in application)

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Build frontend: `npm run build`
3. Use a process manager like PM2
4. Set up reverse proxy (nginx)
5. Enable HTTPS with SSL certificate
6. Use production MongoDB instance
7. Implement proper logging and monitoring

## Support

For issues or questions, please open an issue on the repository.

## License

MIT License
