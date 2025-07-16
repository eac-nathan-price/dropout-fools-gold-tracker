// Producer data structure for tracking 4 producers' performance
// Each video is posted on both YouTube and TikTok
// Some videos are shared between multiple producers

export interface Producer {
    id: string;
    name: string;
    fullName: string;
    color: string;
}

export interface Video {
    id: string;
    title: string;
    link: string;
    producers: string[];
    youtubeViews: number[];
    tiktokViews: number[];
    instagramViews?: number[];
}

// Single list of all datetime strings - shared across all videos
export const allDates: string[] = [
    "2025-07-14T16:00:00-07:00",
    "2025-07-15T00:00:00-07:00",
    "2025-07-15T08:00:00-07:00",
    "2025-07-15T16:00:00-07:00",
    "2025-07-15T20:00:00-07:00",
    "2025-07-16T06:00:00-07:00",
    "2025-07-16T10:00:00-07:00"
];

export const producers: Producer[] = [
    {
        id: "trapp",
        name: "Trapp",
        fullName: "Mike Trapp",
        color: "#10b981" // Emerald
    },
    {
        id: "rekha", 
        name: "Rekha",
        fullName: "Rekha Shankar",
        color: "#06b6d4" // Cyan
    },
    {
        id: "jordan",
        name: "Jordan", 
        fullName: "Jordan Myrick",
        color: "#6366f1" // Indigo
    },
    {
        id: "sam",
        name: "Sam",
        fullName: "Sam Reich",
        color: "#8b5cf6" // Purple
    }
];

export const videoData: Video[] = [
    {
        id: "video_001",
        title: "Peel Robalino",
        link: "https://www.youtube.com/shorts/gMpx4A2lRTE",
        producers: ["trapp"], // Trapp only
        youtubeViews: [0, 50000, 78000, 113000, 130000, 151000, 158000],
        tiktokViews: [0, 61700, 84300, 108800, 125600, 148000, 154900],
        instagramViews: [0, 148000, 296000, 509000, 537000, 570000, 581000]
    },
    {
        id: "video_002",
        title: "Anna's King for a Day",
        link: "https://www.youtube.com/shorts/UjHk90dxX20",
        producers: ["jordan"], // Jordan only
        youtubeViews: [0, 70000, 118000, 218000, 261000, 312000, 328000],
        tiktokViews: [0, 127400, 255500, 354800, 391600, 435400, 456400],
        instagramViews: [0, 114000, 229000, 396000, 428000, 466000, 482000]
    },
    {
        id: "video_003",
        title: "Katie's D20 on a Bus",
        link: "https://www.youtube.com/shorts/5feqZBLXrMg",
        producers: ["rekha"], // Rekha only
        youtubeViews: [0, 201000, 403000, 636000, 709000, 804000, 841000],
        tiktokViews: [0, 338900, 545200, 726200, 797300, 868000, 894400],
        instagramViews: [0, 229000, 458000, 797000, 873000, 995000, 1000000]
    },
    {
        id: "video_004",
        title: "Erika's Haircut",
        link: "https://www.youtube.com/shorts/wQVIfuNIc9I",
        producers: ["jordan"], // Jordan only
        youtubeViews: [0, 189000, 364700, 492000, 555000, 626000, 650000],
        tiktokViews: [0, 103700, 145800, 181500, 199000, 219600, 227600],
        instagramViews: [0, 113000, 226000, 390000, 415000, 442000, 451000]
    },
    {
        id: "video_005",
        title: "Sephie's Sexy Car Wash",
        link: "https://www.youtube.com/shorts/HD5pyGbO_Is",
        producers: ["rekha", "jordan"], // Rekha and Jordan (50/50)
        youtubeViews: [0, 66000, 102000, 145000, 165000, 194000, 201000],
        tiktokViews: [0, 73700, 97600, 122900, 136300, 150300, 155600],
        instagramViews: [0, 162000, 323000, 553000, 585000, 625000, 638000]
    },
    {
        id: "video_006",
        title: "Grant's Crack",
        link: "https://www.youtube.com/shorts/1lnl0jYln8s",
        producers: ["trapp"], // Trapp only
        youtubeViews: [0, 53000, 79000, 111000, 124000, 140000, 145000],
        tiktokViews: [0, 64100, 97900, 136200, 155300, 179400, 190300],
        instagramViews: [0, 86000, 172000, 296000, 314000, 331000, 337000]
    },
    {
        id: "video_007",
        title: "Jonny's Human Puppy Bowl",
        link: "https://www.youtube.com/shorts/aagwlycxv_k",
        producers: ["trapp", "rekha"], // Trapp and Rekha (50/50)
        youtubeViews: [0, 46000, 71000, 104000, 117000, 134000, 139000],
        tiktokViews: [0, 89600, 130700, 165400, 178400, 192500, 197300],
        instagramViews: [0, 68000, 136000, 234000, 251000, 266000, 271000]
    },
    {
        id: "video_008",
        title: "Lily & Izzy's Milk Taste Test",
        link: "https://www.youtube.com/shorts/nfwmaVlp_hY",
        producers: ["jordan"], // Jordan only
        youtubeViews: [0, 66000, 107000, 158000, 181000, 208000, 217000],
        tiktokViews: [0, 292000, 422800, 570100, 636700, 696600, 725500],
        instagramViews: [0, 420000, 840000, 1500000, 1700000, 2000000, 2100000]
    },
    {
        id: "video_009",
        title: "Izzy's Buttholes",
        link: "https://www.youtube.com/shorts/Wm8SMsmWCts",
        producers: ["trapp", "rekha"], // Trapp and Rekha (50/50)
        youtubeViews: [0, 186000, 372000, 654000, 769000, 912000, 957000],
        tiktokViews: [0, 90300, 125200, 167500, 189500, 206700, 210800],
        instagramViews: [0, 114000, 227000, 392000, 424000, 453000, 465000]
    },
    {
        id: "video_010",
        title: "Vic's Brennan's Exit Video",
        link: "https://www.youtube.com/shorts/oO4kgmYivoQ",
        producers: ["trapp", "rekha", "jordan", "sam"], // All producers (25% each)
        youtubeViews: [0, 415000, 825000, 1300000, 1600000, 1800000, 1900000],
        tiktokViews: [0, 881200, 1500000, 1900000, 2100000, 2200000, 2300000],
        instagramViews: [0, 540000, 1080000, 1800000, 2000000, 2200000, 2200000]
    }
];

