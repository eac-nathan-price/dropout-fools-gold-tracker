// Producer data structure for tracking 4 producers' performance
// Each video is posted on both YouTube and TikTok
// Some videos are shared between multiple producers

export interface Producer {
    id: string;
    name: string;
    fullName: string;
    color: string;
}

export interface VideoMetadata {
    id: string;
    title: string;
    link: string;
    producers: string[];
}

export interface VideoViewData {
    id: string;
    youtubeViews: number[];
    tiktokViews: number[];
    instagramViews: number[];
}

export interface Video {
    id: string;
    title: string;
    links: {
        youtube: string;
        tiktok: string;
        instagram: string;
    };
    contributions: {
        [producerId: string]: number;
    };
    youtubeViews: number[];
    tiktokViews: number[];
    instagramViews: number[];
}

export interface ViewData {
    times: Date[];
    videos: {
        [videoId: string]: {
            youtube: number[];
            tiktok: number[];
            instagram: number[];
        };
    };
}

export interface VideoMetadataCollection {
    [videoId: string]: {
        title: string;
        links: {
            youtube: string;
            tiktok: string;
            instagram: string;
        };
        contributions: {
            [producerId: string]: number; // Dollar amount contributed
        };
    };
}

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

// Combined view data structure
export const viewData: ViewData = {
    times: [
        new Date("2025-07-14T16:00:00-07:00"),
        new Date("2025-07-15T00:00:00-07:00"),
        new Date("2025-07-15T08:00:00-07:00"),
        new Date("2025-07-15T16:00:00-07:00"),
        new Date("2025-07-15T20:00:00-07:00"),
        new Date("2025-07-16T06:00:00-07:00"),
        new Date("2025-07-16T10:00:00-07:00"),
        new Date("2025-07-16T14:00:00-07:00")
    ],
    videos: {
        "peel-robalino": {
            youtube: [0, 50000, 78000, 113000, 130000, 151000, 158000, 166000],
            tiktok: [0, 61700, 84300, 108800, 125600, 148000, 154900, 162000],
            instagram: [0, 148000, 296000, 509000, 537000, 570000, 581000, 591000]
        },
        "annas-king": {
            youtube: [0, 70000, 118000, 218000, 261000, 312000, 328000, 356000],
            tiktok: [0, 127400, 255500, 354800, 391600, 435400, 456400, 473500],
            instagram: [0, 114000, 229000, 396000, 428000, 466000, 482000, 505000]
        },
        "katies-d20": {
            youtube: [0, 201000, 403000, 636000, 709000, 804000, 841000, 878000],
            tiktok: [0, 338900, 545200, 726200, 797300, 868000, 894400, 925200],
            instagram: [0, 229000, 458000, 797000, 873000, 995000, 1000000, 1000000]
        },
        "erikas-haircut": {
            youtube: [0, 189000, 364700, 492000, 555000, 626000, 650000, 676000],
            tiktok: [0, 103700, 145800, 181500, 199000, 219600, 227600, 235900],
            instagram: [0, 113000, 226000, 390000, 415000, 442000, 451000, 460000]
        },
        "sephies-car-wash": {
            youtube: [0, 66000, 102000, 145000, 165000, 194000, 201000, 210000],
            tiktok: [0, 73700, 97600, 122900, 136300, 150300, 155600, 160900],
            instagram: [0, 162000, 323000, 553000, 585000, 625000, 638000, 651000]
        },
        "grants-crack": {
            youtube: [0, 53000, 79000, 111000, 124000, 140000, 145000, 151000],
            tiktok: [0, 64100, 97900, 136200, 155300, 179400, 190300, 201100],
            instagram: [0, 86000, 172000, 296000, 314000, 331000, 337000, 342000]
        },
        "jonnys-puppy-bowl": {
            youtube: [0, 46000, 71000, 104000, 117000, 134000, 139000, 145000],
            tiktok: [0, 89600, 130700, 165400, 178400, 192500, 197300, 201900],
            instagram: [0, 68000, 136000, 234000, 251000, 266000, 271000, 277000]
        },
        "lily-izzys-milk": {
            youtube: [0, 66000, 107000, 158000, 181000, 208000, 217000, 226000],
            tiktok: [0, 292000, 422800, 570100, 636700, 696600, 725500, 765700],
            instagram: [0, 420000, 840000, 1500000, 1700000, 2000000, 2100000, 2200000]
        },
        "izzys-buttholes": {
            youtube: [0, 186000, 372000, 654000, 769000, 912000, 957000, 1000000],
            tiktok: [0, 90300, 125200, 167500, 189500, 206700, 210800, 214700],
            instagram: [0, 114000, 227000, 392000, 424000, 453000, 465000, 475000]
        },
        "vics-brennans-exit": {
            youtube: [0, 415000, 825000, 1300000, 1600000, 1800000, 1900000, 1900000],
            tiktok: [0, 881200, 1500000, 1900000, 2100000, 2200000, 2300000, 2300000],
            instagram: [0, 540000, 1080000, 1800000, 2000000, 2200000, 2200000, 2300000]
        }
    }
};

