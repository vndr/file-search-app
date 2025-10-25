#!/bin/bash

# Quick Git Push Script
# Use this after making changes to quickly commit and push

echo "🚀 Quick Git Push"
echo "================"

# Check for changes
if git diff --quiet && git diff --cached --quiet; then
    echo "✅ No changes to commit"
    exit 0
fi

# Show status
echo "📋 Current changes:"
git status --short

# Prompt for commit message
echo ""
read -p "Enter commit message: " COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
    echo "❌ Commit message cannot be empty"
    exit 1
fi

# Add, commit and push
echo ""
echo "📦 Staging changes..."
git add .

echo "📝 Committing..."
git commit -m "$COMMIT_MSG"

echo "🚀 Pushing to GitHub..."
git push

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
else
    echo "❌ Push failed. Check the error message above."
    exit 1
fi