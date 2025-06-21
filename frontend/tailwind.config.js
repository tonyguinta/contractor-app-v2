/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // BuildCraftPro Brand Colors
        primary: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#b9dcff',
          300: '#7cc3ff',
          400: '#36a7ff',
          500: '#0c8ce9',
          600: '#15446C', // Navy Blueprint - Main brand color
          700: '#103654', // Darker blue for hover states
          800: '#0d2a42',
          900: '#0a1f32',
        },
        accent: {
          50: '#fef7ed',
          100: '#fdedd4',
          200: '#fad7a8',
          300: '#f6bc71',
          400: '#f19938',
          500: '#E58C30', // Construction Amber - Main accent
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Background Colors
        background: {
          light: '#F4F5F7', // Blueprint Off-White
          dark: '#0F1A24',  // Blueprint Charcoal
        },
        // Text Colors
        text: {
          light: '#1E1E1E', // Charcoal
          dark: '#EDEDED',  // Soft White
        },
        // UI Colors
        border: '#D1D5DB', // Slate Grey
        // Status Colors
        success: '#2E7D32', // Builder Green
        warning: '#FFB100', // Jobsite Yellow
        error: '#D32F2F',   // Safety Red
        // Keep existing primary for backward compatibility
        blue: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
} 