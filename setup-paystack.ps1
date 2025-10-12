# Paystack Integration Setup Script (PowerShell)
# This script helps you configure Paystack for your OMU Fusion e-commerce platform

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Paystack Integration Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Error: .env.local file not found!" -ForegroundColor Red
    Write-Host "Please create .env.local file first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found .env.local file" -ForegroundColor Green
Write-Host ""

# Prompt for Paystack public key
Write-Host "📝 Please enter your Paystack Public Key" -ForegroundColor Yellow
Write-Host "   (You can find this at: https://dashboard.paystack.com/#/settings/developer)" -ForegroundColor Gray
Write-Host ""
$PUBLIC_KEY = Read-Host "Paystack Public Key (pk_test_... or pk_live_...)"

if ([string]::IsNullOrWhiteSpace($PUBLIC_KEY)) {
    Write-Host "❌ Error: Public key cannot be empty!" -ForegroundColor Red
    exit 1
}

# Validate key format
if ($PUBLIC_KEY -notmatch "^pk_(test|live)_") {
    Write-Host "⚠️  Warning: Key format looks unusual. Are you sure this is correct?" -ForegroundColor Yellow
    $CONTINUE = Read-Host "Continue anyway? (y/n)"
    if ($CONTINUE -ne "y") {
        exit 1
    }
}

# Update .env.local
$envContent = Get-Content ".env.local" -Raw
if ($envContent -match "VITE_PAYSTACK_PUBLIC_KEY=") {
    # Replace existing key
    $envContent = $envContent -replace "VITE_PAYSTACK_PUBLIC_KEY=.*", "VITE_PAYSTACK_PUBLIC_KEY=$PUBLIC_KEY"
    Set-Content ".env.local" -Value $envContent
    Write-Host "✅ Updated existing Paystack public key" -ForegroundColor Green
} else {
    # Add new key
    Add-Content ".env.local" -Value "`n# Paystack Integration"
    Add-Content ".env.local" -Value "VITE_PAYSTACK_PUBLIC_KEY=$PUBLIC_KEY"
    Write-Host "✅ Added Paystack public key to .env.local" -ForegroundColor Green
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your development server: npm run dev"
Write-Host "2. Visit the checkout page and select 'Paystack' as payment method"
Write-Host "3. Test with Paystack test cards:"
Write-Host "   Card: 5531 8866 5214 2950"
Write-Host "   CVV: 564"
Write-Host "   PIN: 3310"
Write-Host "   OTP: 123456"
Write-Host ""
Write-Host "📚 Read PAYSTACK_INTEGRATION.md for more details" -ForegroundColor Cyan
Write-Host "🔗 Paystack Dashboard: https://dashboard.paystack.com/" -ForegroundColor Cyan
Write-Host ""
