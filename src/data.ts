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
    link: string;
    producers: string[];
    youtubeViews: View[];
    tiktokViews: View[];
    instagramViews?: View[];
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

export const videoData: Video[] = [
    {
        id: "video_001",
        title: "Peel Robalino",
        link: "https://www.youtube.com/shorts/gMpx4A2lRTE",
        producers: ["trapp"], // Trapp only
        youtubeViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 50000 },
            { date: "2025-07-15T08:00:00-07:00", count: 78000 },
            { date: "2025-07-15T16:00:00-07:00", count: 113000 },
            { date: "2025-07-15T20:00:00-07:00", count: 130000 },
            { date: "2025-07-16T06:00:00-07:00", count: 151000 },
            { date: "2025-07-16T10:00:00-07:00", count: 158000 }
        ],
        tiktokViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 61700 },
            { date: "2025-07-15T08:00:00-07:00", count: 84300 },
            { date: "2025-07-15T16:00:00-07:00", count: 108800 },
            { date: "2025-07-15T20:00:00-07:00", count: 125600 },
            { date: "2025-07-16T06:00:00-07:00", count: 148000 },
            { date: "2025-07-16T10:00:00-07:00", count: 154900 }
        ],
        instagramViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 148000 },
            { date: "2025-07-15T08:00:00-07:00", count: 296000 },
            { date: "2025-07-15T16:00:00-07:00", count: 509000 },
            { date: "2025-07-15T20:00:00-07:00", count: 537000 },
            { date: "2025-07-16T06:00:00-07:00", count: 570000 },
            { date: "2025-07-16T10:00:00-07:00", count: 581000 }
        ]
    },
    {
        id: "video_002",
        title: "Anna's King for a Day",
        link: "https://www.youtube.com/shorts/UjHk90dxX20",
        producers: ["jordan"], // Jordan only
        youtubeViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 70000 },
            { date: "2025-07-15T08:00:00-07:00", count: 118000 },
            { date: "2025-07-15T16:00:00-07:00", count: 218000 },
            { date: "2025-07-15T20:00:00-07:00", count: 261000 },
            { date: "2025-07-16T06:00:00-07:00", count: 312000 },
            { date: "2025-07-16T10:00:00-07:00", count: 328000 }
        ],
        tiktokViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 127400 },
            { date: "2025-07-15T08:00:00-07:00", count: 255500 },
            { date: "2025-07-15T16:00:00-07:00", count: 354800 },
            { date: "2025-07-15T20:00:00-07:00", count: 391600 },
            { date: "2025-07-16T06:00:00-07:00", count: 435400 },
            { date: "2025-07-16T10:00:00-07:00", count: 456400 }
        ],
        instagramViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 114000 },
            { date: "2025-07-15T08:00:00-07:00", count: 229000 },
            { date: "2025-07-15T16:00:00-07:00", count: 396000 },
            { date: "2025-07-15T20:00:00-07:00", count: 428000 },
            { date: "2025-07-16T06:00:00-07:00", count: 466000 },
            { date: "2025-07-16T10:00:00-07:00", count: 482000 }
        ]
    },
    {
        id: "video_003",
        title: "Katie's D20 on a Bus",
        link: "https://www.youtube.com/shorts/5feqZBLXrMg",
        producers: ["rekha"], // Rekha only
        youtubeViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 201000 },
            { date: "2025-07-15T08:00:00-07:00", count: 403000 },
            { date: "2025-07-15T16:00:00-07:00", count: 636000 },
            { date: "2025-07-15T20:00:00-07:00", count: 709000 },
            { date: "2025-07-16T06:00:00-07:00", count: 804000 },
            { date: "2025-07-16T10:00:00-07:00", count: 841000 }
        ],
        tiktokViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 338900 },
            { date: "2025-07-15T08:00:00-07:00", count: 545200 },
            { date: "2025-07-15T16:00:00-07:00", count: 726200 },
            { date: "2025-07-15T20:00:00-07:00", count: 797300 },
            { date: "2025-07-16T06:00:00-07:00", count: 868000 },
            { date: "2025-07-16T10:00:00-07:00", count: 894400 }
        ],
        instagramViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 229000 },
            { date: "2025-07-15T08:00:00-07:00", count: 458000 },
            { date: "2025-07-15T16:00:00-07:00", count: 797000 },
            { date: "2025-07-15T20:00:00-07:00", count: 873000 },
            { date: "2025-07-16T06:00:00-07:00", count: 995000 },
            { date: "2025-07-16T10:00:00-07:00", count: 1000000 }
        ]
    },
    {
        id: "video_004",
        title: "Erika's Haircut",
        link: "https://www.youtube.com/shorts/wQVIfuNIc9I",
        producers: ["jordan"], // Jordan only
        youtubeViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 189000 },
            { date: "2025-07-15T08:00:00-07:00", count: 364700 },
            { date: "2025-07-15T16:00:00-07:00", count: 492000 },
            { date: "2025-07-15T20:00:00-07:00", count: 555000 },
            { date: "2025-07-16T06:00:00-07:00", count: 626000 },
            { date: "2025-07-16T10:00:00-07:00", count: 650000 }
        ],
        tiktokViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 103700 },
            { date: "2025-07-15T08:00:00-07:00", count: 145800 },
            { date: "2025-07-15T16:00:00-07:00", count: 181500 },
            { date: "2025-07-15T20:00:00-07:00", count: 199000 },
            { date: "2025-07-16T06:00:00-07:00", count: 219600 },
            { date: "2025-07-16T10:00:00-07:00", count: 227600 }
        ],
        instagramViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 113000 },
            { date: "2025-07-15T08:00:00-07:00", count: 226000 },
            { date: "2025-07-15T16:00:00-07:00", count: 390000 },
            { date: "2025-07-15T20:00:00-07:00", count: 415000 },
            { date: "2025-07-16T06:00:00-07:00", count: 442000 },
            { date: "2025-07-16T10:00:00-07:00", count: 451000 }
        ]
    },
    {
        id: "video_005",
        title: "Sephie's Sexy Car Wash",
        link: "https://www.youtube.com/shorts/HD5pyGbO_Is",
        producers: ["rekha", "jordan"], // Rekha and Jordan (50/50)
        youtubeViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 66000 },
            { date: "2025-07-15T08:00:00-07:00", count: 102000 },
            { date: "2025-07-15T16:00:00-07:00", count: 145000 },
            { date: "2025-07-15T20:00:00-07:00", count: 165000 },
            { date: "2025-07-16T06:00:00-07:00", count: 194000 },
            { date: "2025-07-16T10:00:00-07:00", count: 201000 }
        ],
        tiktokViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 73700 },
            { date: "2025-07-15T08:00:00-07:00", count: 97600 },
            { date: "2025-07-15T16:00:00-07:00", count: 122900 },
            { date: "2025-07-15T20:00:00-07:00", count: 136300 },
            { date: "2025-07-16T06:00:00-07:00", count: 150300 },
            { date: "2025-07-16T10:00:00-07:00", count: 155600 }
        ],
        instagramViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 162000 },
            { date: "2025-07-15T08:00:00-07:00", count: 323000 },
            { date: "2025-07-15T16:00:00-07:00", count: 553000 },
            { date: "2025-07-15T20:00:00-07:00", count: 585000 },
            { date: "2025-07-16T06:00:00-07:00", count: 625000 },
            { date: "2025-07-16T10:00:00-07:00", count: 638000 }
        ]
    },
    {
        id: "video_006",
        title: "Grant's Crack",
        link: "https://www.youtube.com/shorts/1lnl0jYln8s",
        producers: ["trapp"], // Trapp only
        youtubeViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 53000 },
            { date: "2025-07-15T08:00:00-07:00", count: 79000 },
            { date: "2025-07-15T16:00:00-07:00", count: 111000 },
            { date: "2025-07-15T20:00:00-07:00", count: 124000 },
            { date: "2025-07-16T06:00:00-07:00", count: 140000 },
            { date: "2025-07-16T10:00:00-07:00", count: 145000 }
        ],
        tiktokViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 64100 },
            { date: "2025-07-15T08:00:00-07:00", count: 97900 },
            { date: "2025-07-15T16:00:00-07:00", count: 136200 },
            { date: "2025-07-15T20:00:00-07:00", count: 155300 },
            { date: "2025-07-16T06:00:00-07:00", count: 179400 },
            { date: "2025-07-16T10:00:00-07:00", count: 190300 }
        ],
        instagramViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 86000 },
            { date: "2025-07-15T08:00:00-07:00", count: 172000 },
            { date: "2025-07-15T16:00:00-07:00", count: 296000 },
            { date: "2025-07-15T20:00:00-07:00", count: 314000 },
            { date: "2025-07-16T06:00:00-07:00", count: 331000 },
            { date: "2025-07-16T10:00:00-07:00", count: 337000 }
        ]
    },
    {
        id: "video_007",
        title: "Jonny's Human Puppy Bowl",
        link: "https://www.youtube.com/shorts/aagwlycxv_k",
        producers: ["trapp", "rekha"], // Trapp and Rekha (50/50)
        youtubeViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 46000 },
            { date: "2025-07-15T08:00:00-07:00", count: 71000 },
            { date: "2025-07-15T16:00:00-07:00", count: 104000 },
            { date: "2025-07-15T20:00:00-07:00", count: 117000 },
            { date: "2025-07-16T06:00:00-07:00", count: 134000 },
            { date: "2025-07-16T10:00:00-07:00", count: 139000 }
        ],
        tiktokViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 89600 },
            { date: "2025-07-15T08:00:00-07:00", count: 130700 },
            { date: "2025-07-15T16:00:00-07:00", count: 165400 },
            { date: "2025-07-15T20:00:00-07:00", count: 178400 },
            { date: "2025-07-16T06:00:00-07:00", count: 192500 },
            { date: "2025-07-16T10:00:00-07:00", count: 197300 }
        ],
        instagramViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 68000 },
            { date: "2025-07-15T08:00:00-07:00", count: 136000 },
            { date: "2025-07-15T16:00:00-07:00", count: 234000 },
            { date: "2025-07-15T20:00:00-07:00", count: 251000 },
            { date: "2025-07-16T06:00:00-07:00", count: 266000 },
            { date: "2025-07-16T10:00:00-07:00", count: 271000 }
        ]
    },
    {
        id: "video_008",
        title: "Lily & Izzy's Milk Taste Test",
        link: "https://www.youtube.com/shorts/nfwmaVlp_hY",
        producers: ["jordan"], // Jordan only
        youtubeViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 66000 },
            { date: "2025-07-15T08:00:00-07:00", count: 107000 },
            { date: "2025-07-15T16:00:00-07:00", count: 158000 },
            { date: "2025-07-15T20:00:00-07:00", count: 181000 },
            { date: "2025-07-16T06:00:00-07:00", count: 208000 },
            { date: "2025-07-16T10:00:00-07:00", count: 217000 }
        ],
        tiktokViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 292000 },
            { date: "2025-07-15T08:00:00-07:00", count: 422800 },
            { date: "2025-07-15T16:00:00-07:00", count: 570100 },
            { date: "2025-07-15T20:00:00-07:00", count: 636700 },
            { date: "2025-07-16T06:00:00-07:00", count: 696600 },
            { date: "2025-07-16T10:00:00-07:00", count: 725500 }
        ],
        instagramViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 420000 },
            { date: "2025-07-15T08:00:00-07:00", count: 840000 },
            { date: "2025-07-15T16:00:00-07:00", count: 1500000 },
            { date: "2025-07-15T20:00:00-07:00", count: 1700000 },
            { date: "2025-07-16T06:00:00-07:00", count: 2000000 },
            { date: "2025-07-16T10:00:00-07:00", count: 2100000 }
        ]
    },
    {
        id: "video_009",
        title: "Izzy's Buttholes",
        link: "https://www.youtube.com/shorts/Wm8SMsmWCts",
        producers: ["trapp", "rekha"], // Trapp and Rekha (50/50)
        youtubeViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 186000 },
            { date: "2025-07-15T08:00:00-07:00", count: 372000 },
            { date: "2025-07-15T16:00:00-07:00", count: 654000 },
            { date: "2025-07-15T20:00:00-07:00", count: 769000 },
            { date: "2025-07-16T06:00:00-07:00", count: 912000 },
            { date: "2025-07-16T10:00:00-07:00", count: 957000 }
        ],
        tiktokViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 90300 },
            { date: "2025-07-15T08:00:00-07:00", count: 125200 },
            { date: "2025-07-15T16:00:00-07:00", count: 167500 },
            { date: "2025-07-15T20:00:00-07:00", count: 189500 },
            { date: "2025-07-16T06:00:00-07:00", count: 206700 },
            { date: "2025-07-16T10:00:00-07:00", count: 210800 }
        ],
        instagramViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 114000 },
            { date: "2025-07-15T08:00:00-07:00", count: 227000 },
            { date: "2025-07-15T16:00:00-07:00", count: 392000 },
            { date: "2025-07-15T20:00:00-07:00", count: 424000 },
            { date: "2025-07-16T06:00:00-07:00", count: 453000 },
            { date: "2025-07-16T10:00:00-07:00", count: 465000 }
        ]
    },
    {
        id: "video_010",
        title: "Vic's Brennan's Exit Video",
        link: "https://www.youtube.com/shorts/oO4kgmYivoQ",
        producers: ["trapp", "rekha", "jordan", "sam"], // All producers (25% each)
        youtubeViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 415000 },
            { date: "2025-07-15T08:00:00-07:00", count: 825000 },
            { date: "2025-07-15T16:00:00-07:00", count: 1300000 },
            { date: "2025-07-15T20:00:00-07:00", count: 1600000 },
            { date: "2025-07-16T06:00:00-07:00", count: 1800000 },
            { date: "2025-07-16T10:00:00-07:00", count: 1900000 }
        ],
        tiktokViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 881200 },
            { date: "2025-07-15T08:00:00-07:00", count: 1500000 },
            { date: "2025-07-15T16:00:00-07:00", count: 1900000 },
            { date: "2025-07-15T20:00:00-07:00", count: 2100000 },
            { date: "2025-07-16T06:00:00-07:00", count: 2200000 },
            { date: "2025-07-16T10:00:00-07:00", count: 2300000 }
        ],
        instagramViews: [
            { date: "2025-07-14T16:00:00-07:00", count: 0 },
            { date: "2025-07-15T00:00:00-07:00", count: 540000 },
            { date: "2025-07-15T08:00:00-07:00", count: 1080000 },
            { date: "2025-07-15T16:00:00-07:00", count: 1800000 },
            { date: "2025-07-15T20:00:00-07:00", count: 2000000 },
            { date: "2025-07-16T06:00:00-07:00", count: 2200000 },
            { date: "2025-07-16T10:00:00-07:00", count: 2200000 }
        ]
    }
];

