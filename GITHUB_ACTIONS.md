# GitHub Actions CI/CD Guide

Complete documentation for the automated workflows in this repository.

## 📋 Overview

This repository uses GitHub Actions for continuous integration and deployment. Every pull request triggers automated checks for code quality, security, and provides deployment guidance.

## 🔄 Workflows

### 1. CI/CD Pipeline (`ci.yml`)

**Triggers:** Pull requests and pushes to main/develop branches

**Jobs:**
- ✅ **Backend Python Checks**
  - Black code formatting
  - Flake8 linting
  - Pylint code quality
  - Bandit security scanning
  - Safety dependency vulnerability check
  - MyPy type checking

- ✅ **Frontend JavaScript Checks**
  - ESLint linting
  - Prettier formatting
  - npm audit security check
  - Production build test

- ✅ **Docker Build Test**
  - Backend image build
  - Frontend image build
  - docker-compose validation

- ✅ **Quality Summary**
  - Automated PR comment with results
  - Deployment guide with platform recommendations
  - Security checklist
  - Performance tips

### 2. Security Scanning (`security.yml`)

**Triggers:** Pull requests, pushes, and weekly schedule

**Jobs:**
- 🔒 **CodeQL Analysis**
  - Static code analysis for JavaScript and Python
  - Identifies security vulnerabilities
  - Results appear in Security tab

- 🔒 **Trivy Container Scanning**
  - Scans Docker images for vulnerabilities
  - Checks base images and dependencies
  - Critical and high severity focus

- 🔒 **OWASP Dependency Check**
  - Identifies known vulnerabilities in dependencies
  - Generates HTML reports

- 🔒 **Secret Scanning**
  - TruffleHog scans for accidentally committed secrets
  - Checks for API keys, passwords, tokens

- 🔒 **License Compliance**
  - Verifies dependency licenses
  - Generates license reports

- 🔒 **Security Summary**
  - Automated PR comment with security findings
  - Security checklist
  - Best practices reminders

### 3. Code Quality (`quality.yml`)

**Triggers:** Pull requests only

**Jobs:**
- 📊 **SonarCloud Analysis** (requires setup)
  - Comprehensive code quality analysis
  - Code smells detection
  - Technical debt assessment

- 📊 **Code Coverage**
  - Python test coverage with pytest
  - JavaScript test coverage with Jest
  - Uploads to Codecov

- 📊 **Complexity Analysis**
  - Cyclomatic complexity for Python (radon)
  - Maintainability index
  - JavaScript complexity report

- 📊 **Documentation Check**
  - Python docstring coverage
  - README completeness
  - Documentation file checks

- 📊 **Performance Analysis**
  - Frontend bundle size analysis
  - Docker image size report

- 📊 **Quality Summary**
  - Automated PR comment with quality metrics
  - Improvement suggestions
  - Coverage reports

## 🚀 Setting Up Workflows

### Required Secrets

Add these secrets in **Settings → Secrets and variables → Actions**:

#### Optional (for enhanced features):
- `SONAR_TOKEN` - For SonarCloud analysis
  - Sign up at https://sonarcloud.io
  - Create new project
  - Copy token and add to secrets

- `CODECOV_TOKEN` - For code coverage reports
  - Sign up at https://codecov.io
  - Link repository
  - Copy token and add to secrets

#### For Deployment (covered in deployment workflows):
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AZURE_CREDENTIALS`
- `GCP_SA_KEY`
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`

### Enabling Security Tab

1. Go to **Settings → Code security and analysis**
2. Enable:
   - Dependency graph
   - Dependabot alerts
   - Dependabot security updates
   - Code scanning (CodeQL)
   - Secret scanning

## 📝 Pull Request Workflow

When you create a pull request:

1. **Automated Checks Start**
   - CI/CD pipeline runs (~5-10 minutes)
   - Security scans execute (~3-5 minutes)
   - Code quality analysis runs (~5-7 minutes)

2. **Automated Comments Added**
   - CI/CD results with deployment guide
   - Security findings and checklist
   - Code quality metrics and suggestions

