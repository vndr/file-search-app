#!/bin/bash

echo "📊 File Search App - Project Status"
echo "===================================="
echo ""

# Check Git status
if [ -d .git ]; then
    echo "✅ Git initialized"
    
    # Check if there's a remote
    if git remote | grep -q "origin"; then
        REMOTE_URL=$(git remote get-url origin)
        echo "🔗 Remote: $REMOTE_URL"
    else
        echo "⚠️  No remote configured"
        echo "   Run ./setup-git.sh to configure"
    fi
    
    # Check current branch
    BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
    echo "🌿 Branch: $BRANCH"
    
    # Check for uncommitted changes
    if git diff --quiet && git diff --cached --quiet; then
        echo "✅ No uncommitted changes"
    else
        echo "⚠️  You have uncommitted changes:"
        git status --short
    fi
    
    # Check commits ahead/behind
    if git remote | grep -q "origin"; then
        LOCAL=$(git rev-parse @ 2>/dev/null)
        REMOTE=$(git rev-parse @{u} 2>/dev/null)
        
        if [ "$LOCAL" = "$REMOTE" ]; then
            echo "✅ Up to date with remote"
        elif [ -z "$REMOTE" ]; then
            echo "⚠️  No upstream branch set"
        else
            echo "⚠️  Branch diverged from remote"
        fi
    fi
else
    echo "❌ Git not initialized"
    echo "   Run ./setup-git.sh to initialize"
fi

echo ""
echo "🐳 Docker Status"
echo "----------------"

if command -v docker &> /dev/null; then
    if docker info > /dev/null 2>&1; then
        echo "✅ Docker is running"
        
        # Check if containers are running
        if docker-compose ps | grep -q "Up"; then
            echo "✅ Application is running"
            echo ""
            echo "   Frontend: http://localhost:3000"
            echo "   Backend:  http://localhost:8000"
            echo ""
            echo "   To stop:  ./stop.sh"
        else
            echo "⚠️  Application is not running"
            echo "   To start: ./start.sh"
        fi
    else
        echo "❌ Docker is not running"
        echo "   Please start Docker Desktop"
    fi
else
    echo "❌ Docker not installed"
fi

echo ""
echo "📁 Project Files"
echo "----------------"
echo "Backend:  $(find backend -name '*.py' | wc -l) Python files"
echo "Frontend: $(find frontend/src -name '*.js' 2>/dev/null | wc -l) JavaScript files"
echo ""

echo "🛠️  Available Commands"
echo "---------------------"
echo "  ./start.sh       - Start the application"
echo "  ./stop.sh        - Stop the application"
echo "  ./setup-git.sh   - Setup Git and push to GitHub"
echo "  ./git-push.sh    - Quick commit and push"
echo "  ./status.sh      - Show this status"
echo ""