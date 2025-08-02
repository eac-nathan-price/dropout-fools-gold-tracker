import rawViews from './views.min.json' with { type: "json" };

// API endpoint for fetching view data
const API_ENDPOINT = 'https://fg-api-server-746154731592.us-west1.run.app/viewcounts/flattened';

// Mapping from API response keys to views.json keys
const API_KEY_MAPPING: { [key: string]: string } = {
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

// Type for API response
type ApiResponse = {
    times: string[];
    videos: {
        [key: string]: {
            youtube: number[];
            tiktok: number[];
            instagram: number[];
        };
    };
};

// Check if running on localhost for debug mode
export const isDebug = false && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Track last API check time
let lastApiCheckTime: Date | null = null;

// Function to update the last check time display
function updateLastCheckTime(): void {
    const lastCheckElement = document.getElementById('last-check');
    if (lastCheckElement && lastApiCheckTime) {
        lastCheckElement.textContent = lastApiCheckTime.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }) + ' at ' + lastApiCheckTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
}

// --- LocalStorage Caching and API Throttling ---
const LOCALSTORAGE_DATA_KEY = 'cachedViewData';
const LOCALSTORAGE_TIME_KEY = 'lastApiRequestTime';

function parseViewData(obj: any): ViewData | null {
    if (!obj || typeof obj !== 'object' || !Array.isArray(obj.times) || typeof obj.videos !== 'object') return null;
    try {
        return {
            times: obj.times.map((t: any) => new Date(t)),
            videos: obj.videos
        };
    } catch {
        return null;
    }
}

function getLatestTime(viewData: ViewData): Date {
    return viewData.times.length ? new Date(Math.max(...viewData.times.map(t => t.getTime()))) : new Date(0);
}

function loadCachedViewData(): ViewData | null {
    const raw = localStorage.getItem(LOCALSTORAGE_DATA_KEY);
    if (!raw) return null;
    try {
        const obj = JSON.parse(raw);
        return parseViewData(obj);
    } catch {
        return null;
    }
}

function saveCachedViewData(data: ViewData) {
    localStorage.setItem(LOCALSTORAGE_DATA_KEY, JSON.stringify({
        times: data.times.map(t => t.toISOString()),
        videos: data.videos
    }));
}

function getLastApiRequestTime(): Date | null {
    const raw = localStorage.getItem(LOCALSTORAGE_TIME_KEY);
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
}

function setLastApiRequestTime(date: Date) {
    localStorage.setItem(LOCALSTORAGE_TIME_KEY, date.toISOString());
}

// --- ViewData Initialization ---
const rawViewData: ViewData = {
    times: rawViews.times.map(time => new Date(time)),
    videos: rawViews.videos
};

let viewData: ViewData = rawViewData;
const cached = loadCachedViewData();
let usedCache = false;
if (cached && getLatestTime(cached) > getLatestTime(rawViewData)) {
    viewData = cached;
    usedCache = true;
    const lastUpdate = getLatestTime(viewData);
    const nextEvenHour = getNextEvenHourPST(lastUpdate);
    const now = new Date();
    const nextCheck = new Date(now.getTime() + 300000);
    console.log(`[Initial Load] Data loaded from cache. Last update time: ${lastUpdate.toLocaleString()}. Next even hour (PST) update: ${nextEvenHour.toLocaleString()}. Next update check: ${nextCheck.toLocaleString()}`);
}
export { viewData };

// --- Dirty/Clean Data Logic for Even Hour (PST) ---
function getPSTDate(date = new Date()) {
    // Returns a Date object in PST (UTC-8 or UTC-7 for DST)
    // This works for US Pacific Time, including DST
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    // PST is UTC-8, PDT is UTC-7
    // Use US daylight saving rules: second Sunday in March to first Sunday in November
    const year = date.getFullYear();
    const startDST = new Date(Date.UTC(year, 2, 8, 10)); // 2nd Sunday in March, 2am PST = 10am UTC
    startDST.setDate(8 + (7 - startDST.getUTCDay()) % 7);
    const endDST = new Date(Date.UTC(year, 10, 1, 9)); // 1st Sunday in Nov, 2am PDT = 9am UTC
    endDST.setDate(1 + (7 - endDST.getUTCDay()) % 7);
    const isDST = date >= startDST && date < endDST;
    const offset = isDST ? -7 : -8;
    return new Date(utc + offset * 3600000);
}

function getLatestEvenHourPST(now = new Date()) {
    const pst = getPSTDate(now);
    pst.setMinutes(0, 0, 0);
    if (pst.getHours() % 2 !== 0) pst.setHours(pst.getHours() - 1); // go to previous even hour
    return new Date(pst);
}