3. **Status Checks**
   - All checks must pass (or be reviewed)
   - Review automated feedback
   - Address any critical issues

4. **Merge**
   - Once approved and checks pass
   - Automated workflows complete
   - Code is merged to main branch

## 🔧 Customizing Workflows

### Adding New Checks

Edit workflow files in `.github/workflows/`:

```yaml
# Example: Add a new job to ci.yml
new-check:
  name: My Custom Check
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Run custom check
      run: |
        echo "Running custom check"
        # Your commands here
```

### Adjusting Triggers

```yaml
# Run on specific branches only
on:
  pull_request:
    branches: [main, staging, production]

# Run on schedule
on:
  schedule:
    - cron: '0 0 * * 1'  # Every Monday

# Run on specific paths
on:
  push:
    paths:
      - 'backend/**'
      - 'frontend/**'
```

### Conditional Jobs

```yaml
# Run only for certain labels
if: contains(github.event.pull_request.labels.*.name, 'deploy')

# Run only on main branch
if: github.ref == 'refs/heads/main'

# Run only for external contributors
if: github.event.pull_request.head.repo.fork == true
```

## 📊 Understanding Check Results

### ✅ All Checks Passed
- Code meets quality standards
- No security vulnerabilities found
- Tests passing
- Ready for review/merge

### ⚠️ Some Checks Failed
- Review the failed job logs
- Fix issues identified
- Push new commits to re-trigger

### 🔴 Critical Failure
- Build failed
- Security vulnerability detected
- Tests failing
- Must be fixed before merge

## 🔍 Troubleshooting

### Common Issues:

1. **Workflow doesn't trigger**
   - Check workflow file syntax
   - Verify trigger conditions
   - Check branch name matches

2. **Checks take too long**
   - Consider splitting into parallel jobs
   - Use caching for dependencies
   - Optimize test suites

3. **False positives in security scans**
   - Review and dismiss in Security tab
   - Add to suppression list if appropriate
   - Update dependencies if possible

4. **SonarCloud/Codecov not working**
   - Verify tokens are set correctly
   - Check organization settings
   - Review workflow logs

### Debug Mode

Enable debug logging:
1. Go to **Settings → Secrets**
2. Add `ACTIONS_STEP_DEBUG` = `true`
3. Add `ACTIONS_RUNNER_DEBUG` = `true`

## 📈 Best Practices

### 1. Keep Workflows Fast
- Use caching for dependencies
- Run tests in parallel
- Fail fast on critical errors

### 2. Meaningful Job Names
- Use descriptive names
- Group related checks
- Make failures easy to identify

### 3. Secure Secrets
- Never expose secrets in logs
- Use environment-specific secrets
- Rotate credentials regularly

### 4. Monitor Workflow Usage
- Check Actions usage limits
- Optimize long-running jobs
- Consider self-hosted runners for heavy use

### 5. Keep Workflows Maintained
- Update actions versions regularly
- Remove unused workflows
- Document custom workflows

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Billing](https://docs.github.com/en/billing/managing-billing-for-github-actions)

## 🎯 Quick Commands

```bash
# Validate workflow files locally
act -l  # List workflows
act -n  # Dry run

# View workflow runs
gh run list
gh run view <run-id>
gh run watch

# Re-run failed jobs
gh run rerun <run-id> --failed

# Download artifacts
gh run download <run-id>
```

## 💡 Tips

1. **Use `continue-on-error: true`** for non-critical checks
2. **Add timeouts** to prevent stuck workflows: `timeout-minutes: 30`
3. **Use matrix builds** for testing multiple versions
4. **Cache dependencies** to speed up builds
5. **Use artifacts** to share data between jobs
6. **Add status badges** to README

### Status Badge Example

```markdown
![CI](https://github.com/username/repo/workflows/CI/badge.svg)
![Security](https://github.com/username/repo/workflows/Security/badge.svg)
```

---

**Questions?** Check the [GitHub Community Forum](https://github.community/) or open an issue!