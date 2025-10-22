# ==============================================================================
# Security Audit Script for OMU FUSION
# ==============================================================================
# Developer: Prince Yekunya
# Website: https://swift1dev.netlify.app
# 
# This script checks for common security issues before deployment
# ==============================================================================

Write-Host "🔒 OMU FUSION - Security Audit" -ForegroundColor Cyan
Write-Host "Developer: Prince Yekunya | https://swift1dev.netlify.app" -ForegroundColor Gray
Write-Host "=" * 80 -ForegroundColor Gray
Write-Host ""

$issuesFound = 0

# ==============================================================================
# Check 1: Environment Files
# ==============================================================================
Write-Host "📋 Checking Environment Files..." -ForegroundColor Yellow

if (Test-Path ".env") {
    Write-Host "  ❌ WARNING: .env file found in project root" -ForegroundColor Red
    Write-Host "     This file should NOT be committed to Git" -ForegroundColor Red
    $issuesFound++
} else {
    Write-Host "  ✓ No .env file in root (good)" -ForegroundColor Green
}

if (Test-Path ".env.example") {
    Write-Host "  ✓ .env.example found (good)" -ForegroundColor Green
} else {
    Write-Host "  ❌ .env.example not found" -ForegroundColor Red
    $issuesFound++
}

Write-Host ""

# ==============================================================================
# Check 2: Git Status
# ==============================================================================
Write-Host "📂 Checking Git Status..." -ForegroundColor Yellow

$gitStatus = git status --porcelain 2>$null
if ($gitStatus -match "\.env$") {
    Write-Host "  ❌ CRITICAL: .env file is staged or tracked by Git!" -ForegroundColor Red
    Write-Host "     Run: git rm --cached .env" -ForegroundColor Red
    $issuesFound++
} else {
    Write-Host "  ✓ No .env files tracked by Git" -ForegroundColor Green
}

Write-Host ""

# ==============================================================================
# Check 3: Search for Hardcoded Secrets
# ==============================================================================
Write-Host "🔍 Searching for Potential Hardcoded Secrets..." -ForegroundColor Yellow

$secretPatterns = @(
    "AIzaSy[A-Za-z0-9_-]{33}",  # Firebase API Key pattern
    "sk_live_[A-Za-z0-9]{24,}",  # Paystack Live Secret Key
    "pk_live_[A-Za-z0-9]{24,}",  # Paystack Live Public Key
    "password\s*=\s*['\"](?!.*test).*['\"]",  # Hardcoded passwords
    "secret\s*=\s*['\"].*['\"]",  # Hardcoded secrets
    "api[_-]?key\s*=\s*['\"].*['\"]"  # Hardcoded API keys
)

foreach ($pattern in $secretPatterns) {
    $found = Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx","*.js","*.jsx" | 
             Select-String -Pattern $pattern -CaseSensitive | 
             Select-Object -First 3
    
    if ($found) {
        Write-Host "  ❌ Potential secret found matching pattern: $pattern" -ForegroundColor Red
        foreach ($match in $found) {
            Write-Host "     File: $($match.Path)" -ForegroundColor Red
            Write-Host "     Line $($match.LineNumber): $($match.Line.Trim())" -ForegroundColor Red
        }
        $issuesFound++
    }
}

if ($issuesFound -eq 0) {
    Write-Host "  ✓ No hardcoded secrets detected" -ForegroundColor Green
}

Write-Host ""

# ==============================================================================
# Check 4: Console Logs in Source
# ==============================================================================
Write-Host "📝 Checking for Console Logs..." -ForegroundColor Yellow

$consoleLogs = Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx","*.js","*.jsx" | 
               Select-String -Pattern "console\.(log|info|debug|warn)" | 
               Measure-Object

if ($consoleLogs.Count -gt 0) {
    Write-Host "  ⚠️  Found $($consoleLogs.Count) console statements" -ForegroundColor Yellow
    Write-Host "     These will be removed in production build" -ForegroundColor Yellow
} else {
    Write-Host "  ✓ No console logs found" -ForegroundColor Green
}

Write-Host ""

# ==============================================================================
# Check 5: TODO and FIXME Comments
# ==============================================================================
Write-Host "📌 Checking for TODO/FIXME Comments..." -ForegroundColor Yellow

$todos = Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx","*.js","*.jsx" | 
         Select-String -Pattern "TODO|FIXME" | 
         Measure-Object

if ($todos.Count -gt 0) {
    Write-Host "  ⚠️  Found $($todos.Count) TODO/FIXME comments" -ForegroundColor Yellow
    Write-Host "     Review these before deployment" -ForegroundColor Yellow
} else {
    Write-Host "  ✓ No pending TODOs" -ForegroundColor Green
}

