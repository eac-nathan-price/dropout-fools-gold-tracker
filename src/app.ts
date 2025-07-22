// Main application logic for Producer Performance Tracker
import Chart from 'chart.js/auto';
import type { Chart as ChartType, ChartConfiguration } from 'chart.js';
import 'chartjs-adapter-date-fns';
import {
    producers,
    videoData,
    getProducerViewsForDate,
    formatNumber,
    viewData,
    getPlatformViews,
    getLatestPlatformViews,
    PLATFORM_CONFIG,
    objectFromEntries,
    CHART_DEFAULTS,
    populateProducerCardViews,
    EXTENDED_PLATFORMS,
    PLATFORMS,
    DataService
} from './data.js';

// Template utility class
class TemplateManager {
    static getTemplate(templateId: string): HTMLTemplateElement {
        const template = document.getElementById(templateId) as HTMLTemplateElement;
        if (!template) throw new Error(`Template '${templateId}' not found`);
        return template;
    }

    static cloneTemplate(templateId: string): DocumentFragment {
        const template = this.getTemplate(templateId);
        return template.content.cloneNode(true) as DocumentFragment;
    }

    static getElementFromTemplate<T extends HTMLElement>(templateId: string, selector: string): T {
        const clone = this.cloneTemplate(templateId);
        const element = clone.querySelector(selector) as T;
        if (!element) throw new Error(`Element '${selector}' not found in template '${templateId}'`);
        return element;
    }
}

// Chart utility class
class ChartManager {
    static createChart(ctx: HTMLCanvasElement, config: ChartConfiguration<'line', { x: Datelike; y: number; }[], unknown>): ChartType<'line', { x: Datelike; y: number; }[], unknown> {
        return new Chart(ctx, config);
    }

    static destroyChart(chart: ChartType<'line', { x: Datelike; y: number; }[], unknown> | null): void {
        if (chart) chart.destroy();
    }

    static createDataset(data: any[], config: any): any {
        return { ...CHART_DEFAULTS.dataset, ...config, data: data };
    }

    static createTimeData(times: Date[], values: number[]): any[] {
        return times.map((time, index) => ({ x: time, y: values[index] }));
    }

    static getChartOptions(showLegend: boolean = true, customTooltipLabel?: (context: any) => string) {
        const tooltipCallbacks: any = { ...CHART_DEFAULTS.tooltip.callbacks };
        if (customTooltipLabel) tooltipCallbacks.label = customTooltipLabel;
        
        return {
            ...CHART_DEFAULTS.base,
            plugins: {
                legend: { ...CHART_DEFAULTS.legend, display: showLegend },
                tooltip: { 
                    ...CHART_DEFAULTS.tooltip, 
                    callbacks: tooltipCallbacks,
                    itemSort: function(a: any, b: any) {
                        // Sort by parsed y value (highest to lowest)
                        return b.parsed.y - a.parsed.y;
                    }
                }
            },
            scales: CHART_DEFAULTS.scales
        };
    }
}

// Performance analysis utility class
class PerformanceAnalyzer {
    static get24HourPreviousIndex(): number {
        const lastIndex = viewData.times.length - 1;
        const currentTime = viewData.times[lastIndex];
        const targetTime = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
        let closestIndex = 0;
        let minDifference = Math.abs(viewData.times[0].getTime() - targetTime.getTime());
        for (let i = 1; i < viewData.times.length; i++) {
            const difference = Math.abs(viewData.times[i].getTime() - targetTime.getTime());
            if (difference < minDifference) {
                minDifference = difference;
                closestIndex = i;
            }
        }
        return closestIndex;
    }

    static calculateGrowth(video: Video, platform: ExtendedPlatform): number {
        const lastIndex = viewData.times.length - 1;
        const prevDayIndex = this.get24HourPreviousIndex();
        const currentViews = getPlatformViews(video, lastIndex);
        const previousViews = getPlatformViews(video, prevDayIndex);
        return currentViews[platform] - previousViews[platform];
    }

