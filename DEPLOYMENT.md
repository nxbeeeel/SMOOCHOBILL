# 🚀 Smoocho POS Deployment Guide

## 📋 **Prerequisites**
- GitHub account
- Vercel account (free)
- Railway account (free)

## 🎯 **Deployment Steps**

### **Step 1: Deploy Backend to Railway**

1. **Go to [Railway.app](https://railway.app)**
2. **Sign in with GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your repository**
5. **Railway will auto-detect it's a Node.js app**
6. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=24h
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```
7. **Click "Deploy"**
8. **Copy the generated URL** (e.g., `https://your-app-name.railway.app`)

### **Step 2: Deploy Frontend to Vercel**

1. **Go to [Vercel.com](https://vercel.com)**
2. **Sign in with GitHub**
3. **Click "New Project" → "Import Git Repository"**
4. **Select your repository**
5. **Configure:**
   - **Framework Preset**: Other
   - **Root Directory**: `./client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
6. **Set Environment Variables:**
   ```
   REACT_APP_API_URL=https://your-railway-app-name.railway.app
   REACT_APP_WS_URL=wss://your-railway-app-name.railway.app
   ```
7. **Click "Deploy"**

### **Step 3: Update Client Environment**

1. **Copy the Railway URL from Step 1**
2. **Update `client/.env.production`:**
   ```
   REACT_APP_API_URL=https://your-railway-app-name.railway.app
   REACT_APP_WS_URL=wss://your-railway-app-name.railway.app
   ```
3. **Redeploy on Vercel**

## 🔧 **Post-Deployment**

### **Test Your App:**
- Frontend: `https://your-app-name.vercel.app`
- Backend: `https://your-railway-app-name.railway.app/health`

### **Default Login:**
- **Username**: `admin`
- **Password**: `admin123`

## 🆘 **Troubleshooting**

### **If Backend Won't Start:**
- Check Railway logs
- Verify environment variables
- Ensure `dist` folder exists after build

### **If Frontend Can't Connect:**
- Verify `REACT_APP_API_URL` is correct
- Check CORS settings on backend
- Ensure Railway app is running

## 💰 **Costs**
- **Vercel**: Free tier (unlimited deployments)
- **Railway**: Free tier (500 hours/month)

## 🔄 **Auto-Deploy**
Both platforms auto-deploy when you push to GitHub!

## 📝 **Latest Deployment Status**
**Last Updated**: August 30, 2025
**Status**: All dependency conflicts resolved ✅
**Ready for deployment**: Yes ✅
