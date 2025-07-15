# Development Guide

## Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   This will start the Vite dev server at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
dropout-fools-gold-tracker/
├── src/                    # Source files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styles
│   ├── data.js           # Video data and helper functions
│   └── app.js            # Main application logic
├── public/                # Static assets
│   └── favicon.svg       # Favicon
├── dist/                  # Build output (generated)
├── package.json          # Project configuration
├── vite.config.js        # Vite configuration
├── .eslintrc.json        # ESLint configuration
└── .gitignore           # Git ignore rules
```

## Development Workflow

1. Make changes to files in the `src/` directory
2. The development server will automatically reload
3. Use `npm run lint` to check code quality
4. Use `npm run build` to create a production build

## Deployment

The built files will be in the `dist/` directory after running `npm run build`. You can deploy these files to any static hosting service. 