    static isBestPerformer(videoId: string, platform: ExtendedPlatform, growth: number): boolean {
        let maxGrowth = -1;
        videoData.forEach(video => {
            const videoGrowth = this.calculateGrowth(video, platform);
            if (videoGrowth > maxGrowth) maxGrowth = videoGrowth;
        });
        return growth === maxGrowth && growth > 0;
    }

    static isBestValuePerDollar(video: Video): boolean {
        const totalViews = getLatestPlatformViews(video).all;
        const totalContribution = Object.values(video.contributions).reduce((sum, amount) => sum + amount, 0);
        const viewsPerDollar = totalViews / totalContribution;
        let maxViewsPerDollar = 0;
        videoData.forEach(v => {
            const vTotalViews = getLatestPlatformViews(v).all;
            const vTotalContribution = Object.values(v.contributions).reduce((sum, amount) => sum + amount, 0);
            const vViewsPerDollar = vTotalViews / vTotalContribution;
            if (vViewsPerDollar > maxViewsPerDollar) maxViewsPerDollar = vViewsPerDollar;
        });
        return viewsPerDollar === maxViewsPerDollar && viewsPerDollar > 0;
    }
}

// UI component factory class
class UIComponentFactory {
    static createPerformanceArrow(arrowClass: string, title: string): HTMLElement {
        const container = TemplateManager.getElementFromTemplate<HTMLElement>('performance-arrow-template', '.performance-arrow-container');
        container.title = title;
        const arrow = container.querySelector('.performance-arrow') as HTMLElement;
        if (arrow) arrow.className = `performance-arrow ${arrowClass}`;
        return container;
    }

    static createStinkLines(): HTMLElement {
        return TemplateManager.getElementFromTemplate<HTMLElement>('stink-lines-template', '.stink-lines');
    }

    static createBestValueIndicator(viewsPerDollar: number): HTMLElement {
        const indicator = TemplateManager.getElementFromTemplate<HTMLElement>('best-value-indicator-template', '.value-indicator-container');
        indicator.title = `Best value: ${formatNumber(viewsPerDollar)} views per dollar`;
        return indicator;
    }

    static createProducerBubble(producer: Producer, contribution: number, producerShare: number): HTMLElement {
        const bubble = TemplateManager.getElementFromTemplate<HTMLElement>('producer-bubble-template', '.producer-bubble');
        bubble.style.background = producer.color;
        bubble.title = `${producer.fullName}: $${contribution} - ${formatNumber(producerShare)} views`;
        const img = bubble.querySelector('.profile-image') as HTMLImageElement;
        if (img) Object.assign(img, { src: `/assets/${producer.id}.png`, alt: producer.name });
        const nameElement = bubble.querySelector('.producer-name');
        if (nameElement) nameElement.textContent = producer.name;
        return bubble;
    }
}

// Producer stats calculator class
class ProducerStatsCalculator {
    static getProducerStats(producerId: string): ExtendedPlatformData<number> & { videoCount: number; soloVideoCount: number } {
        const platformTotals: ExtendedPlatformData<number> = objectFromEntries([...EXTENDED_PLATFORMS], () => 0);
        let videoCount = 0;
        let soloVideoCount = 0;
        videoData.forEach(video => {
            const producers = Object.keys(video.contributions);
            if (producers.includes(producerId)) {
                videoCount++;
                if (producers.length === 1) soloVideoCount++;
                const sharePercentage = 1 / producers.length;
                const latestViews = getLatestPlatformViews(video);
                for (const platform of EXTENDED_PLATFORMS) platformTotals[platform] += latestViews[platform] * sharePercentage;
            }
        });
        for (const platform of EXTENDED_PLATFORMS) platformTotals[platform] = Math.round(platformTotals[platform]);
        return { ...platformTotals, videoCount: videoCount, soloVideoCount: soloVideoCount };
    }