// Helper function to get all unique dates from all videos
export function getAllDates(): string[] {
    return allDates;
}

// Helper function to get producer by ID
export function getProducerById(id: string): Producer | undefined {
    return producers.find(producer => producer.id === id);
}

// Helper function to calculate producer views for a specific date and platform
export function getProducerViewsForDate(producerId: string, date: string, platform: 'youtube' | 'tiktok' | 'instagram' | 'all' = 'all'): number {
    const dateIndex = allDates.indexOf(date);
    if (dateIndex === -1) return 0;
    
    let totalViews = 0;
    
    videoData.forEach(video => {
        if (video.producers.includes(producerId)) {
            const sharePercentage = 1 / video.producers.length; // Split equally between producers
            
            if (platform === 'youtube' || platform === 'all') {
                totalViews += video.youtubeViews[dateIndex] * sharePercentage;
            }
            
            if (platform === 'tiktok' || platform === 'all') {
                totalViews += video.tiktokViews[dateIndex] * sharePercentage;
            }
            
            if ((platform === 'instagram' || platform === 'all') && video.instagramViews) {
                totalViews += video.instagramViews[dateIndex] * sharePercentage;
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
    const latestIndex = allDates.length - 1;
    const latestYoutube = video.youtubeViews[latestIndex] || 0;
    const latestTiktok = video.tiktokViews[latestIndex] || 0;
    const latestInstagram = video.instagramViews ? video.instagramViews[latestIndex] || 0 : 0;
    return latestYoutube + latestTiktok + latestInstagram;
}

// Helper function to get total views for a video
export function getTotalViews(video: Video): number {
    const youtubeTotal = video.youtubeViews.reduce((sum, count) => sum + count, 0);
    const tiktokTotal = video.tiktokViews.reduce((sum, count) => sum + count, 0);
    const instagramTotal = video.instagramViews ? video.instagramViews.reduce((sum, count) => sum + count, 0) : 0;
    return youtubeTotal + tiktokTotal + instagramTotal;
} 