function isDataDirty(): boolean {
    if (typeof window !== 'undefined' && typeof window._forceDirtyOverride !== 'undefined') {
        return !!window._forceDirtyOverride;
    }
    const latestDataTime = getLatestTime(viewData);
    const latestEvenHour = getLatestEvenHourPST();
    return latestDataTime < latestEvenHour;
}

function markDataClean() {
    // No-op: data is clean if latest timestamp >= latest even hour
    // This is just for clarity
}

// --- API Throttling and Refresh Logic ---
let refreshInterval: number | null = null;
let refreshTimeout: number | null = null;

// Show toast on initial load if request is throttled
function maybeShowInitialCacheToast() {
    const lastReq = getLastApiRequestTime();
    const now = new Date();
    if (lastReq && (now.getTime() - lastReq.getTime()) < 300000) {
        // Request will be throttled
        if (usedCache) {
            showNotification('Data updated from cache', 'success');
        } else {
            showNotification('Cached data is up-to-date', 'success');
        }
    }
}

// --- API Fetch and Merge ---
// Accept a forceManual parameter to always allow manual refresh to make a request if forced dirty
export async function fetchAndMergeApiData(forceManual = false): Promise<void> {
    // If force clean, skip request and show fake progress/notification
    if (typeof window !== 'undefined' && window._forceDirtyOverride === false) {
        const now = new Date();
        const nextCheck = new Date(now.getTime() + 300000);
        console.log(`[Update Check] Data is NOT dirty (forced clean) at ${now.toLocaleString()}. Next check at ${nextCheck.toLocaleString()}`);
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) progressBar.style.display = 'block';
        const fakeDelay = 400 + Math.random() * 400; // 0.4s to 0.8s
        setTimeout(() => {
            if (progressBar) progressBar.style.display = 'none';
            showNotification('No new data available', 'success');
        }, fakeDelay);
        setLastApiRequestTime(now);
        lastApiCheckTime = now;
        updateLastCheckTime();
        return;
    }
    // If force dirty, always make a real API request (fall through)
    // Only skip request if not dirty and no override
    if (!(typeof window !== 'undefined' && window._forceDirtyOverride === true)) {
        if (!isDataDirty()) {
            // Data is not dirty: flash progress bar, update last checked time, show notification
            const now = new Date();
            const nextCheck = new Date(now.getTime() + 300000);
            console.log(`[Update Check] Data is NOT dirty at ${now.toLocaleString()}. Next check at ${nextCheck.toLocaleString()}`);
            const progressBar = document.getElementById('progress-bar');
            if (progressBar) progressBar.style.display = 'block';
            setTimeout(() => {
                if (progressBar) progressBar.style.display = 'none';
                showNotification('No new data available', 'success');
            }, 500);
            setLastApiRequestTime(now);
            lastApiCheckTime = now;
            updateLastCheckTime();
            return;
        }
    }
    // Prevent double fetches if called too soon, unless manual or forced dirty
    const lastReq = getLastApiRequestTime();
    const now = new Date();
    const isForceDirty = typeof window !== 'undefined' && window._forceDirtyOverride === true;
    if (!forceManual && !isForceDirty && lastReq && (now.getTime() - lastReq.getTime()) < 300000) {
        // Too soon, skip (only for auto refresh)
        return;
    }
    setLastApiRequestTime(now);
    // Show progress bar
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.display = 'block';
    }
    let gotNewData = false;
    try {
        const nextCheck = new Date(now.getTime() + 300000);
        if (isForceDirty) {
            console.log(`[Update Check] Data IS dirty (forced dirty) at ${now.toLocaleString()}. Next check at ${nextCheck.toLocaleString()}`);
        } else {
            console.log(`[Update Check] Data IS dirty at ${now.toLocaleString()}. Next check at ${nextCheck.toLocaleString()}`);
        }
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const apiData: ApiResponse = await response.json();
        // Get the most recent timestamp from existing data
        const lastExistingTime = getLatestTime(viewData);
        // Filter API times to only include those after the last existing time
        const newTimes: Date[] = [];
        const timeIndices: number[] = [];
        apiData.times.forEach((timeStr, index) => {
            const apiTime = new Date(timeStr);
            if (apiTime > lastExistingTime) {
                newTimes.push(apiTime);
                timeIndices.push(index);
            }
        });
        if (newTimes.length === 0) {
            showNotification('No new data available', 'success');
            // Data remains dirty
            return;
        }
        // Append new times to existing data
        viewData.times.push(...newTimes);
        // Append new view data for each video
        Object.entries(apiData.videos).forEach(([apiKey, platformData]) => {
            const viewsKey = API_KEY_MAPPING[apiKey];
            if (viewsKey && viewData.videos[viewsKey]) {
                Object.entries(platformData).forEach(([platform, values]) => {
                    const newValues = timeIndices.map(index => values[index]);
                    viewData.videos[viewsKey][platform as keyof typeof platformData].push(...newValues);
                });
            }
        });
        // Save updated data to localStorage
        saveCachedViewData(viewData);
        setLastApiRequestTime(new Date());
        gotNewData = true;
        // Trigger chart updates
        triggerChartUpdates();
        showNotification(`Successfully updated with ${newTimes.length} new data points`, 'success');
        // Data is now clean
        markDataClean();
    } catch (error) {
        console.error('Error fetching API data:', error);
        showNotification('Failed to fetch new data. Please try again.', 'error');
        // Data remains dirty
    } finally {
        if (progressBar) {
            progressBar.style.display = 'none';
        }
        lastApiCheckTime = new Date();
        updateLastCheckTime();
    }
}