// Video metadata - static information that doesn't change
export const videoMetadata: VideoMetadataCollection = {
    "peel-robalino": {
        title: "Peel Robalino",
        links: {
            youtube: "https://www.youtube.com/shorts/gMpx4A2lRTE",
            tiktok: "https://www.youtube.com/shorts/gMpx4A2lRTE",
            instagram: "https://www.youtube.com/shorts/gMpx4A2lRTE"
        },
        contributions: { // Trapp only
            "trapp": 1000
        }
    },
    "annas-king": {
        title: "Anna's King for a Day",
        links: {
            youtube: "https://www.youtube.com/shorts/UjHk90dxX20",
            tiktok: "https://www.youtube.com/shorts/UjHk90dxX20",
            instagram: "https://www.youtube.com/shorts/UjHk90dxX20"
        },
        contributions: { // Jordan only
            "jordan": 1000
        }
    },
    "katies-d20": {
        title: "Katie's D20 on a Bus",
        links: {
            youtube: "https://www.youtube.com/shorts/5feqZBLXrMg",
            tiktok: "https://www.youtube.com/shorts/5feqZBLXrMg",
            instagram: "https://www.youtube.com/shorts/5feqZBLXrMg"
        },
        contributions: { // Rekha only
            "rekha": 1000
        }
    },
    "erikas-haircut": {
        title: "Erika's Haircut",
        links: {
            youtube: "https://www.youtube.com/shorts/wQVIfuNIc9I",
            tiktok: "https://www.youtube.com/shorts/wQVIfuNIc9I",
            instagram: "https://www.youtube.com/shorts/wQVIfuNIc9I"
        },
        contributions: { // Jordan only
            "jordan": 1000
        }
    },
    "sephies-car-wash": {
        title: "Sephie's Sexy Car Wash",
        links: {
            youtube: "https://www.youtube.com/shorts/HD5pyGbO_Is",
            tiktok: "https://www.youtube.com/shorts/HD5pyGbO_Is",
            instagram: "https://www.youtube.com/shorts/HD5pyGbO_Is"
        },
        contributions: { // Rekha and Jordan (50/50)
            "rekha": 500,
            "jordan": 500
        }
    },
    "grants-crack": {
        title: "Grant's Crack",
        links: {
            youtube: "https://www.youtube.com/shorts/1lnl0jYln8s",
            tiktok: "https://www.youtube.com/shorts/1lnl0jYln8s",
            instagram: "https://www.youtube.com/shorts/1lnl0jYln8s"
        },
        contributions: { // Trapp only
            "trapp": 1000
        }
    },
    "jonnys-puppy-bowl": {
        title: "Jonny's Human Puppy Bowl",
        links: {
            youtube: "https://www.youtube.com/shorts/aagwlycxv_k",
            tiktok: "https://www.youtube.com/shorts/aagwlycxv_k",
            instagram: "https://www.youtube.com/shorts/aagwlycxv_k"
        },
        contributions: { // Trapp and Rekha (50/50)
            "trapp": 500,
            "rekha": 500
        }
    },
    "lily-izzys-milk": {
        title: "Lily & Izzy's Milk Taste Test",
        links: {
            youtube: "https://www.youtube.com/shorts/nfwmaVlp_hY",
            tiktok: "https://www.youtube.com/shorts/nfwmaVlp_hY",
            instagram: "https://www.youtube.com/shorts/nfwmaVlp_hY"
        },
        contributions: { // Jordan only
            "jordan": 1000
        }
    },
    "izzys-buttholes": {
        title: "Izzy's Buttholes",
        links: {
            youtube: "https://www.youtube.com/shorts/Wm8SMsmWCts",
            tiktok: "https://www.youtube.com/shorts/Wm8SMsmWCts",
            instagram: "https://www.youtube.com/shorts/Wm8SMsmWCts"
        },
        contributions: { // Trapp and Rekha (50/50)
            "trapp": 500,
            "rekha": 500
        }
    },
    "vics-brennans-exit": {
        title: "Vic's Brennan's Exit Video",
        links: {
            youtube: "https://www.youtube.com/shorts/oO4kgmYivoQ",
            tiktok: "https://www.youtube.com/shorts/oO4kgmYivoQ",
            instagram: "https://www.youtube.com/shorts/oO4kgmYivoQ"
        },
        contributions: { // All producers (25% each)
            "trapp": 250,
            "rekha": 250,
            "jordan": 250,
            "sam": 250
        }
    }
};

