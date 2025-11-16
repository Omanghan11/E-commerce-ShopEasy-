#!/bin/bash

echo "🚀 Setting up E-Commerce Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend/server
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../../frontend
npm install

# Create .env files if they don't exist
cd ..
if [ ! -f "backend/server/.env" ]; then
    echo "📝 Creating backend .env file..."
    cp backend/server/.env.example backend/server/.env
    echo "⚠️  Please update backend/server/.env with your MongoDB URI and JWT secret"
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend .env file..."
    cp frontend/.env.example frontend/.env
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update backend/server/.env with your MongoDB URI and JWT secret"
echo "2. Start MongoDB (if using local): mongod"
echo "3. Start backend: cd backend/server && npm run dev"
echo "4. Start frontend: cd frontend && npm run dev"
echo ""
echo "🌐 Frontend will be available at: http://localhost:5173"
echo "🔧 Backend will be available at: http://localhost:5000"
