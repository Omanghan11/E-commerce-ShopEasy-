# ⚡ Quick Start Guide

Get your e-commerce platform up and running in minutes!

## 🎯 For Local Development

### Windows Users
```bash
# Run the setup script
setup.bat

# Update backend/server/.env with your MongoDB URI

# Start backend (in one terminal)
cd backend/server
npm run dev

# Start frontend (in another terminal)
cd frontend
npm run dev
```

### Mac/Linux Users
```bash
# Make script executable
chmod +x setup.sh

# Run the setup script
./setup.sh

# Update backend/server/.env with your MongoDB URI

# Start backend (in one terminal)
cd backend/server
npm run dev

# Start frontend (in another terminal)
cd frontend
npm run dev
```

Visit: http://localhost:5173

## 🚀 For Deployment to Vercel

### Step 1: Prepare MongoDB
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account → Create cluster (M0 Free)
3. Create database user
4. Add IP: `0.0.0.0/0` in Network Access
5. Get connection string

### Step 2: Push to GitHub
```bash
# Windows
init-github.bat

# Mac/Linux
chmod +x init-github.sh
./init-github.sh

# Then follow the instructions to push to GitHub
```

### Step 3: Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Import your repository
4. Add environment variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_random_secret_key
   PORT=5000
   NODE_ENV=production
   VITE_API_URL=https://your-project.vercel.app
   CORS_ORIGIN=https://your-project.vercel.app
   ```
5. Deploy!

### Step 4: Create Admin User
1. Register a user on your deployed site
2. Go to MongoDB Atlas → Browse Collections
3. Find your user in `users` collection
4. Edit and change `role` to `"admin"`
5. Login as admin!

## 📚 Detailed Guides

- **Full Deployment Guide:** See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Deployment Checklist:** See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- **Project Documentation:** See [README_GITHUB.md](./README_GITHUB.md)

## 🆘 Common Issues

### "Cannot connect to MongoDB"
- Check your connection string
- Verify network access allows `0.0.0.0/0`
- Ensure password doesn't have special characters

### "CORS Error"
- Update `CORS_ORIGIN` in Vercel environment variables
- Make sure it matches your Vercel URL exactly

### "Images not loading"
- Check image paths in code
- Verify static file serving is configured

### "Build failed on Vercel"
- Check build logs in Vercel dashboard
- Verify all dependencies are in package.json
- Ensure environment variables are set

## 💡 Pro Tips

1. **Test locally first** - Always test changes before deploying
2. **Use preview deployments** - Test in production-like environment
3. **Monitor logs** - Check Vercel logs regularly
4. **Backup database** - Regular backups prevent data loss
5. **Use environment variables** - Never hardcode secrets

## 📞 Need Help?

- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions
- Review [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- Create an issue on GitHub
- Check Vercel documentation

---

**Happy Coding! 🎉**
