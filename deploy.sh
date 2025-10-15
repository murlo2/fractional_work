#!/bin/bash

# Baseball Stats App - Production Deployment Script
set -e

echo "🚀 Starting Baseball Stats App Production Deployment"
echo "=================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cp env.production.example .env
    echo "📝 Please edit .env file with your configuration before running again."
    echo "   Required: DB_PASSWORD, GEMINI_API_KEY"
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Initialize database
echo "🗄️  Initializing database..."
docker-compose exec app python database_setup.py

# Check if services are running
echo "🔍 Checking service health..."
sleep 5

if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Application is running successfully!"
    echo "🌐 Access your app at: http://localhost:5000"
    echo "📊 API Health: http://localhost:5000/api/health"
else
    echo "❌ Application failed to start. Check logs with: docker-compose logs"
    exit 1
fi

echo ""
echo "🎉 Deployment complete!"
echo "📋 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop app: docker-compose down"
echo "   Restart: docker-compose restart"
echo "   Update: docker-compose pull && docker-compose up -d"
