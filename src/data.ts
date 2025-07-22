import rawViews from './views.json' with { type: "json" };

// API response type for flattened endpoint
type FlattenedApiResponse = {
    times: string[];
    videos: {
        [videoId: string]: {
            youtube: number[];
            tiktok: number[];
            instagram: number[];
        };
    };
};

// Data service class to handle real-time data fetching
export class DataService {
    private static instance: DataService;
    private currentData: ViewData;
    private isInitialized = false;
    private initPromise: Promise<void> | null = null;
    private lastSuccessfulApiRequest: Date | null = null;
    private onDataUpdateCallbacks: (() => void)[] = [];

    private constructor() {
        // Initialize with local data as fallback
        this.currentData = {
            times: rawViews.times.map(time => new Date(time)),
            videos: rawViews.videos
        };
    }

    static getInstance(): DataService {
        if (!DataService.instance) {
            DataService.instance = new DataService();
        }
        return DataService.instance;
    }

    async initialize(): Promise<void> {
        if (this.isInitialized) return;
        if (this.initPromise) return this.initPromise;

        // Mark as initialized immediately so local data shows right away
        this.isInitialized = true;
        
        // Start API request in background (don't await it)
        this.initPromise = this.fetchRealTimeData();
    }

    private async fetchRealTimeData(): Promise<void> {
        // Show progress bar
        this.showProgressBar();
        
        try {
            // Try direct fetch first
            let response;
            try {
                response = await fetch('https://fg-api-server-746154731592.us-west1.run.app/viewcounts/flattened', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                    mode: 'cors'
                });
            } catch (corsError) {
                console.log('CORS error detected:', corsError);
                // If direct fetch fails due to CORS, we'll use the fallback data
                console.warn('CORS prevents direct API access, using local fallback');
                return;
            }
            
            if (!response.ok) {
                console.warn('Failed to fetch real-time data, using local fallback');
                return;
            }

            const apiData: FlattenedApiResponse = await response.json();
            if (!apiData.times || !apiData.videos) {
                console.warn('Invalid data received from API, using local fallback');
                return;
            }

            // Video ID mapping from API format to our format (updated for new API keys)
            const videoIdMapping: { [key: string]: string } = {
                'peel_robalino': 'peel-robalino',
                'annas_king_for_a_day': 'annas-king',
                'katies_d20_on_a_bus': 'katies-d20',
                'erikas_haircut': 'erikas-haircut',
                'sephies_sexy_car_wash': 'sephies-car-wash',
                'grants_crack': 'grants-crack',
                'jonnys_human_puppy_bowl': 'jonnys-puppy-bowl',
                'lily_and_izzys_milk_taste_test': 'lily-izzys-milk',
                'izzys_buttholes': 'izzys-buttholes',
                'vics_brennans_exit_video': 'vics-brennans-exit'
            };

            const apiTimes = apiData.times.map(time => new Date(time));
            const numTimestamps = apiTimes.length;

            const transformedVideos: { [videoId: string]: PlatformData<number[]> } = {};
            Object.entries(apiData.videos).forEach(([apiVideoId, videoData]) => {
                const videoId = videoIdMapping[apiVideoId];
                if (!videoId) {
                    console.warn(`Unknown video ID from API: ${apiVideoId}`);
                    return;
                }
                // Always use the last N values, where N = number of timestamps
                transformedVideos[videoId] = {
                    youtube: videoData.youtube.slice(-numTimestamps),
                    tiktok: videoData.tiktok.slice(-numTimestamps),
                    instagram: videoData.instagram.slice(-numTimestamps)
                };
            });

            this.currentData = {
                times: apiTimes,
                videos: transformedVideos
            };

            // Debug: Compare video keys after API load
            // @ts-ignore
            import('./data').then(module => {
                const videoData = module.videoData || [];
                const apiKeys = Object.keys(transformedVideos);
                const metaIds = videoData.map((v: any) => v.id);
                console.log('API video keys:', apiKeys);
                console.log('videoData IDs:', metaIds);
                const missingInApi = metaIds.filter((id: string) => !apiKeys.includes(id));
                const extraInApi = apiKeys.filter((id: string) => !metaIds.includes(id));
                if (missingInApi.length > 0) {
                    console.warn('IDs in videoData but missing in API data:', missingInApi);
                }
                if (extraInApi.length > 0) {
                    console.warn('IDs in API data but not in videoData:', extraInApi);
                }
                if (missingInApi.length === 0 && extraInApi.length === 0) {
                    console.log('✅ API video keys and videoData IDs match.');
                }
            });

            // Track successful API request
            this.lastSuccessfulApiRequest = new Date();

            console.log('Successfully updated data with real-time information');
            
            // Notify listeners that data has been updated
            this.notifyDataUpdate();
            
            // Debug: Compare API data with local views.json
            this.debugCompareData(apiData);
            
            // Debug: Log data switching details
            this.debugDataSwitch();
            
            // Log the data switch for transparency
            console.log(`🔄 Data switch: ${this.currentData.times.length} timestamps, ${Object.keys(this.currentData.videos).length} videos`);
        } catch (error) {
            console.warn('Error fetching real-time data, using local fallback:', error);
        } finally {
            // Hide progress bar
            this.hideProgressBar();
        }
    }

    getFooterText(): string {
        if (this.lastSuccessfulApiRequest) {
            const timeString = this.lastSuccessfulApiRequest.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
            return `Receiving automatic updates. Last checked: ${timeString}`;
        } else {
            // Fall back to the last data point time
            const lastDataPoint = this.currentData.times[this.currentData.times.length - 1];
            if (lastDataPoint) {
                const date = new Date(lastDataPoint);
                return `${date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })} at ${date.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                })} (offline mode)`;
            }
            return 'Loading...';
        }
    }

    getData(): ViewData {
        return this.currentData;
    }

    async refreshData(): Promise<void> {
        await this.fetchRealTimeData();
    }

    isDataInitialized(): boolean {
        return this.isInitialized;
    }

    onDataUpdate(callback: () => void): void {
        this.onDataUpdateCallbacks.push(callback);
    }

    private notifyDataUpdate(): void {
        this.onDataUpdateCallbacks.forEach(callback => callback());
    }

    async testApiConnectivity(): Promise<boolean> {
        try {
            const response = await fetch('https://fg-api-server-746154731592.us-west1.run.app/viewcounts/flattened', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                mode: 'cors'
            });
            return response.ok;
        } catch (error) {
            console.log('API connectivity test failed:', error);
            // Log more details about the error
            if (error instanceof TypeError && error.message.includes('CORS')) {
                console.log('This is a CORS error - the server needs to allow cross-origin requests');
            }
            return false;
        }
    }

    // Test method to help debug CORS issues
    async debugApiAccess(): Promise<void> {
        console.log('Testing API access...');
        
        // Test 1: Simple fetch without CORS mode
        try {
            const response1 = await fetch('https://fg-api-server-746154731592.us-west1.run.app/viewcounts/flattened');
            console.log('Test 1 (no CORS mode):', response1.ok ? 'SUCCESS' : 'FAILED', response1.status);
        } catch (error) {
            console.log('Test 1 (no CORS mode): FAILED', error);
        }
        
        // Test 2: With CORS mode
        try {
            const response2 = await fetch('https://fg-api-server-746154731592.us-west1.run.app/viewcounts/flattened', {
                mode: 'cors'
            });
            console.log('Test 2 (with CORS mode):', response2.ok ? 'SUCCESS' : 'FAILED', response2.status);
        } catch (error) {
            console.log('Test 2 (with CORS mode): FAILED', error);
        }
        
        // Test 3: Check if server responds at all
        try {
            const response3 = await fetch('https://fg-api-server-746154731592.us-west1.run.app/');
            console.log('Test 3 (server root):', response3.ok ? 'SUCCESS' : 'FAILED', response3.status);
        } catch (error) {
            console.log('Test 3 (server root): FAILED', error);
        }
    }

    // Debug method to compare API data with local views.json
    private debugCompareData(apiData: FlattenedApiResponse): void {
        console.log('🔍 DEBUG: Comparing API data with local views.json...');
        
        const localData = {
            times: rawViews.times.map(time => new Date(time)),
            videos: rawViews.videos
        };
        
        const apiTimes = apiData.times.map(time => new Date(time));
        
        // Check for timestamps in views.json that aren't in API response
        const missingTimestamps = localData.times.filter(localTime => 
            !apiTimes.some(apiTime => apiTime.getTime() === localTime.getTime())
        );
        
        if (missingTimestamps.length > 0) {
            console.log('⚠️  Timestamps in views.json but NOT in API response:', missingTimestamps.map(t => t.toISOString()));
        } else {
            console.log('✅ All timestamps from views.json are present in API response');
        }
        
        // Check for timestamps in API response that aren't in views.json
        const newTimestamps = apiTimes.filter(apiTime => 
            !localData.times.some(localTime => localTime.getTime() === apiTime.getTime())
        );
        
        if (newTimestamps.length > 0) {
            console.log('🆕 New timestamps in API response:', newTimestamps.map(t => t.toISOString()));
        }
        
        // Find common timestamps to compare data
        const commonTimestamps = localData.times.filter(localTime => 
            apiTimes.some(apiTime => apiTime.getTime() === localTime.getTime())
        );
        
        console.log(`📊 Found ${commonTimestamps.length} common timestamps to compare`);
        
        // Video ID mapping for comparison
        const videoIdMapping: { [key: string]: string } = {
            'peel_robalino': 'peel-robalino',
            'annas_king_for_a_day': 'annas-king',
            'katies_d20_on_a_bus': 'katies-d20',
            'erikas_haircut': 'erikas-haircut',
            'sephies_sexy_car_wash': 'sephies-car-wash',
            'grants_crack': 'grants-crack',
            'jonnys_human_puppy_bowl': 'jonnys-puppy-bowl',
            'lily_and_izzys_milk_taste_test': 'lily-izzys-milk',
            'izzys_buttholes': 'izzys-buttholes',
            'vics_brennans_exit_video': 'vics-brennans-exit'
        };
        
        // Compare data for each video at common timestamps
        Object.entries(videoIdMapping).forEach(([apiVideoId, localVideoId]) => {
            const apiVideoData = apiData.videos[apiVideoId as keyof typeof apiData.videos];
            const localVideoData = localData.videos[localVideoId as keyof typeof localData.videos];
            
            if (!apiVideoData || !localVideoData) {
                console.log(`❌ Missing data for video: ${localVideoId}`);
                return;
            }
            
            let hasDifferences = false;
            
            // Compare each common timestamp
            commonTimestamps.forEach((timestamp, index) => {
                const localIndex = localData.times.findIndex(t => t.getTime() === timestamp.getTime());
                const apiIndex = apiTimes.findIndex(t => t.getTime() === timestamp.getTime());
                
                if (localIndex !== -1 && apiIndex !== -1) {
                    const platforms: ('youtube' | 'tiktok' | 'instagram')[] = ['youtube', 'tiktok', 'instagram'];
                    
                    platforms.forEach(platform => {
                        const localValue = localVideoData[platform][localIndex];
                        const apiValue = apiVideoData[platform][apiIndex];
                        
                        if (localValue !== apiValue) {
                            if (!hasDifferences) {
                                console.log(`\n🔍 Differences found for video: ${localVideoId}`);
                                hasDifferences = true;
                            }
                            console.log(`  ${timestamp.toISOString()} - ${platform}: local=${localValue}, api=${apiValue} (diff: ${apiValue - localValue})`);
                        }
                    });
                }
            });
            
            if (!hasDifferences) {
                console.log(`✅ No differences found for video: ${localVideoId}`);
            }
        });
        
        console.log('🔍 DEBUG: Data comparison complete');
    }

    // Debug method to log data switching details
    private debugDataSwitch(): void {
        console.log('🔄 DEBUG: Data switching details...');
        
        const localData = {
            times: rawViews.times.map(time => new Date(time)),
            videos: rawViews.videos
        };
        
        console.log('📊 Local data times:', localData.times.map(t => t.toISOString()));
        console.log('📊 API data times:', this.currentData.times.map(t => t.toISOString()));
        
        console.log('📈 Local data length:', localData.times.length);
        console.log('📈 API data length:', this.currentData.times.length);
        
        // Check for timezone differences
        const localFirstTime = localData.times[0];
        const apiFirstTime = this.currentData.times[0];
        if (localFirstTime && apiFirstTime) {
            console.log('🕐 Local first time:', localFirstTime.toISOString(), 'Local timezone offset:', localFirstTime.getTimezoneOffset());
            console.log('🕐 API first time:', apiFirstTime.toISOString(), 'API timezone offset:', apiFirstTime.getTimezoneOffset());
        }
        
        // Check for any video data differences
        Object.keys(localData.videos).forEach(videoId => {
            const localVideo = localData.videos[videoId as keyof typeof localData.videos];
            const apiVideo = this.currentData.videos[videoId as keyof typeof this.currentData.videos];
            
            if (localVideo && apiVideo) {
                const localLength = localVideo.youtube.length;
                const apiLength = apiVideo.youtube.length;
                console.log(`📺 ${videoId}: Local array length=${localLength}, API array length=${apiLength}`);
                
                if (localLength !== apiLength) {
                    console.log(`⚠️  Array length mismatch for ${videoId}!`);
                }
            }
        });
        
        console.log('🔄 DEBUG: Data switching details complete');
    }



    private showProgressBar(): void {
        const progressBar = document.getElementById('api-progress-bar');
        if (progressBar) {
            progressBar.style.display = 'block';
        }
    }

    private hideProgressBar(): void {
        const progressBar = document.getElementById('api-progress-bar');
        if (progressBar) {
            progressBar.style.display = 'none';
        }
    }
}

// Initialize the data service
const dataService = DataService.getInstance();

// Expose debug method globally for testing
(window as any).debugApiAccess = () => dataService.debugApiAccess();

// Export the viewData with a getter that ensures initialization
export const viewData: ViewData = new Proxy({} as ViewData, {
    get(target, prop) {
        if (!dataService.isDataInitialized()) {
            console.warn('Data not yet initialized, returning fallback data');
            return {
                times: rawViews.times.map(time => new Date(time)),
                videos: rawViews.videos
            }[prop as keyof ViewData];
        }
        return dataService.getData()[prop as keyof ViewData];
    }
});

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
        color: "#e67e00" // Darker Orange
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
