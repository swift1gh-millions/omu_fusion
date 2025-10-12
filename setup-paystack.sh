#!/bin/bash

# Paystack Integration Setup Script
# This script helps you configure Paystack for your OMU Fusion e-commerce platform

echo "=================================="
echo "Paystack Integration Setup"
echo "=================================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local file first."
    exit 1
fi

echo "✅ Found .env.local file"
echo ""

# Prompt for Paystack public key
echo "📝 Please enter your Paystack Public Key"
echo "   (You can find this at: https://dashboard.paystack.com/#/settings/developer)"
echo ""
read -p "Paystack Public Key (pk_test_... or pk_live_...): " PUBLIC_KEY

if [ -z "$PUBLIC_KEY" ]; then
    echo "❌ Error: Public key cannot be empty!"
    exit 1
fi

# Validate key format
if [[ ! "$PUBLIC_KEY" =~ ^pk_(test|live)_ ]]; then
    echo "⚠️  Warning: Key format looks unusual. Are you sure this is correct?"
    read -p "Continue anyway? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        exit 1
    fi
fi

# Update .env.local
if grep -q "VITE_PAYSTACK_PUBLIC_KEY=" .env.local; then
    # Replace existing key
    sed -i "s|VITE_PAYSTACK_PUBLIC_KEY=.*|VITE_PAYSTACK_PUBLIC_KEY=$PUBLIC_KEY|" .env.local
    echo "✅ Updated existing Paystack public key"
else
    # Add new key
    echo "" >> .env.local
    echo "# Paystack Integration" >> .env.local
    echo "VITE_PAYSTACK_PUBLIC_KEY=$PUBLIC_KEY" >> .env.local
    echo "✅ Added Paystack public key to .env.local"
fi

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Restart your development server: npm run dev"
echo "2. Visit the checkout page and select 'Paystack' as payment method"
echo "3. Test with Paystack test cards:"
echo "   Card: 5531 8866 5214 2950"
echo "   CVV: 564"
echo "   PIN: 3310"
echo "   OTP: 123456"
echo ""
echo "📚 Read PAYSTACK_INTEGRATION.md for more details"
echo "🔗 Paystack Dashboard: https://dashboard.paystack.com/"
echo ""
