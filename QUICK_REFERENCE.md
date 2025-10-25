# 🚀 GitHub Actions Quick Reference

## 📊 Workflows Overview

| Workflow | Runs On | Duration | Purpose |
|----------|---------|----------|---------|
| **CI/CD Pipeline** | PR, Push | 5-10 min | Code quality, linting, build tests |
| **Security Scanning** | PR, Push, Weekly | 3-5 min | Vulnerability detection, secret scanning |
| **Code Quality** | PR only | 5-7 min | Coverage, complexity, documentation |

## ✅ What Gets Checked

### Backend (Python)
```
✓ Black (formatting)
✓ Flake8 (linting)
✓ Pylint (code quality)
✓ Bandit (security)
✓ Safety (vulnerabilities)
✓ MyPy (type checking)
```

### Frontend (JavaScript)
```
✓ ESLint (linting)
✓ Prettier (formatting)
✓ npm audit (security)
✓ Build test
✓ Bundle size
```

### Security
```
✓ CodeQL (static analysis)
✓ Trivy (containers)
✓ OWASP (dependencies)
✓ TruffleHog (secrets)
✓ License compliance
```

## 🎯 Quick Commands

### View Workflow Status
```bash
gh run list
gh run view <run-id>
gh run watch
```

### Re-run Failed Jobs
```bash
gh run rerun <run-id> --failed
```

### Download Artifacts
```bash
gh run download <run-id>
```

### Create PR with Workflows
```bash
git checkout -b feature/my-feature
git add .
git commit -m "Add feature"
git push origin feature/my-feature
gh pr create
```

## 💬 Automated Comments

### CI/CD Comment Includes:
- ✅ Check results summary
- 🚀 Deployment guide (AWS, Azure, GCP, K8s, DO)
- 🔒 Security checklist
- 📊 Performance tips

### Security Comment Includes:
- 🔒 Vulnerability scan results
- ✅ Security best practices
- ⚠️ Critical findings
- 📋 Compliance status

### Quality Comment Includes:
- 📊 Code coverage metrics
- 🎯 Complexity analysis
- 📈 Improvement suggestions
- 🔍 Documentation status

## 🔧 Common Tasks

### Enable Debug Logging
Settings → Secrets → Add:
```
ACTIONS_STEP_DEBUG = true
ACTIONS_RUNNER_DEBUG = true
```

### Skip CI for a Commit
```bash
git commit -m "docs: update README [skip ci]"
```

### Test Workflows Locally
```bash
# Install act
brew install act

# List workflows
act -l

# Run workflow
act pull_request
```

## 📈 Status Badges

Add to README.md:
```markdown
![CI](https://github.com/vndr/file-search-app/workflows/CI/CD%20Pipeline/badge.svg)
![Security](https://github.com/vndr/file-search-app/workflows/Security%20Scanning/badge.svg)
![Quality](https://github.com/vndr/file-search-app/workflows/Code%20Quality/badge.svg)
```

## 🛡️ Security Checklist

Before Merging PR:
- [ ] No secrets in code
- [ ] Dependencies updated
- [ ] Security scans passed
- [ ] Tests passing
- [ ] Code reviewed

## 🎓 Best Practices

1. ✅ Read automated feedback
2. ✅ Fix critical issues first
3. ✅ Use PR template
4. ✅ Write descriptive commits
5. ✅ Keep branches updated
6. ✅ Review security findings
7. ✅ Monitor workflow usage

## 📚 Documentation

- [GITHUB_ACTIONS.md](GITHUB_ACTIONS.md) - Full documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guides
- [GIT_GUIDE.md](GIT_GUIDE.md) - Git workflows

## 🆘 Quick Fixes

### Workflow Failed?
1. Click on failed job
2. Read error logs
3. Fix the issue
4. Push new commit

### Slow Workflows?
- Use caching
- Run tests in parallel
- Optimize dependencies

### False Positive?
- Review in Security tab
- Dismiss with reason
- Add to suppression list

---

**Need help?** Check [GITHUB_ACTIONS.md](GITHUB_ACTIONS.md) or open an issue!