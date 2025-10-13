# 🔧 Render Deployment Troubleshooting

## Issue: Frontend Shows 404 Error

### Symptoms:
- Site shows Render's default error page
- Console shows: `GET https://techcard.onrender.com/ 404 (Not Found)`
- CSP (Content Security Policy) errors

### ✅ Solution Applied:

**Fixed Vite configuration** - Added explicit build settings to ensure proper build output.

---

## 🔄 Steps to Fix Your Deployment:

### 1. Code is Already Fixed and Pushed ✅
The fix has been committed to GitHub. Render will auto-deploy.

### 2. Wait for Render to Redeploy (2-3 minutes)
1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your **frontend service** (techcard)
3. You should see a new deployment in progress
4. Wait for "Deploy succeeded" message

### 3. If Auto-Deploy Didn't Trigger:
**Manually trigger a redeploy:**
1. Go to your frontend service on Render
2. Click **"Manual Deploy"** button (top right)
3. Select **"Clear build cache & deploy"**
4. Wait 3-5 minutes for build to complete

---

## ✅ Verify Your Render Configuration:

### Frontend Service Settings:
Make sure these are set correctly:

**Build Settings:**
```
Build Command: cd client && npm install && npm run build
Publish Directory: client/dist
```

**Environment Variables:**
```
VITE_API_URL = https://your-backend-name.onrender.com/api
```

### Common Mistakes:

❌ **Wrong:** `Publish Directory: dist`
✅ **Correct:** `Publish Directory: client/dist`

❌ **Wrong:** `Build Command: npm run build`
✅ **Correct:** `Build Command: cd client && npm install && npm run build`

---

## 🔍 How to Check if It's Working:

### After Redeployment:
1. Visit: `https://techcard.onrender.com`
2. You should see your e-commerce homepage
3. No more 404 errors
4. No CSP errors

### If Still Not Working:

**Check Render Logs:**
1. Go to frontend service
2. Click **"Logs"** tab
3. Look for build errors
4. Common issues:
   - `npm install` failed
   - Build command incorrect
   - Missing dependencies

---

## 🐛 Other Common Issues:

### Issue: "Failed to fetch" or CORS errors

**Symptoms:**
- Frontend loads but can't connect to backend
- Console shows CORS errors

**Solution:**
1. Check `VITE_API_URL` in frontend environment variables
2. Make sure it points to your backend URL + `/api`
3. Verify `CLIENT_URL` is set in backend environment variables
4. Example:
   ```
   Frontend VITE_API_URL: https://backend-name.onrender.com/api
   Backend CLIENT_URL: https://techcard.onrender.com
   ```

---

### Issue: Backend not responding

**Symptoms:**
- Frontend loads but API calls timeout
- Backend shows as "sleeping"

**Solution:**
1. First request to backend takes 30-60 seconds (cold start)
2. Wait patiently for first load
3. Use UptimeRobot to keep backend warm:
   - Sign up: https://uptimerobot.com
   - Add monitor: `https://your-backend.onrender.com/api/products`
   - Interval: Every 10 minutes

---

### Issue: MongoDB connection failed

**Symptoms:**
- Backend logs show: "MongoDB connection error"
- Can't create users or orders

**Solution:**
1. Check MongoDB Atlas IP whitelist
2. Should have: `0.0.0.0/0` (allow from anywhere)
3. Verify connection string in `MONGODB_URI`
4. Make sure password doesn't have special characters that need encoding
5. Database name should be in the connection string:
   ```
   mongodb+srv://user:pass@cluster.mongodb.net/ecommerce?retryWrites=true
   ```

---

## 📋 Complete Checklist:

### Frontend:
- [ ] Build command: `cd client && npm install && npm run build`
- [ ] Publish directory: `client/dist`
- [ ] Environment variable `VITE_API_URL` is set
- [ ] Latest code pushed to GitHub
- [ ] Deployment succeeded (check logs)

### Backend:
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] All environment variables set:
  - [ ] `NODE_ENV = production`
  - [ ] `MONGODB_URI` (from Atlas)
  - [ ] `JWT_SECRET` (random string)
  - [ ] `PORT = 10000`
  - [ ] `CLIENT_URL` (frontend URL)
- [ ] MongoDB Atlas configured correctly
- [ ] Deployment succeeded

---

## 🔄 Force Clean Rebuild:

If nothing works, try a complete clean rebuild:

### Frontend:
1. Go to Render dashboard → Frontend service
2. Click **"Manual Deploy"** → **"Clear build cache & deploy"**
3. Wait for completion

### Backend:
1. Go to Render dashboard → Backend service
2. Click **"Manual Deploy"** → **"Clear build cache & deploy"**
3. Wait for completion

---

## 🆘 Still Having Issues?

### Check These:

1. **GitHub Repository:**
   - Latest code pushed?
   - Run: `git status` to check

2. **Render Dashboard:**
   - Any failed deployments?
   - Check logs for errors

3. **Browser Console:**
   - What errors do you see?
   - Network tab shows failed requests?

4. **MongoDB Atlas:**
   - Cluster running?
   - IP whitelist configured?
   - Connection string correct?

---

## 📞 Get Help:

**Render Community:**
- https://community.render.com

**Check Render Status:**
- https://status.render.com

**Your Repository:**
- https://github.com/elcanaoel/ecommerces/issues

---

## ✅ Expected Result After Fix:

1. Visit `https://techcard.onrender.com`
2. See your e-commerce homepage
3. Browse products
4. No console errors
5. Everything works! 🎉

---

**The fix has been pushed. Wait 2-3 minutes for Render to auto-deploy, then refresh your site!**
