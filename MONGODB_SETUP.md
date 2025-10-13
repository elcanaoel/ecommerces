# MongoDB Setup Instructions

Your application needs MongoDB to run. You're getting a 401 error because the backend can't connect to the database.

## Quick Fix - Use MongoDB Atlas (Cloud - 5 minutes)

### Step 1: Create Free MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google
3. Choose the FREE tier (M0)

### Step 2: Create a Cluster
1. After signup, click "Build a Database"
2. Choose "M0 FREE" tier
3. Select a cloud provider and region (closest to you)
4. Click "Create Cluster" (takes 1-3 minutes)

### Step 3: Create Database User
1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `cryptostore`
5. Password: Create a strong password (save it!)
6. User Privileges: "Atlas admin"
7. Click "Add User"

### Step 4: Allow Network Access
1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### Step 5: Get Connection String
1. Click "Database" in left sidebar
2. Click "Connect" button on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like this):
   ```
   mongodb+srv://cryptostore:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name: Replace `/?retryWrites` with `/crypto-ecommerce?retryWrites`

### Step 6: Update .env File
1. Open `.env` file in your project root
2. Find the line: `MONGODB_URI=mongodb://localhost:27017/crypto-ecommerce`
3. Replace it with your Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://cryptostore:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/crypto-ecommerce?retryWrites=true&w=majority
   ```

### Step 7: Restart Application
```bash
npm run dev
```

---

## Alternative - Install MongoDB Locally

If you prefer to run MongoDB on your computer:

### Windows:
1. Download: https://www.mongodb.com/try/download/community
2. Run installer (choose "Complete" installation)
3. Install as Windows Service (checked by default)
4. MongoDB Compass will also be installed (GUI tool)
5. After installation, MongoDB runs automatically
6. Keep the default `.env` setting: `MONGODB_URI=mongodb://localhost:27017/crypto-ecommerce`

### Verify Installation:
```bash
mongod --version
```

---

## After MongoDB is Connected

Once you have MongoDB running (Atlas or local), the application will:
1. Automatically create the database
2. Create the admin user on first run
3. You can login with:
   - Email: `admin@cryptostore.com`
   - Password: `admin123`

## Troubleshooting

**Error: "MongooseServerSelectionError"**
- Check your connection string is correct
- For Atlas: Ensure IP is whitelisted
- For local: Ensure MongoDB service is running

**Error: "Authentication failed"**
- Check username/password in connection string
- Ensure database user has correct permissions

**Still having issues?**
- Check the terminal output for specific error messages
- Verify .env file has no extra spaces
- Try restarting the application

---

## Current Status

✅ Frontend is running on http://localhost:5173
❌ Backend needs MongoDB connection
⏳ Waiting for you to configure MongoDB

Once MongoDB is configured, you'll be able to:
- Login to admin panel
- Add products
- Process orders
- Accept crypto payments
