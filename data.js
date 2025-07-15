// Sample data structure for video tracking
// You can update this file daily with new view counts

const videoData = [
    {
        id: "yt_001",
        title: "Amazing Sunset Views",
        platform: "youtube",
        tags: ["nature", "travel", "sunset"],
        views: [
            { date: "2024-01-01", count: 1200 },
            { date: "2024-01-02", count: 1800 },
            { date: "2024-01-03", count: 2500 },
            { date: "2024-01-04", count: 3200 },
            { date: "2024-01-05", count: 4100 },
            { date: "2024-01-06", count: 5200 },
            { date: "2024-01-07", count: 6800 },
            { date: "2024-01-08", count: 8900 },
            { date: "2024-01-09", count: 11200 },
            { date: "2024-01-10", count: 14500 }
        ]
    },
    {
        id: "yt_002",
        title: "Quick Cooking Tips",
        platform: "youtube",
        tags: ["cooking", "tips", "food"],
        views: [
            { date: "2024-01-01", count: 800 },
            { date: "2024-01-02", count: 1500 },
            { date: "2024-01-03", count: 2200 },
            { date: "2024-01-04", count: 3100 },
            { date: "2024-01-05", count: 4200 },
            { date: "2024-01-06", count: 5800 },
            { date: "2024-01-07", count: 7800 },
            { date: "2024-01-08", count: 10200 },
            { date: "2024-01-09", count: 13500 },
            { date: "2024-01-10", count: 17800 }
        ]
    },
    {
        id: "tt_001",
        title: "Dance Challenge",
        platform: "tiktok",
        tags: ["dance", "trending", "music"],
        views: [
            { date: "2024-01-01", count: 5000 },
            { date: "2024-01-02", count: 12000 },
            { date: "2024-01-03", count: 25000 },
            { date: "2024-01-04", count: 45000 },
            { date: "2024-01-05", count: 78000 },
            { date: "2024-01-06", count: 125000 },
            { date: "2024-01-07", count: 198000 },
            { date: "2024-01-08", count: 312000 },
            { date: "2024-01-09", count: 489000 },
            { date: "2024-01-10", count: 756000 }
        ]
    },
    {
        id: "tt_002",
        title: "Life Hacks Compilation",
        platform: "tiktok",
        tags: ["lifehacks", "tips", "useful"],
        views: [
            { date: "2024-01-01", count: 3000 },
            { date: "2024-01-02", count: 8000 },
            { date: "2024-01-03", count: 15000 },
            { date: "2024-01-04", count: 28000 },
            { date: "2024-01-05", count: 45000 },
            { date: "2024-01-06", count: 72000 },
            { date: "2024-01-07", count: 115000 },
            { date: "2024-01-08", count: 182000 },
            { date: "2024-01-09", count: 289000 },
            { date: "2024-01-10", count: 456000 }
        ]
    },
    {
        id: "yt_003",
        title: "Tech Review: Latest Gadgets",
        platform: "youtube",
        tags: ["tech", "review", "gadgets"],
        views: [
            { date: "2024-01-01", count: 2000 },
            { date: "2024-01-02", count: 3500 },
            { date: "2024-01-03", count: 5200 },
            { date: "2024-01-04", count: 7800 },
            { date: "2024-01-05", count: 11200 },
            { date: "2024-01-06", count: 15800 },
            { date: "2024-01-07", count: 22500 },
            { date: "2024-01-08", count: 31800 },
            { date: "2024-01-09", count: 44500 },
            { date: "2024-01-10", count: 62300 }
        ]
    },
    {
        id: "tt_003",
        title: "Pet Funny Moments",
        platform: "tiktok",
        tags: ["pets", "funny", "cute"],
        views: [
            { date: "2024-01-01", count: 8000 },
            { date: "2024-01-02", count: 18000 },
            { date: "2024-01-03", count: 35000 },
            { date: "2024-01-04", count: 62000 },
            { date: "2024-01-05", count: 98000 },
            { date: "2024-01-06", count: 145000 },
            { date: "2024-01-07", count: 212000 },
            { date: "2024-01-08", count: 298000 },
            { date: "2024-01-09", count: 412000 },
            { date: "2024-01-10", count: 567000 }
        ]
    }
];

// Helper function to get all unique tags
function getAllTags() {
    const tags = new Set();
    videoData.forEach(video => {
        video.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
}

// Helper function to get all unique platforms
function getAllPlatforms() {
    const platforms = new Set();
    videoData.forEach(video => {
        platforms.add(video.platform);
    });
    return Array.from(platforms);
}

// Helper function to format numbers with K, M, B suffixes
function formatNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Helper function to get latest view count for a video
function getLatestViews(video) {
    return video.views[video.views.length - 1]?.count || 0;
}

// Helper function to get total views for a video
function getTotalViews(video) {
    return video.views.reduce((sum, view) => sum + view.count, 0);
}

// Helper function to get average daily growth
function getAverageGrowth(video) {
    if (video.views.length < 2) return 0;
    const firstView = video.views[0].count;
    const lastView = video.views[video.views.length - 1].count;
    const days = video.views.length - 1;
    return Math.round((lastView - firstView) / days);
} 