// Helper function to get all unique dates from all videos
export function getAllDates(): string[] {
    const allDates = new Set<string>();
    videoData.forEach(video => {
        video.youtubeViews.forEach(view => allDates.add(view.date));
        video.tiktokViews.forEach(view => allDates.add(view.date));
        if (video.instagramViews) {
            video.instagramViews.forEach(view => allDates.add(view.date));
        }
    });
    return Array.from(allDates).sort();
}

// Helper function to get producer by ID
export function getProducerById(id: string): Producer | undefined {
    return producers.find(producer => producer.id === id);
}

// Helper function to calculate producer views for a specific date and platform
export function getProducerViewsForDate(producerId: string, date: string, platform: 'youtube' | 'tiktok' | 'instagram' | 'all' = 'all'): number {
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
            
            if ((platform === 'instagram' || platform === 'all') && video.instagramViews) {
                const instagramView = video.instagramViews.find(v => v.date === date);
                if (instagramView) {
                    totalViews += instagramView.count * sharePercentage;
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
    const latestInstagram = video.instagramViews ? video.instagramViews[video.instagramViews.length - 1]?.count || 0 : 0;
    return latestYoutube + latestTiktok + latestInstagram;
}

// Helper function to get total views for a video
export function getTotalViews(video: Video): number {
    const youtubeTotal = video.youtubeViews.reduce((sum, view) => sum + view.count, 0);
    const tiktokTotal = video.tiktokViews.reduce((sum, view) => sum + view.count, 0);
    const instagramTotal = video.instagramViews ? video.instagramViews.reduce((sum, view) => sum + view.count, 0) : 0;
    return youtubeTotal + tiktokTotal + instagramTotal;
} 