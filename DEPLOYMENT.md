# Deployment Guide - E-Commerce Platform

This guide will help you deploy your e-commerce platform to Vercel with a secure backend.

## 🚀 Quick Deployment Steps

### 1. Prepare Your Repository

First, initialize git and push to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 2. Set Up MongoDB Atlas (Free Tier)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
6. Replace `<password>` with your actual password
7. Add your database name at the end: `mongodb+srv://username:password@cluster.mongodb.net/shopeasy`

**Important:** In Network Access, add `0.0.0.0/0` to allow connections from anywhere (required for Vercel)

### 3. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [Vercel](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure the project:
   - **Framework Preset:** Vite
   - **Root Directory:** Leave as `./`
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Output Directory:** `frontend/dist`
   - **Install Command:** `npm install && cd backend/server && npm install && cd ../../frontend && npm install`

6. Add Environment Variables (click "Environment Variables"):

```
# Backend Variables
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_long_random_secret_key_here
PORT=5000
NODE_ENV=production

# Frontend Variables
VITE_API_URL=https://your-project-name.vercel.app
```

7. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts and add environment variables when asked
```

### 4. Configure Environment Variables in Vercel

After deployment, go to your project settings:

1. Navigate to: Project → Settings → Environment Variables
2. Add these variables:

**Production Environment:**
- `MONGODB_URI` = Your MongoDB Atlas connection string
- `JWT_SECRET` = A long random string (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `PORT` = 5000
- `NODE_ENV` = production
- `VITE_API_URL` = https://your-project-name.vercel.app
- `CORS_ORIGIN` = https://your-project-name.vercel.app

### 5. Update CORS After First Deployment

After your first deployment, you'll get a Vercel URL (e.g., `https://your-project.vercel.app`).

Update the `CORS_ORIGIN` environment variable in Vercel:
1. Go to Project Settings → Environment Variables
2. Update `CORS_ORIGIN` to your Vercel URL
3. Redeploy the project

### 6. Verify Deployment

1. Visit your Vercel URL
2. Test the following:
   - Homepage loads correctly
   - User registration/login works
   - Products display properly
   - Admin dashboard is accessible
   - Image uploads work

## 🔒 Security Checklist

- ✅ `.env` files are in `.gitignore`
- ✅ MongoDB connection string is not in code
- ✅ JWT secret is environment variable
- ✅ CORS is configured for production domain
- ✅ MongoDB Atlas has proper network access rules
- ✅ Admin routes require authentication

## 🌐 Custom Domain (Optional)

To use a custom domain:

1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Update `CORS_ORIGIN` and `VITE_API_URL` to your custom domain

## 📝 Post-Deployment Tasks

1. **Create Admin User:**
   - Register a user through the frontend
   - Manually update the user's role to 'admin' in MongoDB Atlas:
     ```javascript
     // In MongoDB Atlas → Collections → users
     // Find your user and update:
     { "role": "admin" }
     ```

2. **Add Products:**
   - Login as admin
   - Use the admin dashboard to add products

3. **Test All Features:**
   - User registration/login
   - Product browsing
   - Cart functionality
   - Checkout process
   - Admin operations

## 🐛 Troubleshooting

### Issue: "CORS Error"
**Solution:** Make sure `CORS_ORIGIN` environment variable matches your Vercel URL exactly.

### Issue: "Cannot connect to database"
**Solution:** 
- Check MongoDB Atlas connection string
- Verify network access allows `0.0.0.0/0`
- Ensure password doesn't contain special characters (or URL encode them)

### Issue: "Images not loading"
**Solution:** 
- Check that image paths are correct
- Verify static file serving is working
- For production, consider using a CDN like Cloudinary

### Issue: "API calls failing"
**Solution:**
- Verify `VITE_API_URL` is set correctly
- Check browser console for exact error
- Verify backend is deployed and running

## 📊 Monitoring

Vercel provides:
- **Analytics:** Project → Analytics
- **Logs:** Project → Deployments → [Select Deployment] → Logs
- **Performance:** Built-in performance monitoring

## 🔄 Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch triggers automatic deployment
- Pull requests create preview deployments
- Rollback to previous deployments anytime

## 💡 Tips

1. **Use Environment Variables:** Never hardcode sensitive data
2. **Test Locally First:** Always test changes locally before pushing
3. **Monitor Logs:** Check Vercel logs regularly for errors
4. **Backup Database:** Regularly backup your MongoDB database
5. **Use Preview Deployments:** Test changes in preview before merging to main

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- GitHub Issues: Create issues in your repository

---

**Note:** The backend API will be accessible at the same domain as your frontend (e.g., `https://your-project.vercel.app/api/*`), but users will only interact with the frontend interface.