    static createProducerTooltip(producerId: string): string {
        const videoShares: { title: string; views: number }[] = [];
        videoData.forEach(video => {
            const producers = Object.keys(video.contributions);
            if (producers.includes(producerId)) {
                const sharePercentage = 1 / producers.length;
                const latestViews = getLatestPlatformViews(video);
                const producerShare = Math.round(latestViews.all * sharePercentage);
                if (producerShare > 0) videoShares.push({ title: video.title, views: producerShare });
            }
        });
        videoShares.sort((a, b) => b.views - a.views);
        let tooltipText = 'Most views:';
        for (const video of videoShares) tooltipText += `\n${video.title}: ${formatNumber(video.views)}`;
        return tooltipText;
    }
}

// Main application class
class ProducerTracker {
    currentPlatform: ExtendedPlatform;
    currentVideoPlatform: ExtendedPlatform;
    producerChart: ChartType<'line', { x: Datelike; y: number; }[], unknown> | null;
    combinedVideoChart: ChartType<'line', { x: Datelike; y: number; }[], unknown> | null;
    videoCharts: Map<string, ChartType<'line', { x: Datelike; y: number; }[], unknown>>;

    constructor() {
        this.currentPlatform = 'all';
        this.currentVideoPlatform = 'all';
        this.producerChart = null;
        this.combinedVideoChart = null;
        this.videoCharts = new Map();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateLastUpdated();
        this.renderProducerComparisonChart();
        this.renderCombinedVideoChart();
        this.renderVideoCharts();
        this.renderProducerStats();
    }

    setupEventListeners() {
        const platformFilter = document.getElementById('platform-filter') as HTMLSelectElement | null;
        if (platformFilter) {
            platformFilter.addEventListener('change', (e: Event) => {
                const target = e.target as HTMLSelectElement;
                this.currentPlatform = target.value as ExtendedPlatform;
                this.renderProducerComparisonChart();
                this.renderProducerStats();
            });
        }

        const videoPlatformFilter = document.getElementById('video-platform-filter') as HTMLSelectElement | null;
        if (videoPlatformFilter) {
            videoPlatformFilter.addEventListener('change', (e: Event) => {
                const target = e.target as HTMLSelectElement;
                this.currentVideoPlatform = target.value as ExtendedPlatform;
                this.renderCombinedVideoChart();
            });
        }

        document.querySelectorAll('.legend-item').forEach(item => {
            item.addEventListener('click', (e: Event) => {
                const currentTarget = e.currentTarget as HTMLElement | null;
                if (currentTarget && currentTarget.dataset.producer) {
                    const producerId = currentTarget.dataset.producer;
                    this.toggleProducerVisibility(producerId);
                }
            });
        });
    }

    renderProducerComparisonChart() {
        const ctx = document.getElementById('producer-comparison-chart') as HTMLCanvasElement | null;
        if (!ctx) return;
        ChartManager.destroyChart(this.producerChart);
        const datasets = Object.values(producers).map(producer => {
            const data = ChartManager.createTimeData(
                viewData.times,
                viewData.times.map(time => getProducerViewsForDate(producer.id, time, this.currentPlatform))
            );
            return ChartManager.createDataset(data, {
                label: producer.name,
                borderColor: producer.color,
                backgroundColor: producer.color + '20',
                fill: false,
                borderWidth: 3,
                pointBackgroundColor: producer.color,
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 8
            });
        });
        const customTooltipLabel = (context: any) => {
            const producer = Object.values(producers).find(p => p.name === context.dataset.label);
            return `${producer ? producer.name : 'Unknown'}: ${formatNumber(context.parsed.y)} views`;
        };
        this.producerChart = ChartManager.createChart(ctx, {
            type: 'line',
            data: { datasets },
            options: {
                ...ChartManager.getChartOptions(false, customTooltipLabel),
                scales: CHART_DEFAULTS.scales
            }
        });
    }

