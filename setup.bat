@echo off
echo 🚀 Setting up E-Commerce Platform...

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js v18 or higher.
    exit /b 1
)

echo ✅ Node.js is installed
node -v

REM Install root dependencies
echo 📦 Installing root dependencies...
call npm install

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend\server
call npm install

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd ..\..\frontend
call npm install

REM Create .env files if they don't exist
cd ..
if not exist "backend\server\.env" (
    echo 📝 Creating backend .env file...
    copy backend\server\.env.example backend\server\.env
    echo ⚠️  Please update backend\server\.env with your MongoDB URI and JWT secret
)

if not exist "frontend\.env" (
    echo 📝 Creating frontend .env file...
    copy frontend\.env.example frontend\.env
)

echo.
echo ✅ Setup complete!
echo.
echo 📋 Next steps:
echo 1. Update backend\server\.env with your MongoDB URI and JWT secret
echo 2. Start MongoDB (if using local): mongod
echo 3. Start backend: cd backend\server ^&^& npm run dev
echo 4. Start frontend: cd frontend ^&^& npm run dev
echo.
echo 🌐 Frontend will be available at: http://localhost:5173
echo 🔧 Backend will be available at: http://localhost:5000

pause
