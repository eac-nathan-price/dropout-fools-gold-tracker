import rawViews from './views.json' with { type: "json" };
export const viewData: ViewData = {
    times: rawViews.times.map(time => new Date(time)),
    videos: rawViews.videos
};

export const PLATFORMS = ['youtube', 'tiktok', 'instagram'] as const;
export const EXTENDED_PLATFORMS = [...PLATFORMS, 'all'] as const;

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
        color: "#0088ff" // Bright Blue
    },
    "jordan": {
        id: "jordan", 
        name: "Jordan",
        fullName: "Jordan Myrick",
        color: "#8800ff" // Bright Purple
    },
    "sam": {
        id: "sam",
        name: "Sam",
        fullName: "Sam Reich",
        color: "#ff8c00" // Orange
    }
};

// Video metadata - static information that doesn't change
export const videoMetadata: VideoMetadataCollection = {
    "peel-robalino": {
        title: "Peel Robalino",
        fullTitle: "Paul Covers His Entire Body In Glue 🤯",
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
        fullTitle: "Anna Makes Strangers King for a Day 👑",
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
        fullTitle: "'Dimension 20: On a Bus' Season Premiere (DM'd by Katie Marovitch)",
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
        fullTitle: "Erika Roasts Sam with a Haircut 🪒",
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
        fullTitle: "Vote For Your Favorite Sexy Dropout Carwash ❤️",
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
        fullTitle: "Can Grant Get Over 40 Cracks At the Chiropractor? 💥",
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
        fullTitle: "Presenting: The Human Puppy Bowl 🏈🐶",
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
        fullTitle: "Jordan Takes the Breast Milk Taste Test Challenge 🥛",
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
        fullTitle: "Izzy Spends $3,000 On Animated Buttholes 🍑",
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
        fullTitle: "Why I'm Leaving Dropout",
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