    renderCombinedVideoChart() {
        const ctx = document.getElementById('combined-video-chart') as HTMLCanvasElement | null;
        if (!ctx) return;
        ChartManager.destroyChart(this.combinedVideoChart);
        
        // Generate distinct colors for each video by equally dividing the hue spectrum
        const videoColors = videoData.map((_, index) => {
            const hue = (index * 360) / videoData.length;
            return `hsl(${hue}, 70%, 60%)`;
        });

        const datasets = videoData.map((video, index) => {
            const data = ChartManager.createTimeData(
                viewData.times,
                viewData.times.map(time => {
                    const timeIndex = viewData.times.indexOf(time);
                    return getPlatformViews(video, timeIndex)[this.currentVideoPlatform];
                })
            );
            return ChartManager.createDataset(data, {
                label: video.title,
                borderColor: videoColors[index],
                backgroundColor: videoColors[index] + '20',
                fill: false,
                borderWidth: 2,
                pointBackgroundColor: videoColors[index],
                pointBorderWidth: 1,
                pointRadius: 3,
                pointHoverRadius: 5
            });
        });

        const customTooltipLabel = (context: any) => {
            const video = videoData.find(v => v.title === context.dataset.label);
            return `${context.dataset.label}: ${formatNumber(context.parsed.y)} views`;
        };

        this.combinedVideoChart = ChartManager.createChart(ctx, {
            type: 'line',
            data: { datasets },
            options: {
                ...ChartManager.getChartOptions(true, customTooltipLabel),
                scales: CHART_DEFAULTS.scales
            }
        });
    }

    renderProducerStats() {
        const container = document.querySelector('.producer-legend');
        if (!container) return;
        container.innerHTML = '';
        const producerStats = Object.values(producers).map(producer => ({
            ...producer,
            stats: ProducerStatsCalculator.getProducerStats(producer.id)
        }));
        producerStats.sort((a, b) => b.stats.all - a.stats.all);
        const winner = producerStats[0];
        const loser = producerStats[producerStats.length - 1];
        producerStats.forEach(producer => {
            const producerCard = this.createProducerCard(producer, winner, loser);
            container.appendChild(producerCard);
        });
    }

    createProducerCard(producer: any, winner: any, loser: any): HTMLElement {
        const card = TemplateManager.getElementFromTemplate<HTMLElement>('producer-card-template', '.legend-item');
        card.dataset.producer = producer.id;
        card.style.background = producer.color;
        card.title = ProducerStatsCalculator.createProducerTooltip(producer.id);
        if (producer.id === winner.id) {
            const crown = document.createElement('div');
            crown.className = 'crown';
            crown.textContent = '👑';
            card.querySelector('.producer-profile')?.appendChild(crown);
        }
        if (producer.id === loser.id) {
            const stinkLines = UIComponentFactory.createStinkLines();
            card.querySelector('.producer-profile')?.appendChild(stinkLines);
        }
        this.populateProducerCard(card, producer);
        return card;
    }

    private populateProducerCard(card: HTMLElement, producer: any): void {
        const img = card.querySelector('.profile-image') as HTMLImageElement;
        if (img) Object.assign(img, { src: `/assets/${producer.id}.png`, alt: producer.fullName });
        const counts = objectFromEntries([...EXTENDED_PLATFORMS], (platform) => card.querySelector(`.${platform}-count`));
        const elements = {
            name: card.querySelector('.producer-name'),
            ...counts,
            videoCount: card.querySelector('.producer-video-count'),
            soloCount: card.querySelector('.producer-solo-count')
        };
        for (const platform of EXTENDED_PLATFORMS) populateProducerCardViews(elements[platform], platform, producer.stats[platform]);
        if (elements.name) elements.name.textContent = producer.fullName;
        if (elements.videoCount) elements.videoCount.textContent = `${producer.stats.videoCount} ${producer.stats.videoCount === 1 ? 'Short' : 'Shorts'}`;
        if (elements.soloCount) elements.soloCount.textContent = `${producer.stats.soloVideoCount} Solo`;
    }

