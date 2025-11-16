# 🛒 E-Commerce Platform

A full-stack e-commerce platform built with React, Node.js, Express, and MongoDB.

## ✨ Features

### For Customers
- 🔐 User authentication (Register/Login)
- 🛍️ Browse products by categories
- 🔍 Search and filter products
- 🛒 Shopping cart management
- ❤️ Wishlist functionality
- 📦 Order tracking
- 🎫 Support ticket system
- 💰 Discount and coupon system

### For Admins
- 📊 Comprehensive dashboard with analytics
- 👥 User management (view, edit, block/unblock)
- 📦 Product management (CRUD operations)
- 🏷️ Category and brand management
- 📋 Order management and status updates
- 🎟️ Support ticket handling
- 💸 Discount and coupon management
- 📈 Sales analytics and reports
- 🔔 Real-time notifications
- 🔍 Advanced filtering (by category, status, low stock)

## 🚀 Tech Stack

### Frontend
- **React 19** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **React Icons** - Icon library
- **Swiper** - Carousel component

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
e-commerce/
├── frontend/                 # React frontend
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── config/          # Configuration files
│   │   └── App.jsx          # Main app component
│   └── package.json
│
├── backend/
│   └── server/              # Express backend
│       ├── src/
│       │   ├── models/      # Mongoose models
│       │   ├── routes/      # API routes
│       │   ├── middleware/  # Custom middleware
│       │   └── server.js    # Entry point
│       └── package.json
│
├── vercel.json              # Vercel deployment config
├── DEPLOYMENT.md            # Deployment guide
└── README.md                # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend/server
npm install

# Install frontend dependencies
cd ../../frontend
npm install
```

3. **Set up environment variables**

Create `backend/server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shopeasy
JWT_SECRET=your_super_secret_key_here
CORS_ORIGIN=http://localhost:5173
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

4. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

5. **Run the application**

Open two terminal windows:

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

6. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to Vercel.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/YOUR_REPO_NAME)

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:category` - Get products by category

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove from cart

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/checkout` - Create new order

### Admin (Protected)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/products` - Get all products (with filters)
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected admin routes
- CORS configuration
- Helmet security headers
- Input validation
- MongoDB injection prevention

## 🎨 Screenshots

[Add screenshots of your application here]

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Your Name - [@yourhandle](https://twitter.com/yourhandle)

## 🙏 Acknowledgments

- React team for the amazing library
- MongoDB for the database
- Vercel for hosting
- All contributors and supporters

## 📞 Support

For support, email your-email@example.com or create an issue in this repository.

---

Made with ❤️ by [Your Name]
