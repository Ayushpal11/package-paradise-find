#!/bin/bash

# Package Paradise Setup Script
echo "🚀 Setting up Package Paradise..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node -v)"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Create .env files
echo "⚙️ Creating environment files..."

# Frontend .env
cat > .env << 'EOF'
# Frontend Environment Variables

# Backend API URL
VITE_API_URL=http://localhost:3001
EOF

# Backend .env (placeholder - user needs to add DB credentials)
cat > backend/.env << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/travel_packages

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Origins (comma separated for multiple origins)
CORS_ORIGINS=http://localhost:8080,http://localhost:5173
EOF

echo "✅ Environment files created!"

echo ""
echo "📝 Next steps:"
echo "1. Update backend/.env with your PostgreSQL connection string"
echo "2. Run 'cd backend && npm start' to start the backend"
echo "3. In another terminal, run 'cd backend && npm run seed' to seed data"
echo "4. Run 'npm run dev' to start the frontend"
echo ""
echo "📚 Read QUICKSTART.md for detailed setup instructions"
echo ""
echo "🎉 Setup complete!"