Write-Host ""

# ==============================================================================
# Check 6: Firebase Rules Files
# ==============================================================================
Write-Host "🔥 Checking Firebase Rules..." -ForegroundColor Yellow

if (Test-Path "firestore.rules") {
    Write-Host "  ✓ firestore.rules found" -ForegroundColor Green
} else {
    Write-Host "  ❌ firestore.rules not found" -ForegroundColor Red
    $issuesFound++
}

if (Test-Path "storage.rules") {
    Write-Host "  ✓ storage.rules found" -ForegroundColor Green
} else {
    Write-Host "  ❌ storage.rules not found" -ForegroundColor Red
    $issuesFound++
}

Write-Host ""

# ==============================================================================
# Check 7: Build Configuration
# ==============================================================================
Write-Host "⚙️  Checking Build Configuration..." -ForegroundColor Yellow

if (Test-Path "vite.config.ts") {
    $viteConfig = Get-Content "vite.config.ts" -Raw
    
    if ($viteConfig -match "sourcemap:\s*(false|!isProduction)") {
        Write-Host "  ✓ Source maps disabled for production" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Source maps may be enabled in production" -ForegroundColor Yellow
    }
    
    if ($viteConfig -match "drop.*console") {
        Write-Host "  ✓ Console logs will be removed in production" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Console logs may not be removed" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ❌ vite.config.ts not found" -ForegroundColor Red
    $issuesFound++
}

Write-Host ""

# ==============================================================================
# Check 8: Security Headers
# ==============================================================================
Write-Host "🛡️  Checking Security Headers Configuration..." -ForegroundColor Yellow

if (Test-Path "netlify.toml") {
    $netlifyConfig = Get-Content "netlify.toml" -Raw
    
    $requiredHeaders = @(
        "Content-Security-Policy",
        "X-Frame-Options",
        "Strict-Transport-Security",
        "X-Content-Type-Options"
    )
    
    foreach ($header in $requiredHeaders) {
        if ($netlifyConfig -match $header) {
            Write-Host "  ✓ $header configured" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $header not found" -ForegroundColor Red
            $issuesFound++
        }
    }
} else {
    Write-Host "  ❌ netlify.toml not found" -ForegroundColor Red
    $issuesFound++
}

Write-Host ""

# ==============================================================================
# Check 9: Dependencies Security
# ==============================================================================
Write-Host "📦 Checking Dependencies..." -ForegroundColor Yellow

if (Test-Path "package.json") {
    Write-Host "  ℹ️  Running npm audit..." -ForegroundColor Cyan
    $auditResult = npm audit --production 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ No known vulnerabilities found" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Vulnerabilities detected - run 'npm audit fix'" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ❌ package.json not found" -ForegroundColor Red
    $issuesFound++
}

Write-Host ""

# ==============================================================================
# Check 10: Developer Attribution
# ==============================================================================
Write-Host "👨‍💻 Checking Developer Attribution..." -ForegroundColor Yellow

$footerFile = "src\components\layout\Footer.tsx"
if (Test-Path $footerFile) {
    $footerContent = Get-Content $footerFile -Raw
    if ($footerContent -match "Prince Yekunya" -and $footerContent -match "swift1dev\.netlify\.app") {
        Write-Host "  ✓ Developer attribution present in footer" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Developer attribution missing or incomplete" -ForegroundColor Red
        $issuesFound++
    }
} else {
    Write-Host "  ⚠️  Footer component not found" -ForegroundColor Yellow
}

if (Test-Path "index.html") {
    $indexContent = Get-Content "index.html" -Raw
    if ($indexContent -match "Prince Yekunya") {
        Write-Host "  ✓ Developer attribution in HTML" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Developer attribution missing from HTML" -ForegroundColor Red
        $issuesFound++
    }
}

Write-Host ""

# ==============================================================================
# Summary
# ==============================================================================
Write-Host "=" * 80 -ForegroundColor Gray
Write-Host ""

if ($issuesFound -eq 0) {
    Write-Host "✅ Security Audit Passed! No critical issues found." -ForegroundColor Green
    Write-Host ""
    Write-Host "   Ready for deployment ✨" -ForegroundColor Green
} else {
    Write-Host "❌ Security Audit Failed! Found $issuesFound issue(s)." -ForegroundColor Red
    Write-Host ""
    Write-Host "   Please fix the issues above before deploying." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📚 Review SECURITY.md and DEPLOYMENT_CHECKLIST.md for detailed guidance" -ForegroundColor Cyan
Write-Host ""
Write-Host "Developer: Prince Yekunya | https://swift1dev.netlify.app" -ForegroundColor Gray
Write-Host "=" * 80 -ForegroundColor Gray

# Return exit code based on issues
exit $issuesFound
