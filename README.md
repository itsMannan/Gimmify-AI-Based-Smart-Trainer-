# Gimmify - Learning Page

A beautiful learning page built with Next.js 14 and Tailwind CSS that showcases the Gimmify fitness coaching platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser to http://localhost:3000
```

Your webpage will be live and ready to view!

## Features

- 🎨 Modern, responsive design with Tailwind CSS
- ⚡ Built with Next.js 14 (App Router)
- 📱 Mobile-friendly layout
- 🎯 Comprehensive information about Gimmify
- 💪 Beautiful gradient designs and animations

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see the learning page.

## Viewing the Webpage

### Local Development

After running `npm run dev`, the learning page will be available at:
- **Local URL:** [http://localhost:3000](http://localhost:3000)
- **Network URL:** The terminal will also show a network URL (e.g., `http://192.168.x.x:3000`) that you can access from other devices on your local network

**To view on mobile/tablet:**
1. Make sure your device is on the same Wi-Fi network
2. Use the network URL shown in the terminal
3. Open it in your mobile browser

### Production Build

To create an optimized production build:

```bash
npm run build
npm start
```

The production server will run on [http://localhost:3000](http://localhost:3000) by default.

### Browser Compatibility

The webpage works best on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Deploying to the Web

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and deploy
4. Your webpage will be live at `your-project.vercel.app`

**Quick Deploy:**
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Build the project: `npm run build`
3. Deploy: `netlify deploy --prod`
4. Or connect your GitHub repository on [Netlify](https://netlify.com)
   - Build command: `npm run build`
   - Publish directory: `.next`

### Deploy to Other Platforms

The project can be deployed to any platform that supports Next.js:
- **AWS Amplify**
- **Railway**
- **Render**
- **DigitalOcean App Platform**
- **Heroku** (with Next.js buildpack)

## Preview

Once deployed, your Gimmify learning page will showcase:
- ✨ Modern gradient designs
- 📱 Fully responsive layout
- 🎨 Beautiful UI components
- ⚡ Fast loading times
- 🌐 Accessible from anywhere
- 📸 Exercise images with pose detection features

## Images

The page includes exercise-related images showcasing pose detection features:

### Current Images
- **Hero Image**: Exercise with pose detection overlay
- **Exercise Gallery**: 4 exercise types (Push-ups, Squats, Yoga, Planks)
- **How It Works**: Demonstration image with pose detection
- **Unique Edge**: Real-time feedback system image

### Image Sources
Currently using high-quality images from Unsplash. All images are loaded from `images.unsplash.com` and are free to use.

### Replacing Images
To use your own images:
1. Place images in the `public/images/` directory
2. Update the `src` attributes in `app/page.tsx` to point to your local images
3. Example: `/images/exercise-pose-detection-1.jpg`

### Image Specifications
- Format: JPG or PNG
- Recommended size: 1200x800px or larger
- Aspect ratio: 3:2 or 16:9 for best results

## Project Structure

```
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Learning page (main page)
│   └── globals.css     # Global styles with Tailwind
├── public/
│   └── images/         # Exercise and pose detection images
├── tailwind.config.js  # Tailwind configuration
├── postcss.config.js   # PostCSS configuration
├── next.config.js      # Next.js configuration (includes image config)
└── package.json        # Dependencies
```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript
- **React 18** - UI library

## Build for Production

```bash
npm run build
npm start
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, Next.js will automatically use the next available port (3001, 3002, etc.). Check the terminal output for the correct URL.

### Cannot Access from Mobile Device

1. Make sure your computer and mobile device are on the same Wi-Fi network
2. Check your firewall settings - it may be blocking incoming connections
3. Use the network IP address shown in the terminal (not localhost)

### Styling Issues

If styles aren't loading:
1. Make sure Tailwind CSS is properly installed: `npm install`
2. Clear the `.next` cache: `rm -rf .next`
3. Restart the dev server: `npm run dev`

### Build Errors

If you encounter build errors:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Run `npm run build` to check for errors

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)

## License

This project is private and proprietary.

