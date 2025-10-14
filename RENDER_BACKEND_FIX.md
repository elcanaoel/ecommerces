# 🔧 RENDER BACKEND ERROR FIX

## ✅ Error Identified!

```
Error: Cannot find module 'express'
```

**This means:** Your backend service is trying to run without installing dependencies first!

---

## 🎯 THE PROBLEM

Your backend Render service has the wrong configuration. It's running `node server/index.js` without running `npm install` first.

---

## ✅ BACKEND SERVICE CORRECT SETTINGS

Go to your **BACKEND** service (Web Service, NOT Static Site):

### Required Settings:

**Build Command:**
```
npm install
```

**Start Command:**
```
node server/index.js
```
OR
```
npm start
```

**Environment Variables (REQUIRED):**
```
NODE_ENV = production
MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
JWT_SECRET = your-random-secret-key-here
PORT = 10000
CLIENT_URL = https://techcard.onrender.com
```

---

## 🔧 FIX YOUR BACKEND NOW

### Step 1: Go to Backend Service
1. Open: https://dashboard.render.com
2. Find your **Web Service** (backend)
3. It might be named: `ecomm-backend`, `techcard-api`, or similar
4. Click on it

### Step 2: Check Settings
1. Click **"Settings"** tab
2. Scroll to **"Build & Deploy"**

### Step 3: Verify Build Command
**Current value:** (check what it says)

**Should be:**
```
npm install
```

If wrong:
1. Click **"Edit"**
2. Change to: `npm install`
3. Click **"Save Changes"**

### Step 4: Verify Start Command
**Current value:** (check what it says)

**Should be ONE of these:**
```
node server/index.js
```
OR
```
npm start
```

If wrong:
1. Click **"Edit"**
2. Change to: `node server/index.js`
3. Click **"Save Changes"**

### Step 5: Verify Environment Variables
Click **"Environment"** tab

**REQUIRED variables:**
- ✅ `NODE_ENV` = `production`
- ✅ `MONGODB_URI` = Your MongoDB Atlas connection string
- ✅ `JWT_SECRET` = A random secret key
- ✅ `PORT` = `10000`
- ✅ `CLIENT_URL` = Your frontend URL (https://techcard.onrender.com)

**If any are missing:**
1. Click **"Add Environment Variable"**
2. Enter key and value
3. Click **"Save Changes"**

### Step 6: Redeploy
1. Click **"Manual Deploy"** (top right)
2. Select **"Clear build cache & deploy"**
3. Wait 3-5 minutes
4. Watch logs

---

## 📊 WHAT LOGS SHOULD SHOW

After fixing, your logs should show:

```
==> Cloning from GitHub...
==> Running 'npm install'
==> added 150 packages
==> Build succeeded
==> Running 'node server/index.js'
==> ✅ MongoDB connected successfully
==> Server running on port 10000
==> Your service is live 🎉
```

---

## ❌ COMMON MISTAKES

### Mistake #1: No Build Command
**Problem:** Build command is empty or wrong
**Solution:** Set to `npm install`

### Mistake #2: Wrong Start Command
**Problem:** Start command is `npm run dev` or `nodemon`
**Solution:** Set to `node server/index.js` or `npm start`

### Mistake #3: Missing Environment Variables
**Problem:** MONGODB_URI or JWT_SECRET not set
**Solution:** Add all required environment variables

### Mistake #4: Wrong Root Directory
**Problem:** Root directory is set to `server/`
**Solution:** Leave root directory empty (deploy from project root)

---

## 🔍 VERIFY BACKEND IS WORKING

After successful deployment:

### Test 1: Visit Backend URL
Visit: `https://your-backend-name.onrender.com`

You should see:
```json
{"message": "API is running"}
```
OR a similar response (not 404)

### Test 2: Check API Endpoint
Visit: `https://your-backend-name.onrender.com/api/products`

You should see:
```json
[]
```
OR a list of products (not an error)

### Test 3: Check Logs
Logs should show:
```
✅ MongoDB connected successfully
Server running on port 10000
```

---

## 🔗 CONNECT FRONTEND TO BACKEND

After backend is working:

### Update Frontend Environment Variable:
1. Go to your **Static Site** (frontend) service
2. Click **"Environment"** tab
3. Find or add: `VITE_API_URL`
4. Set value to: `https://your-backend-name.onrender.com/api`
5. Save and redeploy frontend

---

## 🆘 STILL HAVING ISSUES?

### Check These:

1. **MongoDB Connection:**
   - Is MONGODB_URI correct?
   - Does it include database name?
   - Is IP whitelist set to 0.0.0.0/0?

2. **Dependencies:**
   - Did `npm install` succeed?
   - Check logs for "added X packages"

3. **Port:**
   - Is PORT set to 10000?
   - Does your code use process.env.PORT?

4. **Start Command:**
   - Does `server/index.js` exist?
   - Is the path correct?

---

## 📋 BACKEND CHECKLIST

- [ ] Backend service is Web Service (not Static Site)
- [ ] Build Command is `npm install`
- [ ] Start Command is `node server/index.js` or `npm start`
- [ ] NODE_ENV is set to `production`
- [ ] MONGODB_URI is set (from MongoDB Atlas)
- [ ] JWT_SECRET is set (random string)
- [ ] PORT is set to `10000`
- [ ] CLIENT_URL is set (frontend URL)
- [ ] Deployment succeeded
- [ ] Logs show "MongoDB connected"
- [ ] Logs show "Server running"
- [ ] Backend URL returns response (not 404)

---

## ✅ SUCCESS!

When backend is working:
- ✅ No "Cannot find module" errors
- ✅ MongoDB connected
- ✅ Server running
- ✅ API endpoints respond
- ✅ Frontend can connect to backend

---

**Fix the backend settings, redeploy, and your API will work!**
