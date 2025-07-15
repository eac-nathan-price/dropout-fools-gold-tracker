# 📊 Shorts Tracker

A modern, responsive web application for tracking YouTube and TikTok shorts views with interactive charts and group analytics.

## ✨ Features

- **Individual Video Tracking**: Line charts showing view progression for each video over time
- **Group Analytics**: Aggregated charts showing total views for tagged groups
- **Platform Filtering**: Filter by YouTube, TikTok, or view all platforms
- **Tag-based Grouping**: Organize videos with custom tags for group analysis
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, gradient-based design with smooth animations
- **Static Hosting**: Pure HTML/CSS/JS - can be served from any static host

## 🚀 Quick Start

1. **Clone or download** the project files
2. **Open `index.html`** in your web browser
3. **Start tracking** your videos!

## 📁 Project Structure

```
shorts-tracker/
├── index.html          # Main HTML file
├── styles.css          # Modern CSS styles
├── data.js            # Video data and helper functions
├── app.js             # Main application logic
└── README.md          # This file
```

## 📊 Data Structure

Each video in `data.js` follows this structure:

```javascript
{
    id: "unique_id",           // Unique identifier
    title: "Video Title",      // Video title
    platform: "youtube",       // "youtube" or "tiktok"
    tags: ["tag1", "tag2"],    // Array of tags for grouping
    views: [                   // Array of daily view counts
        { date: "2024-01-01", count: 1200 },
        { date: "2024-01-02", count: 1800 },
        // ... more dates
    ]
}
```

## 🔄 Updating Data

To add new videos or update view counts:

1. **Open `data.js`**
2. **Add new video objects** to the `videoData` array
3. **Update existing videos** by adding new entries to their `views` array
4. **Refresh the page** to see your changes

### Example: Adding a New Video

```javascript
{
    id: "yt_004",
    title: "My New Video",
    platform: "youtube",
    tags: ["tutorial", "tech"],
    views: [
        { date: "2024-01-01", count: 500 },
        { date: "2024-01-02", count: 1200 },
        { date: "2024-01-03", count: 2100 }
    ]
}
```

### Example: Updating Daily Views

Add a new entry to an existing video's `views` array:

```javascript
views: [
    // ... existing dates
    { date: "2024-01-10", count: 14500 },
    { date: "2024-01-11", count: 18200 }  // New entry
]
```

## 🎨 Customization

### Colors and Styling
- Edit `styles.css` to customize colors, fonts, and layout
- The app uses CSS custom properties for easy theming
- Gradient backgrounds and modern card designs

### Chart Configuration
- Charts are rendered using Chart.js
- Customize chart colors, styles, and options in `app.js`
- Platform-specific colors: YouTube (red), TikTok (black)

### Adding New Features
- The modular structure makes it easy to add new features
- Helper functions in `data.js` can be extended
- Chart rendering logic is separated for easy modification

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full-featured experience with multiple charts visible
- **Tablet**: Optimized layout with adjusted chart sizes
- **Mobile**: Single-column layout with touch-friendly controls

## 🔧 Technical Details

- **No Dependencies**: Pure vanilla JavaScript, HTML, and CSS
- **Chart.js**: Used for interactive line charts (loaded via CDN)
- **Modern CSS**: Flexbox, Grid, CSS animations, and backdrop filters
- **ES6+**: Modern JavaScript features for clean, maintainable code

## 🚀 Deployment

Since this is a static website, you can deploy it to:

- **GitHub Pages**: Push to a GitHub repository and enable Pages
- **Netlify**: Drag and drop the folder to Netlify
- **Vercel**: Connect your repository for automatic deployments
- **Any Static Host**: AWS S3, Firebase Hosting, etc.

## 📈 Analytics Features

### Individual Video Stats
- **Latest Views**: Most recent view count
- **Total Views**: Sum of all daily views
- **Average Daily Growth**: Average increase per day

### Group Analytics
- **Total Views**: Combined views for all videos in a group
- **Video Count**: Number of videos in each group
- **Aggregated Charts**: Combined view progression over time

## 🏷️ Tag System

Use tags to organize your videos into groups:
- **Content Type**: tutorial, review, entertainment
- **Topic**: tech, cooking, travel, fitness
- **Platform**: youtube, tiktok
- **Performance**: trending, viral, steady

Tags are automatically detected and used for filtering and group analytics.

## 🔮 Future Enhancements

Potential features you could add:
- **Export Data**: CSV/JSON export functionality
- **Date Range Selection**: Custom date ranges for analysis
- **Performance Metrics**: Engagement rates, growth percentages
- **Data Import**: Bulk import from spreadsheets
- **Real-time Updates**: WebSocket integration for live data
- **User Authentication**: Multi-user support
- **Data Persistence**: Local storage or database integration

## 🤝 Contributing

Feel free to fork this project and customize it for your needs. The modular structure makes it easy to add new features or modify existing ones.

## 📄 License

This project is open source and available under the MIT License.

---

**Happy tracking! 📊✨** 