# 🗄️ Setup Local MongoDB on Windows

## Option 1: Install MongoDB Community Server

### Step 1: Download MongoDB
1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - Version: Latest (7.0 or higher)
   - Platform: Windows
   - Package: MSI
3. Click **Download**

### Step 2: Install MongoDB
1. Run the downloaded `.msi` file
2. Choose **Complete** installation
3. Check **"Install MongoDB as a Service"**
4. Check **"Install MongoDB Compass"** (GUI tool)
5. Click **Next** and **Install**
6. Wait for installation to complete

### Step 3: Verify Installation
Open PowerShell and run:
```powershell
mongod --version
```

Should show version info like:
```
db version v7.0.x
```

### Step 4: Start MongoDB Service
MongoDB should start automatically. If not:
```powershell
net start MongoDB
```

### Step 5: Update Your .env File
Edit `c:\Users\elcan\OneDrive\Documents\joel\ecomm\.env`

Change MONGODB_URI to:
```
MONGODB_URI=mongodb://localhost:27017/ecommerce
```

### Step 6: Restart Your Application
```powershell
# Stop current server (Ctrl+C)
npm run dev
```

---

## Option 2: Use MongoDB in Docker (If you have Docker)

### Step 1: Install Docker Desktop
1. Download from: https://www.docker.com/products/docker-desktop
2. Install and start Docker Desktop

### Step 2: Run MongoDB Container
```powershell
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 3: Update .env
```
MONGODB_URI=mongodb://localhost:27017/ecommerce
```

### Step 4: Restart Application
```powershell
npm run dev
```

---

## Option 3: Quick Setup with MongoDB Compass (GUI)

### Step 1: Download MongoDB Compass
1. Go to: https://www.mongodb.com/try/download/compass
2. Download and install

### Step 2: Install MongoDB Server
Follow Option 1 steps above

### Step 3: Connect with Compass
1. Open MongoDB Compass
2. Connection string: `mongodb://localhost:27017`
3. Click **Connect**
4. You can now see your databases visually!

---

## ✅ Verify MongoDB is Running

### Check if MongoDB is running:
```powershell
# Check MongoDB service status
Get-Service MongoDB

# Or try connecting
mongo --eval "db.version()"
```

### Test connection from your app:
```powershell
# In your project directory
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
```

---

## 🔧 Troubleshooting

### Error: "MongoDB service not found"
**Solution:**
```powershell
# Start MongoDB manually
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
```

### Error: "Failed to connect to localhost:27017"
**Check if MongoDB is running:**
```powershell
Get-Service MongoDB
```

**If not running, start it:**
```powershell
net start MongoDB
```

### Error: "Data directory not found"
**Create data directory:**
```powershell
mkdir C:\data\db
```

Then restart MongoDB service.

---

## 📊 MongoDB Compass - Visual Database Management

After installing Compass:

1. **Connect:** `mongodb://localhost:27017`
2. **View databases:** See all your databases
3. **View collections:** Products, Users, Orders, etc.
4. **Query data:** Visual query builder
5. **Insert/Edit:** Add or modify documents

---

## 🎯 Quick Start Commands

### Start MongoDB:
```powershell
net start MongoDB
```

### Stop MongoDB:
```powershell
net stop MongoDB
```

### Check Status:
```powershell
Get-Service MongoDB
```

### Connect with mongo shell:
```powershell
mongosh
```

---

## 🔗 Connection Strings

### Local MongoDB:
```
mongodb://localhost:27017/ecommerce
```

### Local with authentication:
```
mongodb://username:password@localhost:27017/ecommerce
```

### MongoDB Atlas (Cloud):
```
mongodb+srv://user:pass@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
```

---

## 📝 Update Your .env File

Edit: `c:\Users\elcan\OneDrive\Documents\joel\ecomm\.env`

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/ecommerce

# Other settings
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-here
```

---

## 🚀 After Setup

1. **Start MongoDB service** (if not running)
2. **Update .env** with local connection string
3. **Restart your app:** `npm run dev`
4. **Seed database:**
   ```powershell
   node server/seedProducts.js
   node server/seedReviews.js
   ```
5. **Initialize admin:**
   - Go to: http://localhost:5173/admin/login
   - Click "Initialize Admin Account"
   - Login with: admin@cryptostore.com / admin123

---

## ✅ Success Checklist

- [ ] MongoDB installed
- [ ] MongoDB service running
- [ ] .env updated with localhost connection
- [ ] App restarted
- [ ] See "MongoDB connected successfully" in logs
- [ ] Can access admin panel
- [ ] Database seeded with products

---

## 💡 Pro Tips

1. **Use MongoDB Compass** for visual database management
2. **Keep MongoDB service running** in background
3. **Backup your data** regularly
4. **Use MongoDB Atlas** for production (free tier available)

---

**Choose Option 1 for the easiest setup!**
