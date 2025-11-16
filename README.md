# 🛒 ShopEasy - E-Commerce Platform

A full-stack e-commerce platform with React, Node.js, Express, and MongoDB.

## 🌐 Live Demo

- **Frontend:** https://e-commerce-shop-easy.vercel.app
- **Backend API:** https://shopeasy-backend-sagk.onrender.com

## ✨ Features

### Customer Features
- User authentication (Register/Login)
- Browse products by categories
- Search and filter products
- Shopping cart management
- Wishlist functionality
- Order tracking
- Support ticket system
- Discount and coupon system

### Admin Features
- Comprehensive dashboard with analytics
- User management (view, edit, block/unblock)
- Product management (CRUD operations)
- **Product filtering** (by category, status, low stock)
- Category and brand management
- Order management and status updates
- Support ticket handling
- Discount and coupon management
- Sales analytics and reports
- Real-time notifications

## 🚀 Tech Stack

**Frontend:** React 19, React Router, Tailwind CSS, Vite  
**Backend:** Node.js, Express, MongoDB, Mongoose  
**Deployment:** Vercel (Frontend), Render (Backend), MongoDB Atlas (Database)  
**Authentication:** JWT  
**File Upload:** Multer

## 📦 Project Structure

```
├── frontend/          # React frontend
│   ├── src/
│   │   ├── pages/     # Page components
│   │   ├── Components/# Reusable components
│   │   └── config/    # API configuration
│   └── package.json
│
├── backend/server/    # Express backend
│   ├── src/
│   │   ├── models/    # Mongoose models
│   │   ├── routes/    # API routes
│   │   └── middleware/# Auth middleware
│   └── package.json
│
└── vercel.json        # Vercel config
```

## 🔧 Local Development

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/Omanghan11/E-commerce-ShopEasy-.git
cd E-commerce-ShopEasy-
```

2. **Install dependencies**
```bash
# Backend
cd backend/server
npm install

# Frontend
cd ../../frontend
npm install
```

3. **Environment Variables**

Create `backend/server/.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

4. **Run the application**

Terminal 1 (Backend):
```bash
cd backend/server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

Visit: http://localhost:5173

## 📚 Documentation

- **Deployment Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Security Guide:** [SECURITY.md](./SECURITY.md)
- **Quick Start:** [QUICK_START.md](./QUICK_START.md)

## 🔐 Admin Access

To create an admin user:
1. Register a user through the frontend
2. Go to MongoDB Atlas → Browse Collections
3. Find the user in the `users` collection
4. Change `role` field to `"admin"`
5. Login with admin credentials

## 🆕 Recent Updates

- ✅ Added product filtering (category, status, low stock)
- ✅ Deployed to Vercel + Render
- ✅ MongoDB Atlas integration
- ✅ Fixed CORS for production
- ✅ SPA routing support

## 📝 License

MIT License

## 👨‍💻 Author

Omanghan11

---

**Live Site:** https://e-commerce-shop-easy.vercel.app
