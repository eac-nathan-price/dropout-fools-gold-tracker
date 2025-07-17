export const PLATFORMS = ['youtube', 'tiktok', 'instagram'] as const;
export const EXTENDED_PLATFORMS = ['all', ...PLATFORMS] as const;

// Producer data structure
export const producers: { [id: string]: Producer } = {
    "trapp": {
        id: "trapp",
        name: "Trapp",
        fullName: "Mike Trapp",
        color: "#10b981" // Emerald
    },
    "rekha": {
        id: "rekha", 
        name: "Rekha",
        fullName: "Rekha Shankar",
        color: "#06b6d4" // Cyan
    },
    "jordan": {
        id: "jordan", 
        name: "Jordan",
        fullName: "Jordan Myrick",
        color: "#6366f1" // Indigo
    },
    "sam": {
        id: "sam",
        name: "Sam",
        fullName: "Sam Reich",
        color: "#8b5cf6" // Purple
    }
};

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
        new Date("2025-07-16T14:00:00-07:00"),
        new Date("2025-07-16T16:00:00-07:00"),
        new Date("2025-07-16T18:00:00-07:00"),
        new Date("2025-07-16T20:00:00-07:00"),
        new Date("2025-07-16T22:00:00-07:00"),
        new Date("2025-07-17T00:00:00-07:00")
    ],
    videos: {
        "peel-robalino": {
            youtube: [0, 50000, 78000, 113000, 130000, 151000, 158000, 166000, 171000, 175000, 179000, 182000, 186000],
            tiktok: [0, 61700, 84300, 108800, 125600, 148000, 154900, 162000, 165700, 168900, 173900, 176700, 179200],
            instagram: [0, 148000, 296000, 509000, 537000, 570000, 581000, 591000, 596000, 600000, 604000, 607000, 609000]
        },
        "annas-king": {
            youtube: [0, 70000, 118000, 218000, 261000, 312000, 328000, 356000, 368000, 375000, 381000, 387000, 393000],
            tiktok: [0, 127400, 255500, 354800, 391600, 435400, 456400, 473500, 482500, 490100, 499000, 504800, 508300],
            instagram: [0, 114000, 229000, 396000, 428000, 466000, 482000, 505000, 517000, 523000, 531000, 537000, 542000]
        },
        "katies-d20": {
            youtube: [0, 201000, 403000, 636000, 709000, 804000, 841000, 878000, 901000, 918000, 933000, 945000, 958000],
            tiktok: [0, 338900, 545200, 726200, 797300, 868000, 894400, 925200, 942800, 955300, 971400, 980300, 986900],
            instagram: [0, 229000, 458000, 797000, 873000, 995000, 1000000, 1025000, 1050000, 1075000, 1100000, 1100000, 1100000]
        },
        "erikas-haircut": {
            youtube: [0, 189000, 364700, 492000, 555000, 626000, 650000, 676000, 691000, 701000, 708000, 714000, 722000],
            tiktok: [0, 103700, 145800, 181500, 199000, 219600, 227600, 235900, 240100, 243600, 248000, 250200, 251600],
            instagram: [0, 113000, 226000, 390000, 415000, 442000, 451000, 460000, 466000, 469000, 474000, 477000, 479000]
        },
        "sephies-car-wash": {
            youtube: [0, 66000, 102000, 145000, 165000, 194000, 201000, 210000, 216000, 220000, 223000, 227000, 231000],
            tiktok: [0, 73700, 97600, 122900, 136300, 150300, 155600, 160900, 163900, 166500, 170100, 172300, 174100],
            instagram: [0, 162000, 323000, 553000, 585000, 625000, 638000, 651000, 659000, 664000, 671000, 674000, 677000]
        },
        "grants-crack": {
            youtube: [0, 53000, 79000, 111000, 124000, 140000, 145000, 151000, 156000, 159000, 161000, 164000, 167000],
            tiktok: [0, 64100, 97900, 136200, 155300, 179400, 190300, 201100, 206100, 210200, 215300, 218400, 220500],
            instagram: [0, 86000, 172000, 296000, 314000, 331000, 337000, 342000, 346000, 349000, 352000, 355000, 356000]
        },
        "jonnys-puppy-bowl": {
            youtube: [0, 46000, 71000, 104000, 117000, 134000, 139000, 145000, 148000, 151000, 153000, 155000, 158000],
            tiktok: [0, 89600, 130700, 165400, 178400, 192500, 197300, 201900, 204500, 206100, 208300, 209600, 210800],
            instagram: [0, 68000, 136000, 234000, 251000, 266000, 271000, 277000, 280000, 282000, 286000, 288000, 289000]
        },
        "lily-izzys-milk": {
            youtube: [0, 66000, 107000, 158000, 181000, 208000, 217000, 226000, 233000, 237000, 242000, 247000, 252000],
            tiktok: [0, 292000, 422800, 570100, 636700, 696600, 725500, 765700, 787300, 804300, 822500, 834200, 843200],
            instagram: [0, 420000, 840000, 1500000, 1700000, 2000000, 2100000, 2200000, 2250000, 2300000, 2300000, 2300000, 2300000]
        },
        "izzys-buttholes": {
            youtube: [0, 186000, 372000, 654000, 769000, 912000, 957000, 1000000, 1025000, 1050000, 1075000, 1100000, 1100000],
            tiktok: [0, 90300, 125200, 167500, 189500, 206700, 210800, 214700, 217100, 218900, 221400, 222900, 224000],
            instagram: [0, 114000, 227000, 392000, 424000, 453000, 465000, 475000, 481000, 485000, 491000, 494000, 497000]
        },
        "vics-brennans-exit": {
            youtube: [0, 415000, 825000, 1300000, 1600000, 1800000, 1900000, 1900000, 2000000, 2000000, 2000000, 2100000, 2100000],
            tiktok: [0, 881200, 1500000, 1900000, 2100000, 2200000, 2300000, 2300000, 2400000, 2400000, 2400000, 2400000, 2400000],
            instagram: [0, 540000, 1080000, 1800000, 2000000, 2200000, 2200000, 2300000, 2300000, 2300000, 2300000, 2300000, 2400000]
        }
    }
};

