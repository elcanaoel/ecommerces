# Crypto E-Commerce Platform - Setup Guide

This guide will walk you through setting up and running the crypto e-commerce platform.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **MongoDB**
   - **Option A - Local Installation:**
     - Download from: https://www.mongodb.com/try/download/community
     - Start MongoDB service after installation
   
   - **Option B - MongoDB Atlas (Cloud):**
     - Create free account at: https://www.mongodb.com/cloud/atlas
     - Create a cluster and get connection string
     - Update `MONGODB_URI` in `.env` file

3. **Git** (optional, for cloning)
   - Download from: https://git-scm.com/

## Installation Steps

### Step 1: Install Dependencies

**Windows (PowerShell):**
```powershell
.\setup.ps1
```

**Manual Installation:**
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database - Choose one:
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/crypto-ecommerce

# Or MongoDB Atlas (replace with your connection string):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crypto-ecommerce

# JWT Secret (change this to a random string)
JWT_SECRET=your_very_secure_random_secret_key_here

# Admin Credentials (you can change these)
ADMIN_EMAIL=admin@cryptostore.com
ADMIN_PASSWORD=admin123

# Crypto Wallet Addresses (configure via admin panel or here)
BTC_WALLET_ADDRESS=
ETH_WALLET_ADDRESS=
USDT_WALLET_ADDRESS=

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### Step 3: Start MongoDB

**If using local MongoDB:**

**Windows:**
```powershell
# MongoDB should start automatically if installed as a service
# Or manually start it:
mongod
```

**Mac/Linux:**
```bash
# Start MongoDB service
sudo systemctl start mongod
# Or
brew services start mongodb-community
```

**If using MongoDB Atlas:**
- No need to start anything, just ensure your connection string is correct in `.env`

### Step 4: Initialize Admin User

The admin user will be created automatically on first run, or you can create it manually:

```bash
# Start the backend server
npm run server

# In another terminal, make a POST request:
curl -X POST http://localhost:5000/api/auth/init-admin
```

### Step 5: Run the Application

**Development Mode (Recommended):**
```bash
# Runs both frontend and backend concurrently
npm run dev
```

**Or run separately:**

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

### Step 6: Access the Application

- **Frontend (Customer):** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Admin Panel:** http://localhost:5173/admin/login

**Default Admin Credentials:**
- Email: `admin@cryptostore.com`
- Password: `admin123`

⚠️ **Important:** Change these credentials immediately after first login!

## Post-Installation Configuration

### 1. Configure Wallet Addresses

1. Login to admin panel: http://localhost:5173/admin/login
2. Navigate to **Settings**
3. Add your cryptocurrency wallet addresses:
   - Bitcoin (BTC)
   - Ethereum (ETH)
   - Tether (USDT)

**How to get wallet addresses:**
- **Bitcoin:** Use Electrum, Ledger, or Trezor
- **Ethereum:** Use MetaMask, Trust Wallet, or hardware wallets
- **USDT:** Can use Ethereum address (ERC-20) or Tron address (TRC-20)

⚠️ **Security Warning:** Never share your private keys or seed phrases!

### 2. Add Products

1. Go to **Products** in admin panel
2. Click **Add Product**
3. Fill in product details:
   - Name
   - Description
   - Price (in USD)
   - Category
   - Stock quantity
   - Upload images
   - Add specifications (optional)
4. Click **Create Product**

### 3. Test the System

1. **As Customer:**
   - Register a new account
   - Browse products
   - Add items to cart
   - Proceed to checkout
   - Select cryptocurrency
   - View wallet address and QR code

2. **As Admin:**
   - View incoming orders
   - Verify payments on blockchain
   - Update order status
   - Manage products

## Common Issues and Solutions

### Issue: MongoDB Connection Error

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**
- Ensure MongoDB is running
- Check if `MONGODB_URI` in `.env` is correct
- For local MongoDB, try: `mongodb://127.0.0.1:27017/crypto-ecommerce`

### Issue: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
- Change `PORT` in `.env` to a different port (e.g., 5001)
- Or kill the process using that port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -ti:5000 | xargs kill -9
  ```

### Issue: Module Not Found

**Error:** `Cannot find module 'express'`

**Solution:**
- Run `npm install` in the root directory
- Run `npm install` in the client directory

### Issue: Images Not Uploading

**Solution:**
- Ensure `uploads` directory exists in the root
- Check file permissions
- Verify `MAX_FILE_SIZE` in `.env` (default: 5MB)

## Production Deployment

For production deployment, see the main README.md file for detailed instructions on:
- Building the frontend
- Using PM2 for process management
- Setting up nginx reverse proxy
- Enabling HTTPS
- Security best practices

## Payment Verification Process

1. Customer places order and sends crypto to your wallet
2. Customer can optionally provide transaction hash
3. Admin verifies payment on blockchain:
   - **Bitcoin:** https://www.blockchain.com/explorer
   - **Ethereum:** https://etherscan.io/
   - **USDT:** Check on respective network explorer
4. Admin marks payment as verified
5. Admin updates order status (Confirmed → Shipped → Delivered)

## Security Best Practices

1. **Change default admin credentials immediately**
2. **Use strong JWT secret** (random 32+ character string)
3. **Never commit `.env` file** to version control
4. **Use HTTPS in production**
5. **Keep wallet private keys secure** (never store in application)
6. **Regularly backup your database**
7. **Implement rate limiting** for production
8. **Use hardware wallets** for large amounts

## Support

If you encounter any issues:
1. Check the console for error messages
2. Review this guide and README.md
3. Ensure all prerequisites are installed
4. Verify environment variables are correct

## Next Steps

1. Customize the design and branding
2. Add more product categories
3. Configure email notifications (optional)
4. Set up automated payment verification (advanced)
5. Add more cryptocurrencies (advanced)
6. Implement customer reviews (optional)

Happy selling! 🚀
