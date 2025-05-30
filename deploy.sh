#!/bin/bash

# Netlify deployment script for Dungeon 2D
# This script ensures a clean build and deployment

echo "🎮 Building Dungeon 2D for deployment..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build for production
echo "🏗️  Building for production..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📁 Build artifacts are in the 'dist' directory"

# Optional: Deploy to Netlify if CLI is available and configured
if command -v netlify &> /dev/null; then
    echo "🚀 Netlify CLI found. You can now deploy with:"
    echo "   netlify deploy --prod --dir=dist"
else
    echo "💡 Install Netlify CLI to deploy directly:"
    echo "   npm install -g netlify-cli"
    echo "   netlify login"
    echo "   netlify deploy --prod --dir=dist"
fi