// Video metadata - static information that doesn't change
export const videoMetadata: VideoMetadataCollection = {
    "peel-robalino": {
        title: "Peel Robalino",
        links: {
            youtube: "https://www.youtube.com/shorts/gMpx4A2lRTE",
            tiktok: "https://www.tiktok.com/@gamechangershow/video/7527082801120677133",
            instagram: "https://www.instagram.com/reel/DMG0jk2tbeR/"
        },
        contributions: { // Trapp only
            "trapp": 550
        }
    },
    "annas-king": {
        title: "Anna's King for a Day",
        links: {
            youtube: "https://www.youtube.com/shorts/UjHk90dxX20",
            tiktok: "https://www.tiktok.com/@gamechangershow/video/7527078952171523341",
            instagram: "https://www.instagram.com/reel/DMGy8RuNDqI/"
        },
        contributions: { // Jordan only
            "jordan": 1500
        }
    },
    "katies-d20": {
        title: "Katie's D20 on a Bus",
        links: {
            youtube: "https://www.youtube.com/shorts/5feqZBLXrMg",
            tiktok: "https://www.tiktok.com/@gamechangershow/video/7527080453610704183",
            instagram: "https://www.instagram.com/reel/DMGzkMNNMXg/"
        },
        contributions: { // Rekha only
            "rekha": 3500
        }
    },
    "erikas-haircut": {
        title: "Erika's Haircut",
        links: {
            youtube: "https://www.youtube.com/shorts/wQVIfuNIc9I",
            tiktok: "https://www.tiktok.com/@gamechangershow/video/7527086113614318862",
            instagram: "https://www.instagram.com/reel/DMG2ELMvZdg/"
        },
        contributions: { // Jordan only
            "jordan": 506
        }
    },
    "sephies-car-wash": {
        title: "Sephie's Sexy Car Wash",
        links: {
            youtube: "https://www.youtube.com/shorts/HD5pyGbO_Is",
            tiktok: "https://www.tiktok.com/@gamechangershow/video/7527082014449716494",
            instagram: "https://www.instagram.com/reel/DMG0OcPpSQO/"
        },
        contributions: { // Rekha and Jordan (50/50)
            "rekha": 1850,
            "jordan": 1850
        }
    },
    "grants-crack": {
        title: "Grant's Crack",
        links: {
            youtube: "https://www.youtube.com/shorts/1lnl0jYln8s",
            tiktok: "https://www.tiktok.com/@gamechangershow/video/7527083827689229582",
            instagram: "https://www.instagram.com/reel/DMG1BIPM41Z/"
        },
        contributions: { // Trapp only
            "trapp": 1201
        }
    },
    "jonnys-puppy-bowl": {
        title: "Jonny's Human Puppy Bowl",
        links: {
            youtube: "https://www.youtube.com/shorts/aagwlycxv_k",
            tiktok: "https://www.tiktok.com/@gamechangershow/video/7527084871580142861",
            instagram: "https://www.instagram.com/reel/DMG1d62Mhmf/"
        },
        contributions: { // Trapp and Rekha (50/50)
            "trapp": 2500,
            "rekha": 2500
        }
    },
    "lily-izzys-milk": {
        title: "Lily & Izzy's Milk Taste Test",
        links: {
            youtube: "https://www.youtube.com/shorts/nfwmaVlp_hY",
            tiktok: "https://www.tiktok.com/@gamechangershow/video/7527085610322890039",
            instagram: "https://www.instagram.com/reel/DMG11avO8qa/"
        },
        contributions: { // Jordan only
            "jordan": 6144
        }
    },
    "izzys-buttholes": {
        title: "Izzy's Buttholes",
        links: {
            youtube: "https://www.youtube.com/shorts/Wm8SMsmWCts",
            tiktok: "https://www.tiktok.com/@gamechangershow/video/7527086642415422734",
            instagram: "https://www.instagram.com/reel/DMG2SXRMojo/"
        },
        contributions: { // Trapp and Rekha (50/50)
            "trapp": 2000,
            "rekha": 2000
        }
    },
    "vics-brennans-exit": {
        title: "Vic's Brennan's Exit Video",
        links: {
            youtube: "https://www.youtube.com/shorts/oO4kgmYivoQ",
            tiktok: "https://www.tiktok.com/@gamechangershow/video/7527087942339267895",
            instagram: "https://www.instagram.com/reel/DMG24Zjyg1j/"
        },
        contributions: { // All producers (25% each)
            "trapp": 3749,
            "rekha": 150,
            "jordan": 0,
            "sam": 16101
        }
    }
};

