#!/bin/bash

# BuildCraftPro Image Conversion Script
# This script helps convert PNG logos to different formats needed for the app

echo "🎨 BuildCraftPro Image Conversion Helper"
echo "========================================"

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Please install it first:"
    echo "   Ubuntu/WSL: sudo apt install imagemagick"
    echo "   macOS: brew install imagemagick"
    echo "   Windows: choco install imagemagick"
    exit 1
fi

# Get the PNG file from user
if [ -z "$1" ]; then
    echo "Usage: $0 <your-logo.png>"
    echo "Example: $0 my-logo.png"
    exit 1
fi

PNG_FILE="$1"
if [ ! -f "$PNG_FILE" ]; then
    echo "❌ File not found: $PNG_FILE"
    exit 1
fi

echo "📁 Processing: $PNG_FILE"

# Create output directories
mkdir -p frontend/public/images/logos
mkdir -p frontend/public/images/icons

# Convert to different sizes for favicon
echo "🔄 Creating favicon sizes..."
convert "$PNG_FILE" -resize 16x16 temp_16.png
convert "$PNG_FILE" -resize 32x32 temp_32.png
convert "$PNG_FILE" -resize 48x48 temp_48.png

# Combine into ICO file
convert temp_16.png temp_32.png temp_48.png frontend/public/images/icons/favicon.ico
rm temp_16.png temp_32.png temp_48.png

# Create Apple touch icon
echo "🍎 Creating Apple touch icon..."
convert "$PNG_FILE" -resize 180x180 frontend/public/images/icons/apple-touch-icon.png

# Create PWA icons
echo "📱 Creating PWA icons..."
convert "$PNG_FILE" -resize 192x192 frontend/public/images/icons/icon-192.png
convert "$PNG_FILE" -resize 512x512 frontend/public/images/icons/icon-512.png

# Copy original PNG to logos directory
echo "📋 Copying logo to logos directory..."
cp "$PNG_FILE" frontend/public/images/logos/logo.png

# Create optimized versions
echo "🗜️ Creating optimized versions..."
convert "$PNG_FILE" -resize 200x frontend/public/images/logos/logo-small.png
convert "$PNG_FILE" -resize 400x frontend/public/images/logos/logo-large.png

echo "✅ Conversion complete!"
echo ""
echo "📁 Files created:"
echo "   Icons: frontend/public/images/icons/"
echo "   - favicon.ico"
echo "   - apple-touch-icon.png"
echo "   - icon-192.png"
echo "   - icon-512.png"
echo ""
echo "   Logos: frontend/public/images/logos/"
echo "   - logo.png (original)"
echo "   - logo-small.png (width: 200px)"
echo "   - logo-large.png (width: 400px)"
echo ""
echo "💡 Next steps:"
echo "1. Update Layout.tsx to use your logo"
echo "2. Consider converting to SVG using online tools for better scalability"
echo "3. Test the favicon by running your app" 