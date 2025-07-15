// Producer data structure for tracking 4 producers' performance
// Each video is posted on both YouTube and TikTok
// Some videos are shared between multiple producers

export interface Producer {
    id: string;
    name: string;
    fullName: string;
    color: string;
}

export interface View {
    date: string;
    count: number;
}

export interface Video {
    id: string;
    title: string;
    producers: string[];
    youtubeViews: View[];
    tiktokViews: View[];
}

export const producers: Producer[] = [
    {
        id: "producer_1",
        name: "Trapp",
        fullName: "Mike Trapp",
        color: "#10b981" // Emerald
    },
    {
        id: "producer_2", 
        name: "Rekha",
        fullName: "Rekha Shankar",
        color: "#06b6d4" // Cyan
    },
    {
        id: "producer_3",
        name: "Jordan", 
        fullName: "Jordan Myrick",
        color: "#6366f1" // Indigo
    },
    {
        id: "producer_4",
        name: "Sam",
        fullName: "Sam Reich",
        color: "#8b5cf6" // Purple
    }
];

export const videoData: Video[] = [
    {
        id: "video_001",
        title: "Peel Robalino",
        producers: ["producer_1"], // Trapp only
        youtubeViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 50000 },
            { date: "2025-07-15T08:00:00-07:00", count: 84300 }
        ],
        tiktokViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 61700 },
            { date: "2025-07-15T08:00:00-07:00", count: 78000 }
        ]
    },
    {
        id: "video_002",
        title: "Anna's King for a Day",
        producers: ["producer_3"], // Jordan only
        youtubeViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 70000 },
            { date: "2025-07-15T08:00:00-07:00", count: 255500 }
        ],
        tiktokViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 127400 },
            { date: "2025-07-15T08:00:00-07:00", count: 118000 }
        ]
    },
    {
        id: "video_003",
        title: "Katie's D20 on a Bus",
        producers: ["producer_2"], // Rekha only
        youtubeViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 201000 },
            { date: "2025-07-15T08:00:00-07:00", count: 545200 }
        ],
        tiktokViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 338900 },
            { date: "2025-07-15T08:00:00-07:00", count: 403000 }
        ]
    },
    {
        id: "video_004",
        title: "Erika's Haircut",
        producers: ["producer_3"], // Jordan only
        youtubeViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 189000 },
            { date: "2025-07-15T08:00:00-07:00", count: 145800 }
        ],
        tiktokViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 103700 },
            { date: "2025-07-15T08:00:00-07:00", count: 103700 }
        ]
    },
    {
        id: "video_005",
        title: "Sephie's Sexy Car Wash",
        producers: ["producer_2", "producer_3"], // Rekha and Jordan (50/50)
        youtubeViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 66000 },
            { date: "2025-07-15T08:00:00-07:00", count: 97600 }
        ],
        tiktokViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 73700 },
            { date: "2025-07-15T08:00:00-07:00", count: 102000 }
        ]
    },
    {
        id: "video_006",
        title: "Grant's Crack",
        producers: ["producer_1"], // Trapp only
        youtubeViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 53000 },
            { date: "2025-07-15T08:00:00-07:00", count: 97900 }
        ],
        tiktokViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 64100 },
            { date: "2025-07-15T08:00:00-07:00", count: 79000 }
        ]
    },
    {
        id: "video_007",
        title: "Jonny Stanton's Human Puppy Bowl",
        producers: ["producer_1", "producer_2"], // Trapp and Rekha (50/50)
        youtubeViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 46000 },
            { date: "2025-07-15T08:00:00-07:00", count: 130700 }
        ],
        tiktokViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 89600 },
            { date: "2025-07-15T08:00:00-07:00", count: 71000 }
        ]
    },
    {
        id: "video_008",
        title: "Lily & Izzy's Breast Milk Taste Test",
        producers: ["producer_3"], // Jordan only
        youtubeViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 66000 },
            { date: "2025-07-15T08:00:00-07:00", count: 422800 }
        ],
        tiktokViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 292000 },
            { date: "2025-07-15T08:00:00-07:00", count: 107000 }
        ]
    },
    {
        id: "video_009",
        title: "Izzy's Buttholes",
        producers: ["producer_1", "producer_2"], // Trapp and Rekha (50/50)
        youtubeViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 186000 },
            { date: "2025-07-15T08:00:00-07:00", count: 125200 }
        ],
        tiktokViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 90300 },
            { date: "2025-07-15T08:00:00-07:00", count: 372000 }
        ]
    },
    {
        id: "video_010",
        title: "Vic's Brennan's Exit Video",
        producers: ["producer_1", "producer_2", "producer_3", "producer_4"], // All producers (25% each)
        youtubeViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 415000 },
            { date: "2025-07-15T08:00:00-07:00", count: 1500000 }
        ],
        tiktokViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 881200 },
            { date: "2025-07-15T08:00:00-07:00", count: 825000 }
        ]
    }
];

// Helper function to get all unique dates from all videos
export function getAllDates(): string[] {
    const allDates = new Set<string>();
    videoData.forEach(video => {
        video.youtubeViews.forEach(view => allDates.add(view.date));
        video.tiktokViews.forEach(view => allDates.add(view.date));
    });
    return Array.from(allDates).sort();
}

// Helper function to get producer by ID
export function getProducerById(id: string): Producer | undefined {
    return producers.find(producer => producer.id === id);
}

// Helper function to calculate producer views for a specific date and platform
export function getProducerViewsForDate(producerId: string, date: string, platform: 'youtube' | 'tiktok' | 'all' = 'all'): number {
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
export function formatNumber(num: number): string {
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
export function getLatestTotalViews(video: Video): number {
    const latestYoutube = video.youtubeViews[video.youtubeViews.length - 1]?.count || 0;
    const latestTiktok = video.tiktokViews[video.tiktokViews.length - 1]?.count || 0;
    return latestYoutube + latestTiktok;
}

// Helper function to get total views for a video
export function getTotalViews(video: Video): number {
    const youtubeTotal = video.youtubeViews.reduce((sum, view) => sum + view.count, 0);
    const tiktokTotal = video.tiktokViews.reduce((sum, view) => sum + view.count, 0);
    return youtubeTotal + tiktokTotal;
} 