    toggleProducerVisibility(producerId: string) {
        const legendItem = document.querySelector(`[data-producer="${producerId}"]`) as HTMLElement | null;
        if (!legendItem) return;
        legendItem.classList.toggle('hidden', !legendItem.classList.contains('hidden'));
        this.renderProducerComparisonChart();
    }

    renderVideoCharts() {
        const container = document.getElementById('video-charts-grid');
        if (!container) return;
        container.innerHTML = '';
        videoData.forEach(video => {
            const chartContainer = this.createVideoChartContainer(video);
            container.appendChild(chartContainer);
        });
        setTimeout(() => {
            for (const video of videoData) this.renderVideoChart(video);
        }, 100);
    }

    createVideoChartContainer(video: Video): HTMLElement {
        const container = TemplateManager.getElementFromTemplate<HTMLElement>('video-chart-container-template', '.chart-container');
        container.id = `container-${video.id}`;
        this.populateVideoChartContainer(container, video);
        return container;
    }

    private populateVideoChartContainer(container: HTMLElement, video: Video): void {
        const titleElement = container.querySelector('.clickable-title') as HTMLElement;
        if (titleElement) {
            titleElement.textContent = video.title;
            titleElement.dataset.videoLink = video.links.youtube;
            titleElement.addEventListener('click', () => {
                this.showYouTubePlayer(video.links.youtube, video.title);
            });
        }
        const totalViewsElement = container.querySelector('.total-views-display');
        if (totalViewsElement) totalViewsElement.textContent = formatNumber(getLatestPlatformViews(video).all);
        this.setPlatformLinks(container, video);
        this.setContributionInfo(container, video);
        this.setPerformanceIndicators(container, video);
        this.setCanvasId(container, video);
        this.setProducerBubbles(container, video);
    }

    private setPlatformLinks(container: HTMLElement, video: Video): void {
        const platformSelectors = objectFromEntries([...PLATFORMS], (platform) => `.${platform}-icon`);
        for (const platform of PLATFORMS) {
            const link = container.querySelector(platformSelectors[platform]) as HTMLAnchorElement;
            if (link) link.href = video.links[platform];
        }
    }

    private setContributionInfo(container: HTMLElement, video: Video): void {
        const totalContribution = Object.values(video.contributions).reduce((sum, amount) => sum + amount, 0).toLocaleString();
        const contributionElement = container.querySelector('.total-contribution');
        if (contributionElement) contributionElement.textContent = `$${totalContribution}`;
    }

    private setPerformanceIndicators(container: HTMLElement, video: Video): void {
        const indicatorsContainer = container.querySelector('.performance-indicators');
        if (!indicatorsContainer) return;
        const indicators = this.getPerformanceIndicators(video);
        indicatorsContainer.innerHTML = indicators;
        if (PerformanceAnalyzer.isBestValuePerDollar(video)) {
            const totalViews = getLatestPlatformViews(video).all;
            const totalContribution = Object.values(video.contributions).reduce((sum, amount) => sum + amount, 0);
            const viewsPerDollar = Math.round(totalViews / totalContribution);
            const valueIndicator = UIComponentFactory.createBestValueIndicator(viewsPerDollar);
            indicatorsContainer.appendChild(valueIndicator);
        }
    }

    private setCanvasId(container: HTMLElement, video: Video): void {
        const canvas = container.querySelector('canvas') as HTMLCanvasElement;
        if (canvas) canvas.id = `chart-${video.id}`;
    }

    private setProducerBubbles(container: HTMLElement, video: Video): void {
        const bubblesContainer = container.querySelector('.producer-bubbles');
        if (!bubblesContainer) return;
        bubblesContainer.innerHTML = '';
        const producerBubbles = this.createProducerBubbles(video);
        for (const bubble of producerBubbles) bubblesContainer.appendChild(bubble);
    }

