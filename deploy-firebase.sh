#!/bin/bash

# Firebase Deployment Script for E-Commerce Application
# This script automates the deployment process to Firebase

set -e  # Exit on error

echo "🚀 Starting Firebase Deployment Process..."
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI is not installed${NC}"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

echo -e "${GREEN}✅ Firebase CLI found${NC}"

# Check if logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Firebase${NC}"
    echo "Logging in..."
    firebase login
fi

echo -e "${GREEN}✅ Firebase authentication verified${NC}"

# Check if Firebase project is configured
if ! grep -q '"default"' .firebaserc 2>/dev/null; then
    echo -e "${YELLOW}⚠️  No Firebase project configured${NC}"
    echo "Please select your Firebase project:"
    firebase use --add
fi

echo -e "${GREEN}✅ Firebase project configured${NC}"
echo ""

# Build Frontend
echo "📦 Building frontend..."
cd frontend

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found in frontend${NC}"
    echo "Please create frontend/.env with:"
    echo "  VITE_API_URL=https://your-project.web.app/api"
    echo "  VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key"
    read -p "Press Enter after creating the file..."
fi

npm install
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Frontend build failed - dist folder not created${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend built successfully${NC}"
cd ..

# Check backend environment
echo ""
echo "🔧 Checking backend configuration..."
cd backend

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found in backend${NC}"
    echo "This is okay for Firebase Functions (use firebase functions:config:set)"
fi

# Install backend dependencies
npm install
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
cd ..

# Deploy to Firebase
echo ""
echo "🚀 Deploying to Firebase..."
echo "This will deploy:"
echo "  - Frontend to Firebase Hosting"
echo "  - Backend to Cloud Functions"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

firebase deploy

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Set environment variables for Cloud Functions:"
echo "   firebase functions:config:set \\"
echo "     mongodb.uri=\"your-mongodb-uri\" \\"
echo "     jwt.secret=\"your-jwt-secret\" \\"
echo "     cloudinary.cloud_name=\"your-cloud-name\" \\"
echo "     cloudinary.api_key=\"your-api-key\" \\"
echo "     cloudinary.api_secret=\"your-api-secret\" \\"
echo "     stripe.secret_key=\"your-stripe-secret\""
echo ""
echo "2. Redeploy functions after setting config:"
echo "   firebase deploy --only functions"
echo ""
echo "3. Test your deployment:"
echo "   firebase open hosting:site"
echo ""
echo "4. View logs:"
echo "   firebase functions:log"