export function startAutomaticRefresh(): void {
    // Determine when to fetch next
    const lastReq = getLastApiRequestTime();
    const now = new Date();
    if (!lastReq) {
        // First visit: fetch now, then every 5min
        fetchAndMergeApiData();
        refreshInterval = window.setInterval(fetchAndMergeApiData, 300000);
    } else {
        const elapsed = now.getTime() - lastReq.getTime();
        if (elapsed >= 300000) {
            // >5min: fetch now, then every 5min
            fetchAndMergeApiData();
            refreshInterval = window.setInterval(fetchAndMergeApiData, 300000);
        } else {
            // <5min: schedule fetch for (5min-elapsed), then every 5min
            scheduleNextApiFetch(300000 - elapsed);
            maybeShowInitialCacheToast();
        }
    }
}

function scheduleNextApiFetch(ms: number) {
    if (refreshTimeout) clearTimeout(refreshTimeout);
    refreshTimeout = window.setTimeout(() => {
        fetchAndMergeApiData();
        refreshInterval = window.setInterval(fetchAndMergeApiData, 300000);
    }, ms);
}

// Function to manually refresh data
export async function manualRefresh(): Promise<void> {
    console.log('[Manual Refresh] Manual refresh button clicked');
    // Use the same logic as fetchAndMergeApiData
    await fetchAndMergeApiData(true);
    // Reset interval
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
    refreshInterval = window.setInterval(fetchAndMergeApiData, 300000);
}

// Function to simulate API error for debugging
export async function simulateApiError(): Promise<void> {
    if (!isDebug) return;
    
    // Show progress bar
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.display = 'block';
    }
    
    try {
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate an error
        throw new Error('Simulated API error for debugging');
    } catch (error) {
        console.error('Simulated API error:', error);
        showNotification('Simulated API error triggered', 'error');
    } finally {
        // Hide progress bar
        if (progressBar) {
            progressBar.style.display = 'none';
        }
        
        // Update last check time
        lastApiCheckTime = new Date();
        updateLastCheckTime();
    }
}

// Function to trigger chart updates
function triggerChartUpdates(): void {
    // Dispatch a custom event that the chart components can listen to
    window.dispatchEvent(new CustomEvent('viewDataUpdated'));
}

// Function to show notifications
function showNotification(message: string, type: 'success' | 'error'): void {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        ${type === 'success' ? 'background: linear-gradient(135deg, #10b981, #059669);' : 'background: linear-gradient(135deg, #ef4444, #dc2626);'}
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
    
    // Add slideOut animation
    const slideOutStyle = document.createElement('style');
    slideOutStyle.textContent = `
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(slideOutStyle);
}

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
        pointBackgroundColor: '#ff0000',
        fill: false,
        pointRadius: 0
    },
    tiktok: {
        label: 'TikTok',
        borderColor: '#ffffff',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        pointBackgroundColor: '#ffffff',
        fill: false,
        pointRadius: 0
    },
    instagram: {
        label: 'Instagram',
        borderColor: '#ff69b4',
        backgroundColor: 'rgba(255, 105, 180, 0.2)',
        pointBackgroundColor: '#ff69b4',
        fill: false,
        pointRadius: 0
    },
    all: {
        label: 'Total',
        borderColor: '#ffd700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        pointBackgroundColor: '#ffd700',
        borderWidth: 3,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 0,
        pointBorderWidth: 0
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

// Helper: get the next even hour (PST) strictly after a given date
function getNextEvenHourPST(afterDate = new Date()) {
    const pst = getPSTDate(afterDate);
    pst.setMinutes(0, 0, 0);
    let nextHour = pst.getHours();
    if (nextHour % 2 === 0) {
        nextHour += 2;
    } else {
        nextHour += 1;
    }
    pst.setHours(nextHour);
    return pst;
}
