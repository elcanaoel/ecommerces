# 🚀 Deploy to Vercel - Complete Guide

## 📋 Deployment Strategy

**Frontend (React):** Vercel ✅
**Backend (Node.js/Express):** Render or Railway ✅
**Database:** MongoDB Atlas ✅

Vercel is perfect for your React frontend, but your Express backend needs a different service.

---

## 🎯 Step 1: Deploy Frontend to Vercel

### Prerequisites:
- ✅ Code pushed to GitHub
- ✅ Vercel account (free)

### 1.1 Sign Up for Vercel
1. Go to: https://vercel.com/signup
2. Sign up with **GitHub** (recommended)
3. Authorize Vercel to access your repositories

### 1.2 Import Your Project
1. Click **"Add New..."** → **"Project"**
2. Find and select: `elcanaoel/ecommerces`
3. Click **"Import"**

### 1.3 Configure Build Settings

**Framework Preset:** Vite
**Root Directory:** `client`
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`

### 1.4 Add Environment Variables

Click **"Environment Variables"** and add:

```
VITE_API_URL = https://your-backend-name.onrender.com/api
```

Replace `your-backend-name.onrender.com` with your actual backend URL from Render.

### 1.5 Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Your frontend will be live at: `https://your-project.vercel.app`

---

## 🔧 Step 2: Configure Vercel Settings

### Create vercel.json

I'll create this file for you to optimize the deployment:

```json
{
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🌐 Step 3: Deploy Backend (Keep on Render)

Your backend should stay on Render because:
- ✅ Needs to run 24/7
- ✅ Connects to MongoDB
- ✅ Handles API requests
- ✅ Manages file uploads

**Backend URL:** `https://your-backend.onrender.com`

Make sure your backend has:
```
CLIENT_URL = https://your-project.vercel.app
```

---

## 📊 Step 4: Update CORS Settings

Your backend needs to allow requests from Vercel:

In `server/index.js`, the CORS configuration should include your Vercel URL:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-project.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);
```

---

## ✅ Step 5: Test Your Deployment

### Frontend (Vercel):
- Visit: `https://your-project.vercel.app`
- Should load your e-commerce site
- Browse products
- Test navigation

### Backend (Render):
- Visit: `https://your-backend.onrender.com/api/products`
- Should return JSON (products or empty array)

### Full Integration:
- Try adding products to cart
- Test user registration
- Test login
- Verify API calls work

---

## 🔄 Automatic Deployments

Vercel automatically deploys when you push to GitHub:

1. Make changes to your code
2. Commit and push to GitHub
3. Vercel automatically deploys
4. New version live in 2-3 minutes!

---

## 🎨 Custom Domain (Optional)

### Add Your Own Domain:

1. Go to Vercel dashboard
2. Click your project
3. Go to **"Settings"** → **"Domains"**
4. Add your domain
5. Update DNS records as instructed
6. SSL certificate automatically provisioned

---

## 📱 Preview Deployments

Vercel creates preview URLs for every branch:

- **Production:** `https://your-project.vercel.app`
- **Preview:** `https://your-project-git-branch.vercel.app`
- **Development:** Automatic preview for PRs

---

## 🔧 Vercel CLI (Optional)

### Install Vercel CLI:
```powershell
npm install -g vercel
```

### Deploy from Terminal:
```powershell
cd client
vercel
```

### Deploy to Production:
```powershell
vercel --prod
```

---

## 🆘 Troubleshooting

### Issue: "Build Failed"

**Check:**
- Root directory is set to `client`
- Build command is correct
- All dependencies in package.json

**Solution:**
```
Root Directory: client
Build Command: npm run build
Output Directory: dist
```

### Issue: "API Calls Failing"

**Check:**
- `VITE_API_URL` environment variable is set
- Backend URL is correct
- Backend CORS allows Vercel domain

**Solution:**
1. Verify environment variable
2. Check backend logs
3. Update CORS settings

### Issue: "404 on Refresh"

**Check:**
- Rewrites configuration in vercel.json

**Solution:**
Add rewrites to handle client-side routing (already in vercel.json)

---

## 📊 Vercel vs Render Comparison

| Feature | Vercel (Frontend) | Render (Backend) |
|---------|------------------|------------------|
| **Type** | Static Sites | Web Services |
| **Best For** | React, Next.js | Node.js, APIs |
| **Free Tier** | Unlimited | 750 hours/month |
| **Auto Deploy** | ✅ Yes | ✅ Yes |
| **Custom Domain** | ✅ Free | ✅ Free |
| **SSL** | ✅ Auto | ✅ Auto |
| **CDN** | ✅ Global | ❌ No |
| **Cold Starts** | ❌ No | ⚠️ Yes (free tier) |

---

## 🎯 Recommended Setup

### Production Architecture:

```
┌─────────────────────────────────────────┐
│  Users                                  │
└─────────────────┬───────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
    ┌────▼─────┐    ┌─────▼──────┐
    │ Vercel   │    │  Render    │
    │ Frontend │◄───┤  Backend   │
    │  (React) │    │ (Express)  │
    └──────────┘    └─────┬──────┘
                          │
                    ┌─────▼──────┐
                    │  MongoDB   │
                    │   Atlas    │
                    └────────────┘
```

**Frontend:** Vercel (Fast, Global CDN)
**Backend:** Render (Always-on API)
**Database:** MongoDB Atlas (Cloud Database)

---

## 💰 Cost Breakdown

### Free Tier (Perfect for Testing):
- **Vercel:** Unlimited (with limits on bandwidth)
- **Render:** 750 hours/month
- **MongoDB Atlas:** 512MB storage

### Total: **$0/month** 🎉

### Paid Tier (For Production):
- **Vercel Pro:** $20/month (team features)
- **Render:** $7/month (no cold starts)
- **MongoDB Atlas:** $9/month (dedicated cluster)

### Total: **$36/month** for professional setup

---

## 🚀 Quick Deploy Commands

### Deploy Frontend to Vercel:
```powershell
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd client
vercel

# Deploy to production
vercel --prod
```

### Update Backend on Render:
```powershell
# Just push to GitHub
git add .
git commit -m "Update backend"
git push

# Render auto-deploys!
```

---

## ✅ Deployment Checklist

### Before Deploying:

- [ ] Code pushed to GitHub
- [ ] Backend deployed to Render
- [ ] MongoDB Atlas configured
- [ ] Backend environment variables set
- [ ] Backend is running successfully

### Vercel Deployment:

- [ ] Signed up for Vercel
- [ ] Imported GitHub repository
- [ ] Set root directory to `client`
- [ ] Added `VITE_API_URL` environment variable
- [ ] Deployed successfully
- [ ] Tested frontend loads
- [ ] Verified API calls work

### Post-Deployment:

- [ ] Updated backend `CLIENT_URL`
- [ ] Tested full user flow
- [ ] Checked all features work
- [ ] Set up custom domain (optional)
- [ ] Configured analytics (optional)

---

## 📞 Support & Resources

**Vercel Docs:** https://vercel.com/docs
**Vercel Community:** https://github.com/vercel/vercel/discussions
**Render Docs:** https://render.com/docs

---

## 🎉 Success!

After deployment:

**Frontend:** `https://your-project.vercel.app`
**Backend:** `https://your-backend.onrender.com`
**Admin:** `https://your-project.vercel.app/admin`

Your e-commerce site is now live! 🚀

---

**Start by signing up at https://vercel.com/signup and importing your GitHub repo!**
