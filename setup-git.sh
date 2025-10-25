#!/bin/bash

echo "🚀 Git Repository Setup Script"
echo "=============================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git and try again."
    exit 1
fi

# Get the GitHub repository URL
echo ""
echo "📋 Please enter your GitHub repository URL"
echo "   Example: https://github.com/yourusername/your-repo.git"
read -p "Repository URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ Repository URL cannot be empty"
    exit 1
fi

# Initialize git if not already initialized
if [ ! -d .git ]; then
    echo "🔧 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already initialized"
fi

# Add all files
echo "📦 Adding files to git..."
git add .

# Check if there are files to commit
if git diff --cached --quiet; then
    echo "⚠️  No changes to commit"
else
    echo "📝 Creating initial commit..."
    git commit -m "Initial commit: File Search Application

- Full-stack file search application with web UI
- React frontend with Material-UI
- FastAPI Python backend with async file processing
- PostgreSQL database for search history
- Docker Compose setup
- Real-time search with WebSocket
- ZIP file support
- Search completion modal
- Local path selection"
    
    echo "✅ Initial commit created"
fi

# Add remote origin if it doesn't exist
if git remote | grep -q "origin"; then
    echo "🔗 Remote 'origin' already exists"
    echo "   Current URL: $(git remote get-url origin)"
    read -p "Do you want to update it? (y/N): " UPDATE_REMOTE
    if [[ $UPDATE_REMOTE =~ ^[Yy]$ ]]; then
        git remote set-url origin "$REPO_URL"
        echo "✅ Remote URL updated"
    fi
else
    echo "🔗 Adding remote origin..."
    git remote add origin "$REPO_URL"
    echo "✅ Remote origin added"
fi

# Get the default branch name
echo ""
read -p "Enter branch name (default: main): " BRANCH_NAME
BRANCH_NAME=${BRANCH_NAME:-main}

# Rename branch if needed
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$BRANCH_NAME" ]; then
    git branch -M "$BRANCH_NAME"
    echo "✅ Branch renamed to $BRANCH_NAME"
fi

# Push to GitHub
echo ""
echo "🚀 Pushing to GitHub..."
read -p "Push to GitHub now? (Y/n): " PUSH_NOW
if [[ ! $PUSH_NOW =~ ^[Nn]$ ]]; then
    git push -u origin "$BRANCH_NAME"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Successfully pushed to GitHub!"
        echo ""
        echo "🔗 Your repository: $REPO_URL"
        echo ""
        echo "📚 Useful commands:"
        echo "   git status          - Check repository status"
        echo "   git add .           - Stage all changes"
        echo "   git commit -m '...' - Commit changes"
        echo "   git push            - Push to GitHub"
        echo "   git pull            - Pull from GitHub"
    else
        echo ""
        echo "❌ Push failed. Common issues:"
        echo "   1. Check your GitHub credentials"
        echo "   2. Make sure the repository exists on GitHub"
        echo "   3. Verify you have push access to the repository"
        echo ""
        echo "You can try pushing manually:"
        echo "   git push -u origin $BRANCH_NAME"
    fi
else
    echo ""
    echo "✅ Repository configured but not pushed"
    echo ""
    echo "To push later, run:"
    echo "   git push -u origin $BRANCH_NAME"
fi

echo ""
echo "✅ Done!"