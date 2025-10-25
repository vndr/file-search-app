#!/bin/bash

echo "🛑 Stopping File Search Application..."

# Stop all containers
docker-compose down

echo "✅ Application stopped successfully!"

echo ""
echo "🧹 Additional cleanup options:"
echo "   Remove volumes (data): docker-compose down -v"
echo "   Remove images: docker-compose down --rmi all"
echo "   Full cleanup: docker-compose down -v --rmi all --remove-orphans"