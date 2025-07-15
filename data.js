// Producer data structure for tracking 4 producers' performance
// Each video is posted on both YouTube and TikTok
// Some videos are shared between multiple producers

const producers = [
    {
        id: "producer_1",
        name: "Producer Alpha",
        color: "#ff6b6b" // Red
    },
    {
        id: "producer_2", 
        name: "Producer Beta",
        color: "#4ecdc4" // Teal
    },
    {
        id: "producer_3",
        name: "Producer Gamma", 
        color: "#45b7d1" // Blue
    },
    {
        id: "producer_4",
        name: "Producer Delta",
        color: "#96ceb4" // Green
    }
];

const videoData = [
    {
        id: "video_001",
        title: "Amazing Sunset Views",
        producers: ["producer_1"], // Single producer
        youtubeViews: [
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
        ],
        tiktokViews: [
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
        id: "video_002",
        title: "Quick Cooking Tips",
        producers: ["producer_2"], // Single producer
        youtubeViews: [
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
        ],
        tiktokViews: [
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
        id: "video_003",
        title: "Tech Review: Latest Gadgets",
        producers: ["producer_3"], // Single producer
        youtubeViews: [
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
        ],
        tiktokViews: [
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
    },
    {
        id: "video_004",
        title: "Dance Challenge",
        producers: ["producer_1", "producer_2"], // Shared between 2 producers
        youtubeViews: [
            { date: "2024-01-01", count: 1500 },
            { date: "2024-01-02", count: 2800 },
            { date: "2024-01-03", count: 4200 },
            { date: "2024-01-04", count: 6500 },
            { date: "2024-01-05", count: 9800 },
            { date: "2024-01-06", count: 14500 },
            { date: "2024-01-07", count: 21800 },
            { date: "2024-01-08", count: 32500 },
            { date: "2024-01-09", count: 48700 },
            { date: "2024-01-10", count: 73200 }
        ],
        tiktokViews: [
            { date: "2024-01-01", count: 6000 },
            { date: "2024-01-02", count: 15000 },
            { date: "2024-01-03", count: 32000 },
            { date: "2024-01-04", count: 58000 },
            { date: "2024-01-05", count: 95000 },
            { date: "2024-01-06", count: 152000 },
            { date: "2024-01-07", count: 245000 },
            { date: "2024-01-08", count: 398000 },
            { date: "2024-01-09", count: 642000 },
            { date: "2024-01-10", count: 1035000 }
        ]
    },
    {
        id: "video_005",
        title: "Life Hacks Compilation",
        producers: ["producer_3", "producer_4"], // Shared between 2 producers
        youtubeViews: [
            { date: "2024-01-01", count: 1200 },
            { date: "2024-01-02", count: 2200 },
            { date: "2024-01-03", count: 3800 },
            { date: "2024-01-04", count: 6200 },
            { date: "2024-01-05", count: 9800 },
            { date: "2024-01-06", count: 15200 },
            { date: "2024-01-07", count: 23800 },
            { date: "2024-01-08", count: 37200 },
            { date: "2024-01-09", count: 58100 },
            { date: "2024-01-10", count: 90800 }
        ],
        tiktokViews: [
            { date: "2024-01-01", count: 4000 },
            { date: "2024-01-02", count: 10000 },
            { date: "2024-01-03", count: 22000 },
            { date: "2024-01-04", count: 42000 },
            { date: "2024-01-05", count: 72000 },
            { date: "2024-01-06", count: 118000 },
            { date: "2024-01-07", count: 195000 },
            { date: "2024-01-08", count: 322000 },
            { date: "2024-01-09", count: 532000 },
            { date: "2024-01-10", count: 878000 }
        ]
    },
    {
        id: "video_006",
        title: "Pet Funny Moments",
        producers: ["producer_4"], // Single producer
        youtubeViews: [
            { date: "2024-01-01", count: 900 },
            { date: "2024-01-02", count: 1600 },
            { date: "2024-01-03", count: 2800 },
            { date: "2024-01-04", count: 4500 },
            { date: "2024-01-05", count: 7200 },
            { date: "2024-01-06", count: 11500 },
            { date: "2024-01-07", count: 18400 },
            { date: "2024-01-08", count: 29400 },
            { date: "2024-01-09", count: 47000 },
            { date: "2024-01-10", count: 75200 }
        ],
        tiktokViews: [
            { date: "2024-01-01", count: 3500 },
            { date: "2024-01-02", count: 8500 },
            { date: "2024-01-03", count: 18000 },
            { date: "2024-01-04", count: 35000 },
            { date: "2024-01-05", count: 62000 },
            { date: "2024-01-06", count: 98000 },
            { date: "2024-01-07", count: 152000 },
            { date: "2024-01-08", count: 238000 },
            { date: "2024-01-09", count: 372000 },
            { date: "2024-01-10", count: 581000 }
        ]
    }
];

// Helper function to get all unique dates from all videos
function getAllDates() {
    const allDates = new Set();
    videoData.forEach(video => {
        video.youtubeViews.forEach(view => allDates.add(view.date));
        video.tiktokViews.forEach(view => allDates.add(view.date));
    });
    return Array.from(allDates).sort();
}

// Helper function to get producer by ID
function getProducerById(id) {
    return producers.find(producer => producer.id === id);
}

// Helper function to calculate producer views for a specific date and platform
function getProducerViewsForDate(producerId, date, platform = 'all') {
    let totalViews = 0;
    
    videoData.forEach(video => {
        if (video.producers.includes(producerId)) {
            const sharePercentage = 1 / video.producers.length; // Split equally between producers
            
            if (platform === 'youtube' || platform === 'all') {
                const youtubeView = video.youtubeViews.find(v => v.date === date);
                if (youtubeView) {
                    totalViews += youtubeView.count * sharePercentage;
                }
            }
            
            if (platform === 'tiktok' || platform === 'all') {
                const tiktokView = video.tiktokViews.find(v => v.date === date);
                if (tiktokView) {
                    totalViews += tiktokView.count * sharePercentage;
                }
            }
        }
    });
    
    return Math.round(totalViews);
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

// Helper function to get latest total views for a video
function getLatestTotalViews(video) {
    const latestYoutube = video.youtubeViews[video.youtubeViews.length - 1]?.count || 0;
    const latestTiktok = video.tiktokViews[video.tiktokViews.length - 1]?.count || 0;
    return latestYoutube + latestTiktok;
}

// Helper function to get total views for a video
function getTotalViews(video) {
    const youtubeTotal = video.youtubeViews.reduce((sum, view) => sum + view.count, 0);
    const tiktokTotal = video.tiktokViews.reduce((sum, view) => sum + view.count, 0);
    return youtubeTotal + tiktokTotal;
} 