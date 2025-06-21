# BuildCraftPro Images Directory

This directory contains all static images for the BuildCraftPro application.

## Directory Structure

```
images/
├── logos/          # Brand logos and wordmarks
│   ├── logo.svg    # Primary logo (SVG format recommended)
│   ├── logo.png    # Primary logo (PNG fallback)
│   ├── logo-dark.svg   # Dark theme variant
│   ├── logo-light.svg  # Light theme variant
│   └── wordmark.svg    # Text-only logo variant
├── icons/          # Icons and favicons
│   ├── favicon.ico     # Browser favicon (16x16, 32x32, 48x48)
│   ├── apple-touch-icon.png  # iOS home screen icon (180x180)
│   ├── icon-192.png    # PWA icon (192x192)
│   └── icon-512.png    # PWA icon (512x512)
└── README.md       # This file
```

## Converting PNG Images

If you have PNG logo files, here's how to convert them to the formats needed:

### PNG → ICO (Favicon)

**Easiest Method: Online Tools**
1. **[favicon.io](https://favicon.io/favicon-converter/)**
   - Upload your PNG logo
   - Automatically generates all favicon sizes
   - Download and extract to `icons/` folder

2. **[RealFaviconGenerator](https://realfavicongenerator.net/)**
   - More comprehensive platform support
   - Generates HTML code too

**Command Line Method:**
```bash
# Install ImageMagick first
sudo apt install imagemagick  # Ubuntu/WSL
brew install imagemagick      # macOS

# Use the provided script
./scripts/convert-images.sh your-logo.png
```

### PNG → SVG (Logo)

**Important:** PNG files are raster images (pixels), while SVG files are vector graphics (mathematical shapes). You have several options:

**Option 1: Use PNG directly (Simplest)**
- Optimize your PNG with [TinyPNG](https://tinypng.com/)
- Place in `logos/` folder
- Use in React: `<img src="/images/logos/logo.png" alt="BuildCraftPro" />`

**Option 2: Auto-trace to Vector SVG (Best)**
- **[Vectorizer.AI](https://vectorizer.ai/)** - AI-powered, excellent results
- **[Vector Magic](https://vectormagic.com/)** - Professional tool
- Upload PNG, download SVG, place in `logos/` folder

**Option 3: Embed PNG in SVG (Hybrid)**
- Creates an SVG wrapper around your PNG
- Scalable but still pixel-based
- See `logo-wrapper.svg` example in this directory

## File Specifications

### Logos
- **Primary Logo**: Should work on both light and dark backgrounds
- **Format**: SVG preferred for scalability, PNG as fallback
- **Usage**: Header, loading screens, marketing materials

### Favicons
- **favicon.ico**: Multi-size ICO file (16x16, 32x32, 48x48 px)
- **apple-touch-icon.png**: 180x180 px PNG for iOS devices
- **PWA Icons**: 192x192 and 512x512 px for Progressive Web App

## Usage in Code

### Logo in React Components
```tsx
// SVG logo (preferred)
import logo from '/images/logos/logo.svg'
<img src={logo} alt="BuildCraftPro" className="h-8" />

// PNG logo (fallback)
<img src="/images/logos/logo.png" alt="BuildCraftPro" className="h-8" />
```

### Favicon (already configured in index.html)
```html
<link rel="icon" type="image/x-icon" href="/images/icons/favicon.ico" />
<link rel="apple-touch-icon" href="/images/icons/apple-touch-icon.png" />
```

## Quick Setup with PNG Files

If you have PNG files and want to get started quickly:

1. **For Favicon**: Use [favicon.io](https://favicon.io/favicon-converter/)
2. **For Logo**: Either:
   - Use PNG directly (optimize with TinyPNG first)
   - Convert to SVG with [Vectorizer.AI](https://vectorizer.ai/) for best quality
3. **Automated Script**: Run `./scripts/convert-images.sh your-logo.png`

## Adding Your Files

1. **Logo Files**: Place your logo files in the `logos/` directory
2. **Favicon**: Place your favicon.ico in the `icons/` directory
3. **Mobile Icons**: Add apple-touch-icon.png and PWA icons to `icons/`

## Recommended Tools

- **Favicon Generation**: [favicon.io](https://favicon.io/) or [realfavicongenerator.net](https://realfavicongenerator.net/)
- **PNG to SVG**: [Vectorizer.AI](https://vectorizer.ai/) or [Vector Magic](https://vectormagic.com/)
- **Image Optimization**: [TinyPNG](https://tinypng.com/) for PNG compression
- **SVG Optimization**: [SVGOMG](https://jakearchibald.github.io/svgomg/) for SVG compression

## Notes

- All files in the `public/` directory are served statically by Vite
- Images can be referenced with absolute paths starting with `/images/`
- SVG files are preferred for logos due to scalability
- Consider providing both light and dark variants for better theme support
- PNG files work perfectly fine if SVG conversion is not needed 