    getPerformanceIndicators(video: Video): string {
        const indicators: string[] = [];
        const arrows = objectFromEntries([...EXTENDED_PLATFORMS], (platform) => `${platform}-arrow`);
        for (const platform of EXTENDED_PLATFORMS) {
            const growth = PerformanceAnalyzer.calculateGrowth(video, platform);
            if (PerformanceAnalyzer.isBestPerformer(video.id, platform, growth)) {
                const arrow = UIComponentFactory.createPerformanceArrow(
                    arrows[platform], 
                    `Best ${platform === 'all' ? 'overall' : platform} performer in last 24h (+${formatNumber(growth)} views)`
                );
                indicators.push(arrow.outerHTML);
            }
        };
        return indicators.join('');
    }

    createProducerBubbles(video: Video): HTMLElement[] {
        const producersIds = Object.keys(video.contributions);
        const totalViews = getLatestPlatformViews(video).all;
        const producerShare = totalViews / producersIds.length;
        return producersIds.map((producerId) => {
            const producer = producers[producerId];
            if (!producer) return document.createElement('span');
            const contribution = video.contributions[producerId] || 0;
            return UIComponentFactory.createProducerBubble(producer, contribution, producerShare);
        });
    }

    renderVideoChart(video: Video) {
        const ctx = document.getElementById(`chart-${video.id}`) as HTMLCanvasElement | null;
        if (!ctx) return;
        const datasets = [
            // Platform datasets
            ...PLATFORMS.map(platform =>
                ChartManager.createDataset(
                    ChartManager.createTimeData(viewData.times, video[platform] as number[]),
                    PLATFORM_CONFIG[platform]
                )
            ),
            // Total dataset
            ChartManager.createDataset(
                ChartManager.createTimeData(
                    viewData.times,
                    viewData.times.map((_, index) => {
                        const platformViews = getPlatformViews(video, index);
                        return platformViews.all;
                    })
                ),
                PLATFORM_CONFIG.all
            )
        ];
        const customTooltipLabel = (context: any) => {
            return `${context.dataset.label}: ${formatNumber(context.parsed.y)} views`;
        };
        const chart = ChartManager.createChart(ctx, {
            type: 'line',
            data: { datasets },
            options: {
                ...ChartManager.getChartOptions(true, customTooltipLabel),
                scales: CHART_DEFAULTS.scales,
            }
        });
        this.videoCharts.set(video.id, chart);
    }

    showYouTubePlayer(videoLink: string, videoTitle: string) {
        const existingPlayer = document.querySelector('.youtube-player-fixed');
        if (existingPlayer) existingPlayer.remove();
        const player = TemplateManager.getElementFromTemplate<HTMLElement>('youtube-player-template', '.youtube-player-fixed');
        const titleElement = player.querySelector('h4');
        if (titleElement) titleElement.textContent = videoTitle;
        const iframe = player.querySelector('iframe') as HTMLIFrameElement;
        if (iframe) iframe.src = videoLink.replace('/shorts/', '/embed/') + '?autoplay=1&rel=0';
        document.body.appendChild(player);
        const closeButton = player.querySelector('.close-button') as HTMLElement;
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                player.remove();
            });
        }
        document.addEventListener('keydown', function closeOnEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                player.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        });
    }

    updateLastUpdated() {
        const lastUpdated = document.getElementById('last-updated');
        const latestDate = viewData.times[viewData.times.length - 1];
        if (lastUpdated && latestDate) {
            const date = new Date(latestDate);
            lastUpdated.textContent = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }) + ' at ' + date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        }
    }

    async refreshData() {
        const dataService = DataService.getInstance();
        await dataService.refreshData();
        
        // Update all charts and UI components
        this.updateLastUpdated();
        this.renderProducerComparisonChart();
        this.renderCombinedVideoChart();
        this.renderVideoCharts();
        this.renderProducerStats();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize data service first
    const dataService = DataService.getInstance();
    await dataService.initialize();
    
    // Then initialize the UI
    const tracker = new ProducerTracker();
    
    // Set up periodic refresh every 5 minutes
    setInterval(async () => {
        await tracker.refreshData();
    }, 5 * 60 * 1000);
}); 
