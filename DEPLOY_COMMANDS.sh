#!/bin/bash

# AI Proxy Setup - Deploy Commands
# Run these commands to deploy AI proxy to Cloudflare

echo "=========================================="
echo "AI Proxy Setup - Deploy Commands"
echo "=========================================="
echo ""

# Step 1: Stage all changes
echo "Step 1: Staging all changes..."
git add .
echo "✅ Changes staged"
echo ""

# Step 2: Commit
echo "Step 2: Committing changes..."
git commit -m "Setup Cloudflare Pages Functions for AI proxy

- Add generateContent.ts function
- Add generateContentStream.ts function
- Update aiService.ts to use proxy
- Add documentation for setup and deployment"
echo "✅ Changes committed"
echo ""

# Step 3: Push
echo "Step 3: Pushing to GitHub..."
git push origin main
echo "✅ Changes pushed"
echo ""

echo "=========================================="
echo "✅ DEPLOYMENT STARTED!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Wait 2-5 minutes for Cloudflare to deploy"
echo "2. Go to your Cloudflare Pages dashboard"
echo "3. Check deployment status"
echo "4. Add GEMINI_API_KEY to Environment Variables:"
echo "   - Name: GEMINI_API_KEY"
echo "   - Value: <your_api_key>"
echo "5. Visit your production URL"
echo "6. Check console for: '🔐 Using Cloudflare Pages Functions proxy for AI'"
echo ""
echo "For more details, see QUICK_START.md"
echo "=========================================="

