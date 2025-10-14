#!/bin/bash

echo "🛑 Stopping all processes..."
pkill -f "python run.py" 2>/dev/null
pkill -f "react-scripts start" 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5000 | xargs kill -9 2>/dev/null
sleep 2

echo "🔄 Ensuring PostgreSQL service is running..."
brew services start postgresql@15
sleep 2

echo "🔄 Ensuring database exists..."
if ! psql -lqt | cut -d \| -f 1 | grep -qw baseball_db; then
    createdb baseball_db
    echo "✅ Database created"
else
    echo "✅ Database already exists"
fi

echo "🚀 Starting fresh..."
cd backend && source venv/bin/activate && python run.py &
sleep 3
cd frontend && npm start &
echo "✅ App starting at http://localhost:3000"
echo "📱 Open your browser to http://localhost:3000"
echo ""
echo "ℹ️  Note: This script handles service management and app restart."
echo "   For first-time setup, run: ./setup.sh (installs everything automatically)"
