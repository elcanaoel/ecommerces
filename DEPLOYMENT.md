# Deployment Guide

## Option 1: Render (Recommended - Easiest)

### Prerequisites
1. Create a [Render account](https://render.com) (free)
2. Create a [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas) (free)
3. Push your code to GitHub

### Step 1: Setup MongoDB Atlas (Free Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0 Sandbox - FREE)
3. Create a database user (username + password)
4. Add IP address `0.0.0.0/0` to whitelist (allow from anywhere)
5. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority
   ```

### Step 2: Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `ecomm-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = `your-mongodb-atlas-connection-string`
   - `JWT_SECRET` = `your-super-secret-jwt-key-here-change-this`
   - `PORT` = `10000`

6. Click **"Create Web Service"**
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL: `https://ecomm-backend.onrender.com`

### Step 3: Update Frontend API URL

1. Edit `client/src/utils/api.js`:
   ```javascript
   const API_URL = import.meta.env.PROD 
     ? 'https://ecomm-backend.onrender.com/api'
     : '/api'
   ```

2. Or create `client/.env.production`:
   ```
   VITE_API_URL=https://ecomm-backend.onrender.com/api
   ```

### Step 4: Deploy Frontend to Render

1. Click **"New +"** → **"Static Site"**
2. Connect same GitHub repository
3. Configure:
   - **Name**: `ecomm-frontend`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`

4. Click **"Create Static Site"**
5. Your site will be live at: `https://ecomm-frontend.onrender.com`

---

## Option 2: Vercel (Frontend) + Render (Backend)

### Backend on Render
Follow steps above for backend deployment.

### Frontend on Vercel

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add Environment Variable:
   - `VITE_API_URL` = `https://ecomm-backend.onrender.com/api`

5. Deploy!

---

## Option 3: Railway (Full-Stack)

1. Go to [Railway](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will auto-detect Node.js
5. Add MongoDB database from Railway marketplace (or use Atlas)
6. Add environment variables
7. Deploy!

---

## Important: Update CORS Settings

In `server/index.js`, update CORS to allow your frontend domain:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://ecomm-frontend.onrender.com',
  'https://your-vercel-domain.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

---

## Post-Deployment Checklist

- ✅ Test user registration/login
- ✅ Test product browsing
- ✅ Test cart functionality
- ✅ Test checkout process
- ✅ Test admin login
- ✅ Test admin product management
- ✅ Test order management
- ✅ Verify MongoDB connection
- ✅ Check all images load
- ✅ Test on mobile devices

---

## Free Tier Limitations

### Render Free Tier:
- ⚠️ Services spin down after 15 min inactivity
- ⚠️ Cold start takes 30-60 seconds
- ✅ 750 hours/month free
- ✅ Automatic HTTPS

### MongoDB Atlas Free Tier:
- ✅ 512MB storage
- ✅ Shared cluster
- ✅ Perfect for testing/small projects

### Vercel Free Tier:
- ✅ Unlimited bandwidth
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Global CDN

---

## Troubleshooting

### Backend won't start:
- Check environment variables are set correctly
- Verify MongoDB connection string
- Check Render logs for errors

### Frontend can't connect to backend:
- Verify API_URL is correct
- Check CORS settings
- Ensure backend is running

### Database connection fails:
- Check MongoDB Atlas IP whitelist (use 0.0.0.0/0)
- Verify connection string format
- Check database user credentials

---

## Cost Optimization

**To avoid cold starts on Render:**
- Use a free uptime monitoring service (UptimeRobot)
- Ping your backend every 10 minutes
- Keeps service warm and responsive

**Upgrade Options:**
- Render: $7/month for always-on service
- Railway: $5/month credit
- MongoDB Atlas: $9/month for dedicated cluster

---

## Alternative Free Hosts

1. **Fly.io** - 3 free VMs, great performance
2. **Cyclic** - Serverless, easy deployment
3. **Netlify** - Great for static sites + serverless functions
4. **Heroku** - No longer has free tier (paid only)
5. **DigitalOcean App Platform** - $5/month (not free)

---

## Recommended Setup (100% Free)

✅ **Frontend**: Vercel (unlimited, fast CDN)
✅ **Backend**: Render (750 hours/month free)
✅ **Database**: MongoDB Atlas (512MB free)
✅ **File Storage**: Cloudinary (free tier for images)
✅ **Monitoring**: UptimeRobot (free pings)

**Total Cost: $0/month** 🎉
