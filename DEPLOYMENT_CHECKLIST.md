# 📋 Deployment Checklist

Use this checklist to ensure a smooth deployment process.

## Pre-Deployment

### Code Preparation
- [ ] All features tested locally
- [ ] No console.log statements in production code
- [ ] All dependencies are in package.json
- [ ] .env files are in .gitignore
- [ ] No hardcoded API URLs or secrets
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Code is properly formatted

### Environment Setup
- [ ] MongoDB Atlas account created
- [ ] MongoDB cluster created (M0 Free tier)
- [ ] Database user created with password
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string obtained
- [ ] GitHub account ready
- [ ] Vercel account created

### Repository Setup
- [ ] Git initialized
- [ ] .gitignore configured
- [ ] All files committed
- [ ] GitHub repository created
- [ ] Code pushed to GitHub

## Deployment

### Vercel Setup
- [ ] Vercel account connected to GitHub
- [ ] Project imported from GitHub
- [ ] Build settings configured:
  - [ ] Framework: Vite
  - [ ] Build Command: `cd frontend && npm install && npm run build`
  - [ ] Output Directory: `frontend/dist`
  - [ ] Install Command: `npm install && cd backend/server && npm install && cd ../../frontend && npm install`

### Environment Variables
- [ ] `MONGODB_URI` added (MongoDB Atlas connection string)
- [ ] `JWT_SECRET` added (random 32+ character string)
- [ ] `PORT` added (5000)
- [ ] `NODE_ENV` added (production)
- [ ] `VITE_API_URL` added (your Vercel URL)
- [ ] `CORS_ORIGIN` added (your Vercel URL)

### First Deployment
- [ ] Deployment triggered
- [ ] Build completed successfully
- [ ] No build errors in logs
- [ ] Deployment URL obtained

## Post-Deployment

### Configuration Updates
- [ ] `CORS_ORIGIN` updated with actual Vercel URL
- [ ] `VITE_API_URL` updated with actual Vercel URL
- [ ] Project redeployed after URL updates

### Testing
- [ ] Homepage loads correctly
- [ ] Static assets (images, CSS) load
- [ ] API endpoints respond correctly
- [ ] User registration works
- [ ] User login works
- [ ] Products display correctly
- [ ] Cart functionality works
- [ ] Checkout process works
- [ ] Admin login works
- [ ] Admin dashboard loads
- [ ] Product management works
- [ ] Order management works
- [ ] Image uploads work

### Admin Setup
- [ ] First user registered
- [ ] User role updated to 'admin' in MongoDB
- [ ] Admin can access dashboard
- [ ] Admin can create products
- [ ] Admin can manage orders

### Security
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] CORS is properly configured
- [ ] JWT secret is secure
- [ ] MongoDB credentials are secure
- [ ] No sensitive data in client-side code
- [ ] Admin routes are protected

### Performance
- [ ] Page load times are acceptable
- [ ] Images are optimized
- [ ] API responses are fast
- [ ] No console errors in browser
- [ ] Mobile responsiveness verified

### Monitoring
- [ ] Vercel analytics enabled
- [ ] Error tracking set up (optional)
- [ ] MongoDB monitoring enabled
- [ ] Deployment notifications configured

## Optional Enhancements

### Custom Domain
- [ ] Domain purchased
- [ ] DNS configured
- [ ] Domain added to Vercel
- [ ] SSL certificate issued
- [ ] Environment variables updated with custom domain

### CDN for Images
- [ ] Cloudinary account created (optional)
- [ ] Image upload configured to use CDN
- [ ] Existing images migrated

### Email Service
- [ ] Email service configured (SendGrid, etc.)
- [ ] Welcome emails set up
- [ ] Order confirmation emails set up
- [ ] Password reset emails set up

### Analytics
- [ ] Google Analytics added
- [ ] Conversion tracking set up
- [ ] User behavior tracking configured

### Backup Strategy
- [ ] MongoDB backup schedule configured
- [ ] Code repository backed up
- [ ] Environment variables documented securely

## Troubleshooting

If deployment fails, check:
- [ ] Build logs in Vercel
- [ ] Environment variables are correct
- [ ] MongoDB connection string is valid
- [ ] Network access in MongoDB Atlas
- [ ] CORS configuration
- [ ] API endpoint URLs

## Maintenance

### Regular Tasks
- [ ] Monitor error logs weekly
- [ ] Check database performance
- [ ] Update dependencies monthly
- [ ] Backup database regularly
- [ ] Review security settings
- [ ] Monitor API usage
- [ ] Check for broken links

### Updates
- [ ] Test updates locally first
- [ ] Use preview deployments for testing
- [ ] Deploy during low-traffic periods
- [ ] Monitor after deployment
- [ ] Have rollback plan ready

---

**Note:** Keep this checklist updated as your deployment process evolves.