// Platform configuration
export const PLATFORM_CONFIG: Record<ExtendedPlatform, PlatformConfig> = {
    youtube: {
        label: 'YouTube',
        borderColor: '#ff0000',
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        pointBackgroundColor: '#ff0000'
    },
    tiktok: {
        label: 'TikTok',
        borderColor: '#ffffff',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        pointBackgroundColor: '#ffffff'
    },
    instagram: {
        label: 'Instagram',
        borderColor: '#ff69b4',
        backgroundColor: 'rgba(255, 105, 180, 0.2)',
        pointBackgroundColor: '#ff69b4'
    },
    all: {
        label: 'Total',
        borderColor: '#ffd700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        pointBackgroundColor: '#ffd700',
        borderWidth: 3,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBorderWidth: 2
    }
};

// Chart.js configuration defaults
export const CHART_DEFAULTS = {
    base: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: false
        }
    },
    scales: {
        x: {
            type: 'time' as const,
            time: {
                unit: 'day' as const,
                displayFormats: {
                    day: 'MMM d'
                }
            },
            grid: {
                color: '#333333'
            },
            ticks: {
                color: '#cccccc',
                font: {
                    size: 12
                }
            }
        },
        y: {
            grid: {
                color: '#333333'
            },
            ticks: {
                color: '#cccccc',
                callback: function(value: any) {
                    return formatNumber(typeof value === 'number' ? value : Number(value));
                }
            }
        }
    },
    tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: '#2d2d2d',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#ffd700',
        borderWidth: 1,
        callbacks: {
            title: function(context: any) {
                const date = new Date(context[0].parsed.x);
                const timeString = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
                const dateString = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
                return `${dateString}, ${timeString}`;
            }
        }
    },
    dataset: {
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBorderColor: '#1a1a1a',
        pointBorderWidth: 1,
        pointRadius: 3,
        pointHoverRadius: 5
    },
    legend: {
        display: true,
        position: 'top' as const,
        labels: {
            color: '#cccccc',
            usePointStyle: true,
            padding: 15
        }
    }
};

