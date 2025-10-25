# Git Setup and Usage Guide

## 🚀 Initial Setup (First Time)

### Option 1: Use the Setup Script (Recommended)

```bash
./setup-git.sh
```

The script will:
- Initialize git repository
- Add all files
- Create initial commit
- Add GitHub remote
- Push to GitHub

### Option 2: Manual Setup

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: File Search Application"

# Add your GitHub repository
git remote add origin https://github.com/yourusername/your-repo.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 📝 Making Changes

### Quick Push Script

After making changes, use the quick push script:

```bash
./git-push.sh
```

### Manual Commands

```bash
# Check status
git status

# Stage all changes
git add .

# Or stage specific files
git add filename.js

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push
```

## 🔄 Common Git Commands

### Checking Status

```bash
# View current status
git status

# View changes
git diff

# View commit history
git log

# View short commit history
git log --oneline
```

### Branching

```bash
# Create new branch
git checkout -b feature-branch-name

# Switch branches
git checkout main
git checkout feature-branch-name

# List all branches
git branch

# Delete branch
git branch -d branch-name
```

### Pulling Changes

```bash
# Pull latest changes from GitHub
git pull

# Pull from specific branch
git pull origin main
```

### Undoing Changes

```bash
# Discard changes in working directory
git checkout -- filename

# Unstage files
git reset HEAD filename

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

### Stashing

```bash
# Save changes temporarily
git stash

# List stashes
git stash list

# Apply last stash
git stash apply

# Apply and remove last stash
git stash pop

# Clear all stashes
git stash clear
```

## 🏷️ Tagging Releases

```bash
# Create a tag
git tag -a v1.0.0 -m "Version 1.0.0"

# Push tags to GitHub
git push --tags

# List tags
git tag -l

# Delete tag
git tag -d v1.0.0
git push origin --delete v1.0.0
```

## 🔍 Viewing Information

```bash
# Show remote URLs
git remote -v

# Show branch information
git branch -vv

# Show who changed what
git blame filename

# Show file history
git log -- filename
```

## 🛠️ Configuration

```bash
# Set your name and email
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# View configuration
git config --list

# Set default editor
git config --global core.editor "code"

# Enable color
git config --global color.ui auto
```

## 📦 .gitignore

The `.gitignore` file is already configured to exclude:
- `node_modules/` - Node.js dependencies
- `__pycache__/` - Python cache files
- `.env` files - Environment variables
- Build outputs
- IDE files
- OS files
- Database files
- Log files

To ignore additional files, add them to `.gitignore`.

## 🔐 Authentication

### HTTPS (Recommended)

If you're using HTTPS URLs, you may need to use a Personal Access Token:

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` scope
3. Use the token as your password when pushing

### SSH (Alternative)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your.email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub: Settings → SSH and GPG keys → New SSH key

# Change remote to SSH
git remote set-url origin git@github.com:yourusername/your-repo.git
```

## 📚 Useful Aliases

Add these to your `~/.gitconfig`:

```ini
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = log --graph --oneline --all
    amend = commit --amend
    undo = reset --soft HEAD~1
```

Usage:
```bash
git st      # instead of git status
git co main # instead of git checkout main
git visual  # pretty commit graph
```

## 🚨 Troubleshooting

### Push Failed

```bash
# If push fails due to diverged branches
git pull --rebase origin main
git push
```

### Merge Conflicts

```bash
# View conflicted files
git status

# Edit files to resolve conflicts
# Remove conflict markers (<<<<, ====, >>>>)

# Mark as resolved
git add conflicted-file.js

# Complete merge
git commit
```

### Reset Remote URL

```bash
# View current remote
git remote -v

# Change remote URL
git remote set-url origin https://github.com/newuser/newrepo.git
```

### Large Files

If you accidentally committed large files:

```bash
# Remove from history (use with caution)
git filter-branch --tree-filter 'rm -f large-file.zip' HEAD
git push --force
```

## 📖 Best Practices

1. **Commit Often**: Make small, focused commits
2. **Write Clear Messages**: Describe what and why, not how
3. **Pull Before Push**: Always pull latest changes first
4. **Use Branches**: Create branches for new features
5. **Review Before Commit**: Use `git diff` to check changes
6. **Don't Commit Secrets**: Never commit passwords, API keys, or tokens
7. **Keep .gitignore Updated**: Add patterns for files to ignore

## 🎯 Commit Message Format

Use clear, descriptive commit messages:

```
Add user authentication feature

- Implement login/logout endpoints
- Add JWT token generation
- Create auth middleware
- Update user model with password hashing
```

Or use conventional commits:

```
feat: add user authentication
fix: resolve search path bug
docs: update README with setup instructions
refactor: reorganize component structure
test: add unit tests for search engine
```

## 📞 Getting Help

```bash
# Get help for any command
git help <command>
git <command> --help

# Example
git help commit
git push --help
```

## 🔗 Useful Links

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Oh Shit, Git!?!](https://ohshitgit.com/) - Fix common mistakes

---

**Happy Coding! 🚀**