// Legacy arrays for backward compatibility
export const sampleTimes: Date[] = viewData.times;

export const videoViewData: VideoViewData[] = Object.keys(videoMetadata).map(id => {
    const viewInfo = viewData.videos[id];
    if (!viewInfo) {
        throw new Error(`No view data found for video ${id}`);
    }
    return {
        id: id,
        youtubeViews: viewInfo.youtube,
        tiktokViews: viewInfo.tiktok,
        instagramViews: viewInfo.instagram
    };
});

// Combined video data for backward compatibility
export const videoData: Video[] = Object.keys(videoMetadata).map(id => {
    const metadata = videoMetadata[id];
    const viewInfo = viewData.videos[id];
    if (!viewInfo) {
        throw new Error(`No view data found for video ${id}`);
    }
    return {
        id: id,
        title: metadata.title,
        links: metadata.links,
        contributions: metadata.contributions,
        youtubeViews: viewInfo.youtube,
        tiktokViews: viewInfo.tiktok,
        instagramViews: viewInfo.instagram
    };
});

// Helper function to get producer by ID
export function getProducerById(id: string): Producer | undefined {
    return producers.find(producer => producer.id === id);
}

// Helper function to get producers from contributions
export function getProducersFromContributions(contributions: { [producerId: string]: number }): string[] {
    return Object.keys(contributions);
}

// Helper function to get video metadata by ID
export function getVideoMetadataById(id: string): { title: string; links: { youtube: string; tiktok: string; instagram: string }; contributions: { [producerId: string]: number } } | undefined {
    return videoMetadata[id];
}

// Helper function to get video view data by ID
export function getVideoViewDataById(id: string): VideoViewData | undefined {
    return videoViewData.find(video => video.id === id);
}

// Helper function to calculate producer views for a specific date and platform
export function getProducerViewsForDate(producerId: string, date: Date, platform: 'youtube' | 'tiktok' | 'instagram' | 'all' = 'all'): number {
    const dateIndex = viewData.times.indexOf(date);
    if (dateIndex === -1) return 0;
    
    let totalViews = 0;
    
    videoData.forEach(video => {
        const producers = getProducersFromContributions(video.contributions);
        if (producers.includes(producerId)) {
            const sharePercentage = 1 / producers.length; // Split equally between producers
            
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
    const latestIndex = viewData.times.length - 1;
    const latestYoutube = video.youtubeViews[latestIndex] || 0;
    const latestTiktok = video.tiktokViews[latestIndex] || 0;
    const latestInstagram = video.instagramViews ? video.instagramViews[latestIndex] || 0 : 0;
    return latestYoutube + latestTiktok + latestInstagram;
}

// Helper function to update video view data (for future HTTP integration)
export function updateVideoViewData(videoId: string, newViewData: Partial<VideoViewData>): void {
    const index = videoViewData.findIndex(vd => vd.id === videoId);
    if (index !== -1) {
        videoViewData[index] = { ...videoViewData[index], ...newViewData };
        // Update the combined videoData for backward compatibility
        const metadata = getVideoMetadataById(videoId);
        if (metadata) {
            const combinedIndex = videoData.findIndex(v => v.id === videoId);
            if (combinedIndex !== -1) {
                videoData[combinedIndex] = { ...metadata, ...videoViewData[index] };
            }
        }
    }
}

// Helper function to add new sample time (for future HTTP integration)
export function addSampleTime(date: Date): void {
    if (!viewData.times.find(time => time.getTime() === date.getTime())) {
        viewData.times.push(date);
        // Add zeros for all videos at the new time
        Object.keys(viewData.videos).forEach(videoId => {
            viewData.videos[videoId].youtube.push(0);
            viewData.videos[videoId].tiktok.push(0);
            viewData.videos[videoId].instagram.push(0);
        });
    }
}

// Helper function to update view data in the new structure (for future HTTP integration)
export function updateViewData(newViewData: Partial<ViewData>): void {
    if (newViewData.times) {
        viewData.times = newViewData.times;
    }
    if (newViewData.videos) {
        Object.assign(viewData.videos, newViewData.videos);
    }
}