export const PRODUCER_CARD_VIEWS_TEMPLATE: ExtendedPlatformData<string> = { all: '# Views', youtube: 'YT: #', tiktok: 'TT: #', instagram: 'IR: #' };
export function populateProducerCardViews(element: Element | null, platform: ExtendedPlatform, views: number): void {
    if (element) element.textContent = PRODUCER_CARD_VIEWS_TEMPLATE[platform].replace('#', formatNumber(views));
}

export const videoViewData: VideoViewData[] = Object.keys(videoMetadata).map(id => {
    const viewInfo = viewData.videos[id];
    if (!viewInfo) throw new Error(`No view data found for video ${id}`);
    return { id: id, ...viewInfo };
});

// Combined video data for backward compatibility
export const videoData: Video[] = Object.keys(videoMetadata).map(id => {
    const metadata = videoMetadata[id];
    const viewInfo = viewData.videos[id];
    if (!viewInfo) throw new Error(`No view data found for video ${id}`);
    return { id: id, ...metadata, ...viewInfo };
});

// Helper function to get platform views for a video at a specific index
export function getPlatformViews(video: Video, index: number): ExtendedPlatformData<number> {
    return {
        youtube: video.youtube[index] || 0,
        tiktok: video.tiktok[index] || 0,
        instagram: video.instagram[index] || 0,
        all: (video.youtube[index] || 0) + (video.tiktok[index] || 0) + (video.instagram[index] || 0)
    };
}

// Helper function to get platform views for a video at the latest index
export function getLatestPlatformViews(video: Video): ExtendedPlatformData<number> {
    const latestIndex = viewData.times.length - 1;
    return getPlatformViews(video, latestIndex);
}

// Helper function to calculate producer views for a specific date and platform
export function getProducerViewsForDate(producerId: string, date: Date, platform: ExtendedPlatform = 'all'): number {
    const dateIndex = viewData.times.indexOf(date);
    if (dateIndex === -1) return 0;
    let totalViews = 0;
    videoData.forEach(video => {
        const producers = Object.keys(video.contributions);
        if (producers.includes(producerId)) {
            const sharePercentage = 1 / producers.length; // Split equally between producers
            const platformViews = getPlatformViews(video, dateIndex);
            totalViews += platformViews[platform] * sharePercentage;
        }
    });
    return Math.round(totalViews);
}

// Helper function to format numbers with K, M, B suffixes
export function formatNumber(num: number): string {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// Helper function to create an object from keys and a mapping function
export function objectFromEntries<K extends string, T>(keys: K[], mapFn: (key: K) => T): Record<K, T> {
    return Object.fromEntries(keys.map(key => [key, mapFn(key)])) as Record<K, T>;
}
