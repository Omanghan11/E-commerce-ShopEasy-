# 🎮 Command Reference

Quick reference for all commands you'll need.

## 📦 Installation

### Initial Setup
```bash
# Windows
setup.bat

# Mac/Linux
chmod +x setup.sh
./setup.sh
```

### Manual Installation
```bash
# Install all dependencies
npm install
cd backend/server && npm install
cd ../../frontend && npm install
```

## 🚀 Development

### Start Backend
```bash
cd backend/server
npm run dev
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### Start Both (in separate terminals)
```bash
# Terminal 1
cd backend/server && npm run dev

# Terminal 2
cd frontend && npm run dev
```

## 🏗️ Build

### Build Frontend
```bash
cd frontend
npm run build
```

### Preview Production Build
```bash
cd frontend
npm run preview
```

## 🔧 Git Commands

### Initialize Repository
```bash
# Windows
init-github.bat

# Mac/Linux
chmod +x init-github.sh
./init-github.sh
```

### Manual Git Setup
```bash
# Initialize
git init

# Add files
git add .

# Commit
git commit -m "Initial commit"

# Add remote
git remote add origin YOUR_GITHUB_URL

# Push
git branch -M main
git push -u origin main
```

### Common Git Commands
```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Your message"

# Push changes
git push

# Pull changes
git pull

# Create branch
git checkout -b feature-name

# Switch branch
git checkout main

# Merge branch
git merge feature-name
```

## 🌐 Vercel Deployment

### Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Environment Variables
```bash
# Add environment variable
vercel env add VARIABLE_NAME

# List environment variables
vercel env ls

# Remove environment variable
vercel env rm VARIABLE_NAME
```

## 🗄️ MongoDB Commands

### MongoDB Atlas
```bash
# Connect via MongoDB Compass
mongodb+srv://username:password@cluster.mongodb.net/

# Connect via mongosh
mongosh "mongodb+srv://cluster.mongodb.net/" --username username
```

### Local MongoDB
```bash
# Start MongoDB
mongod

# Connect to MongoDB
mongosh

# Show databases
show dbs

# Use database
use shopeasy

# Show collections
show collections

# Find all documents
db.users.find()

# Find one document
db.users.findOne({ email: "admin@example.com" })

# Update document
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## 🧪 Testing

### Run Linter
```bash
cd frontend
npm run lint
```

### Check for Security Issues
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Force fix
npm audit fix --force
```

## 🔄 Update Dependencies

### Check for Updates
```bash
# Check outdated packages
npm outdated

# Update all packages
npm update

# Update specific package
npm update package-name
```

### Update to Latest Versions
```bash
# Install npm-check-updates
npm install -g npm-check-updates

# Check for updates
ncu

# Update package.json
ncu -u

# Install updated packages
npm install
```

## 🧹 Cleanup

### Clear Node Modules
```bash
# Windows
rmdir /s /q node_modules
rmdir /s /q backend\server\node_modules
rmdir /s /q frontend\node_modules

# Mac/Linux
rm -rf node_modules
rm -rf backend/server/node_modules
rm -rf frontend/node_modules
```

### Clear Build Files
```bash
# Windows
rmdir /s /q frontend\dist

# Mac/Linux
rm -rf frontend/dist
```

### Reinstall Everything
```bash
# Clear and reinstall
npm run clean-install  # if script exists

# Or manually
rm -rf node_modules package-lock.json
npm install
```

## 📊 Monitoring

### View Vercel Logs
```bash
# View logs
vercel logs

# Follow logs
vercel logs --follow

# View specific deployment logs
vercel logs DEPLOYMENT_URL
```

### Check Build Status
```bash
# List deployments
vercel ls

# Get deployment info
vercel inspect DEPLOYMENT_URL
```

## 🔐 Security

### Generate JWT Secret
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

### Check for Security Issues
```bash
# Run security audit
npm audit

# Check specific package
npm audit package-name
```

## 🛠️ Troubleshooting

### Clear Cache
```bash
# Clear npm cache
npm cache clean --force

# Clear Vercel cache
vercel --force

# Clear browser cache
# Ctrl+Shift+Delete (Windows/Linux)
# Cmd+Shift+Delete (Mac)
```

### Reset Everything
```bash
# 1. Clear all node_modules
rm -rf node_modules backend/server/node_modules frontend/node_modules

# 2. Clear package-lock files
rm package-lock.json backend/server/package-lock.json frontend/package-lock.json

# 3. Reinstall
npm install
cd backend/server && npm install
cd ../../frontend && npm install
```

## 📝 Useful Aliases (Optional)

Add to your `.bashrc` or `.zshrc`:

```bash
# Development
alias dev-backend="cd backend/server && npm run dev"
alias dev-frontend="cd frontend && npm run dev"

# Git shortcuts
alias gs="git status"
alias ga="git add ."
alias gc="git commit -m"
alias gp="git push"

# Vercel shortcuts
alias vd="vercel"
alias vp="vercel --prod"
alias vl="vercel logs"
```

## 🎯 Quick Actions

### Deploy to Production
```bash
git add .
git commit -m "Update"
git push
# Vercel auto-deploys from GitHub
```

### Rollback Deployment
```bash
# Via Vercel Dashboard
# Project → Deployments → Select previous → Promote to Production

# Via CLI
vercel rollback
```

### Update Environment Variable
```bash
# Via Vercel Dashboard
# Project → Settings → Environment Variables → Edit

# Via CLI
vercel env add VARIABLE_NAME production
```

---

**Tip:** Bookmark this file for quick reference! 📌
