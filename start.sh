#!/bin/bash

echo "🔍 File Search Application - Startup Script"
echo "=========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose and try again."
    exit 1
fi

echo "✅ Docker is running"

# Stop existing containers if running
echo "🛑 Stopping any existing containers..."
docker-compose down

# Remove any orphaned containers
echo "🧹 Cleaning up..."
docker-compose down --remove-orphans

# Build and start the application
echo "🏗️  Building and starting the application..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "🎉 Application started successfully!"
    echo ""
    echo "📋 Service URLs:"
    echo "   Frontend (Web UI): http://localhost:3000"
    echo "   Backend API:       http://localhost:8000"
    echo "   Database:          localhost:5432"
    echo ""
    echo "🔍 Search Directory: Any directory on your Mac (e.g., /Users/vndr, /Applications, etc.)"
    echo ""
    echo "📖 Usage:"
    echo "   1. Open http://localhost:3000 in your browser"
    echo "   2. Enter your search term (e.g., 'John Doe')"
    echo "   3. Click 'Start Search' to begin searching"
    echo "   4. View results in real-time"
    echo ""
    echo "🛠️  Management Commands:"
    echo "   View logs:    docker-compose logs -f"
    echo "   Stop app:     docker-compose down"
    echo "   Restart:      docker-compose restart"
    echo ""
    
    # Try to open the browser (macOS)
    if command -v open &> /dev/null; then
        echo "🌐 Opening browser..."
        sleep 3
        open http://localhost:3000
    fi
else
    echo "❌ Failed to start some services. Check the logs:"
    docker-compose logs
    exit 1
fi