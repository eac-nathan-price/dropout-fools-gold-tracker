// Main application logic for Producer Performance Tracker
import Chart from 'chart.js/auto';
import type { Chart as ChartType, ChartConfiguration } from 'chart.js';
import 'chartjs-adapter-date-fns';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register the datalabels plugin
Chart.register(ChartDataLabels);
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
    fetchAndMergeApiData,
    startAutomaticRefresh,
    manualRefresh,
    simulateApiError,
    isDebug
} from './data.js';

// Add global declaration for debug override
declare global {
    interface Window {
        _forceDirtyOverride?: boolean;
    }
}

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

    static updateChartData(chart: ChartType<'line', { x: Datelike; y: number; }[], unknown>, newTimes: Date[], newDataPoints: number[][]): void {
        // Update each dataset with new data points
        chart.data.datasets.forEach((dataset: any, datasetIndex: number) => {
            const newDataForDataset = newTimes.map((time, timeIndex) => ({
                x: time,
                y: newDataPoints[datasetIndex][timeIndex]
            }));
            dataset.data.push(...newDataForDataset);
        });
        chart.update();
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
                },
                datalabels: {
                    display: false
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
    costPerViewChart: ChartType<'bar', number[], string> | null;
    videoCharts: Map<string, ChartType<'line', { x: Datelike; y: number; }[], unknown>>;

    constructor() {
        this.currentPlatform = 'all';
        this.currentVideoPlatform = 'all';
        this.producerChart = null;
        this.combinedVideoChart = null;
        this.costPerViewChart = null;
        this.videoCharts = new Map();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateLastUpdated();
        this.renderProducerComparisonChart();
        this.renderCombinedVideoChart();
        this.renderCostPerViewChart();
        this.renderVideoCharts();
        this.renderProducerStats();
        
        // Start automatic refresh every 10 minutes
        startAutomaticRefresh();
    }

    setupEventListeners() {
        const platformFilter = document.getElementById('platform-filter') as HTMLSelectElement | null;
        if (platformFilter) {
            platformFilter.addEventListener('change', (e: Event) => {
                const target = e.target as HTMLSelectElement;
                this.currentPlatform = target.value as ExtendedPlatform;
                this.updateProducerComparisonChartForFilter();
                this.renderProducerStats();
            });
        }

        const videoPlatformFilter = document.getElementById('video-platform-filter') as HTMLSelectElement | null;
        if (videoPlatformFilter) {
            videoPlatformFilter.addEventListener('change', (e: Event) => {
                const target = e.target as HTMLSelectElement;
                this.currentVideoPlatform = target.value as ExtendedPlatform;
                this.updateCombinedVideoChartForFilter();
                this.updateCostPerViewChartForFilter();
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

        // Listen for data updates from API
        window.addEventListener('viewDataUpdated', () => {
            this.refreshAllCharts();
            this.updateLastUpdated();
        });

        // Set up debug buttons if in debug mode
        if (isDebug) {
            this.setupDebugButtons();
        }
    }

    // Set up debug buttons for development
    setupDebugButtons() {
        const debugButtons = document.getElementById('debug-buttons');
        if (debugButtons) {
            debugButtons.style.display = 'flex';
        }

        const manualRefreshBtn = document.getElementById('manual-refresh-btn') as HTMLButtonElement;
        if (manualRefreshBtn) {
            manualRefreshBtn.addEventListener('click', async () => {
                manualRefreshBtn.disabled = true;
                manualRefreshBtn.textContent = '⏳ Refreshing...';
                
                try {
                    await manualRefresh();
                } catch (error) {
                    console.error('Manual refresh failed:', error);
                } finally {
                    manualRefreshBtn.disabled = false;
                    manualRefreshBtn.textContent = '🔄 Manual Refresh';
                }
            });
        }

        const simulateErrorBtn = document.getElementById('simulate-error-btn') as HTMLButtonElement;
        if (simulateErrorBtn) {
            simulateErrorBtn.addEventListener('click', async () => {
                simulateErrorBtn.disabled = true;
                simulateErrorBtn.textContent = '⏳ Simulating...';
                
                try {
                    await simulateApiError();
                } catch (error) {
                    console.error('Error simulation failed:', error);
                } finally {
                    simulateErrorBtn.disabled = false;
                    simulateErrorBtn.textContent = '⚠️ Simulate Error';
                }
            });
        }
    }

    // Method to refresh all charts when new data is available
    refreshAllCharts() {
        this.updateProducerComparisonChart();
        this.updateCombinedVideoChart();
        this.updateCostPerViewChart();
        this.updateVideoCharts();
        this.renderProducerStats();
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
                pointBorderWidth: 0,
                pointRadius: 0,
                pointHoverRadius: 0
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

    // Update producer comparison chart data without recreating the chart
    updateProducerComparisonChart() {
        if (!this.producerChart) {
            this.renderProducerComparisonChart();
            return;
        }

        // Get the current number of data points in the chart
        const currentDataLength = this.producerChart.data.datasets[0]?.data.length || 0;
        
        // If we have new data points, add them
        if (viewData.times.length > currentDataLength) {
            const newTimes = viewData.times.slice(currentDataLength);
            const newDataPoints = Object.values(producers).map(producer => 
                newTimes.map(time => getProducerViewsForDate(producer.id, time, this.currentPlatform))
            );
            
            ChartManager.updateChartData(this.producerChart, newTimes, newDataPoints);
        }
    }

    // Update producer comparison chart for platform filter changes
    updateProducerComparisonChartForFilter() {
        if (!this.producerChart) {
            this.renderProducerComparisonChart();
            return;
        }

        // Update all data points for the new platform filter
        this.producerChart.data.datasets.forEach((dataset: any, datasetIndex: number) => {
            const producer = Object.values(producers)[datasetIndex];
            const newData = viewData.times.map(time => getProducerViewsForDate(producer.id, time, this.currentPlatform));
            dataset.data = ChartManager.createTimeData(viewData.times, newData);
        });
        
        this.producerChart.update();
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
                pointBorderWidth: 0,
                pointRadius: 0,
                pointHoverRadius: 0
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
                ...CHART_DEFAULTS.base,
                scales: {
                    ...CHART_DEFAULTS.scales,
                    x: {
                        ...CHART_DEFAULTS.scales.x,
                        title: {
                            display: true,
                            text: 'Time',
                            color: '#cccccc',
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        ...CHART_DEFAULTS.scales.y,
                        title: {
                            display: true,
                            text: 'Views',
                            color: '#cccccc',
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Views',
                        color: '#ffffff',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        padding: {
                            top: 10,
                            bottom: 20
                        }
                    },
                    legend: {
                        ...CHART_DEFAULTS.legend,
                        display: true
                    },
                    tooltip: {
                        ...CHART_DEFAULTS.tooltip,
                        callbacks: {
                            ...CHART_DEFAULTS.tooltip.callbacks,
                            label: customTooltipLabel
                        }
                    },
                    datalabels: {
                        display: false
                    }
                }
            }
        });
    }

    // Update combined video chart data without recreating the chart
    updateCombinedVideoChart() {
        if (!this.combinedVideoChart) {
            this.renderCombinedVideoChart();
            return;
        }

        // Get the current number of data points in the chart
        const currentDataLength = this.combinedVideoChart.data.datasets[0]?.data.length || 0;
        
        // If we have new data points, add them
        if (viewData.times.length > currentDataLength) {
            const newTimes = viewData.times.slice(currentDataLength);
            const newDataPoints = videoData.map(video => 
                newTimes.map(time => {
                    const timeIndex = viewData.times.indexOf(time);
                    return getPlatformViews(video, timeIndex)[this.currentVideoPlatform];
                })
            );
            
            ChartManager.updateChartData(this.combinedVideoChart, newTimes, newDataPoints);
        }
    }

    // Update combined video chart for platform filter changes
    updateCombinedVideoChartForFilter() {
        if (!this.combinedVideoChart) {
            this.renderCombinedVideoChart();
            return;
        }

        // Update all data points for the new platform filter
        this.combinedVideoChart.data.datasets.forEach((dataset: any, datasetIndex: number) => {
            const video = videoData[datasetIndex];
            const newData = viewData.times.map(time => {
                const timeIndex = viewData.times.indexOf(time);
                return getPlatformViews(video, timeIndex)[this.currentVideoPlatform];
            });
            dataset.data = ChartManager.createTimeData(viewData.times, newData);
        });
        
        this.combinedVideoChart.update();
    }

    renderCostPerViewChart() {
        const ctx = document.getElementById('cost-per-view-chart') as HTMLCanvasElement | null;
        if (!ctx) return;
        
        // Destroy existing chart if it exists
        if (this.costPerViewChart) {
            this.costPerViewChart.destroy();
            this.costPerViewChart = null;
        }
        
        // Create chart with structured clone of data for safe mutation
        const chartData = this.createCostPerViewChartData();
        
        this.costPerViewChart = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: this.createCostPerViewChartOptions()
        });
    }

    // Create a structured clone of chart data that is safe to mutate
    private createCostPerViewChartData() {
        // Generate distinct colors for each video (same as combined video chart)
        const videoColors = videoData.map((_, index) => {
            const hue = (index * 360) / videoData.length;
            return `hsl(${hue}, 70%, 60%)`;
        });

        // Calculate cost per view for each video
        const costPerViewData = videoData.map((video, index) => {
            const totalViews = getLatestPlatformViews(video)[this.currentVideoPlatform];
            const totalContribution = Object.values(video.contributions).reduce((sum, amount) => sum + amount, 0);
            const costPerView = totalContribution > 0 && totalViews > 0 ? (totalContribution / totalViews) * 100 : 0; // Convert to cents
            return {
                video,
                costPerView,
                color: videoColors[index]
            };
        });

        // Sort by cost per view (lowest to highest)
        costPerViewData.sort((a, b) => a.costPerView - b.costPerView);

        const dataset = {
            label: 'Cost Per View (cents)',
            data: costPerViewData.map(item => item.costPerView),
            backgroundColor: costPerViewData.map(item => item.color),
            borderColor: costPerViewData.map(item => item.color),
            borderWidth: 1,
            borderRadius: 4
        };

        return {
            labels: costPerViewData.map(item => item.video.title),
            datasets: [dataset]
        };
    }

    // Create chart options with tooltip callbacks
    private createCostPerViewChartOptions() {
        const customTooltipLabel = (context: any) => {
            return `${context.parsed.x.toFixed(2)}¢ per view`;
        };

        const customTooltipTitle = (context: any) => {
            // Find video by cost per view value
            const costPerViewValue = context[0].parsed.x;
            const video = videoData.find(video => {
                const totalViews = getLatestPlatformViews(video)[this.currentVideoPlatform];
                const totalContribution = Object.values(video.contributions).reduce((sum, amount) => sum + amount, 0);
                const costPerView = totalContribution > 0 && totalViews > 0 ? (totalContribution / totalViews) * 100 : 0;
                return Math.abs(costPerView - costPerViewValue) < 0.01; // Use small epsilon for float comparison
            });
            return video ? video.title : '';
        };

        const customTooltipAfterTitle = (context: any) => {
            return '';
        };

        const customTooltipBeforeBody = (context: any) => {
            const costPerViewValue = context[0].parsed.x;
            const video = videoData.find(video => {
                const totalViews = getLatestPlatformViews(video)[this.currentVideoPlatform];
                const totalContribution = Object.values(video.contributions).reduce((sum, amount) => sum + amount, 0);
                const costPerView = totalContribution > 0 && totalViews > 0 ? (totalContribution / totalViews) * 100 : 0;
                return Math.abs(costPerView - costPerViewValue) < 0.01; // Use small epsilon for float comparison
            });
            if (video) {
                const totalViews = getLatestPlatformViews(video)[this.currentVideoPlatform];
                const totalContribution = Object.values(video.contributions).reduce((sum, amount) => sum + amount, 0);
                return `$${totalContribution.toFixed(2)} / ${formatNumber(totalViews)} views`;
            }
            return '';
        };

        return {
            indexAxis: 'y' as const, // Horizontal bar chart
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cents',
                        color: '#cccccc',
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: '#333333'
                    },
                    ticks: {
                        color: '#cccccc'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Videos',
                        color: '#cccccc',
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: '#333333'
                    },
                    ticks: {
                        color: '#cccccc'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Cost Per View',
                    color: '#ffffff',
                    font: {
                        size: 16,
                        weight: 'bold' as const
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                legend: {
                    display: false
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
                        title: customTooltipTitle,
                        afterTitle: customTooltipAfterTitle,
                        beforeBody: customTooltipBeforeBody,
                        label: customTooltipLabel
                    }
                },
                datalabels: {
                    display: true,
                    color: '#ffffff',
                    anchor: 'end' as const,
                    align: 'right' as const,
                    offset: 8,
                    font: {
                        size: 12,
                        weight: 'bold' as const
                    },
                    formatter: function(value: number) {
                        return value.toFixed(2) + '¢';
                    }
                }
            }
        };
    }

    updateCostPerViewChart() {
        if (!this.costPerViewChart) {
            this.renderCostPerViewChart();
            return;
        }
        
        // Update the existing chart data instead of recreating it
        const newChartData = this.createCostPerViewChartData();
        
        // Update labels
        this.costPerViewChart.data.labels = newChartData.labels;
        
        // Update dataset data and colors
        if (this.costPerViewChart.data.datasets[0]) {
            this.costPerViewChart.data.datasets[0].data = newChartData.datasets[0].data;
            this.costPerViewChart.data.datasets[0].backgroundColor = newChartData.datasets[0].backgroundColor;
            this.costPerViewChart.data.datasets[0].borderColor = newChartData.datasets[0].borderColor;
        }
        
        // Update the chart
        this.costPerViewChart.update();
    }

    updateCostPerViewChartForFilter() {
        if (!this.costPerViewChart) {
            this.renderCostPerViewChart();
            return;
        }
        
        // Update the existing chart data instead of recreating it
        const newChartData = this.createCostPerViewChartData();
        
        // Update labels
        this.costPerViewChart.data.labels = newChartData.labels;
        
        // Update dataset data and colors
        if (this.costPerViewChart.data.datasets[0]) {
            this.costPerViewChart.data.datasets[0].data = newChartData.datasets[0].data;
            this.costPerViewChart.data.datasets[0].backgroundColor = newChartData.datasets[0].backgroundColor;
            this.costPerViewChart.data.datasets[0].borderColor = newChartData.datasets[0].borderColor;
        }
        
        // Update the chart
        this.costPerViewChart.update();
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
        this.updateProducerComparisonChart();
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
        
        // Calculate cost per view for tooltips
        const totalViews = getLatestPlatformViews(video).all;
        const totalContribution = Object.values(video.contributions).reduce((sum, amount) => sum + amount, 0);
        const costPerView = totalContribution > 0 ? totalContribution / totalViews : 0;
        const costPerViewCents = costPerView * 100; // Convert to cents
        const costPerViewFormatted = costPerView > 0 ? `${costPerViewCents.toFixed(2)}¢ per view` : 'No cost data';
        
        // Set total views with tooltip
        const totalViewsElement = container.querySelector('.total-views-display') as HTMLElement;
        if (totalViewsElement) {
            totalViewsElement.textContent = formatNumber(totalViews);
            totalViewsElement.title = costPerViewFormatted;
        }
        
        this.setPlatformLinks(container, video);
        this.setContributionInfo(container, video, costPerViewFormatted);
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

    private setContributionInfo(container: HTMLElement, video: Video, costPerViewTooltip?: string): void {
        const totalContribution = Object.values(video.contributions).reduce((sum, amount) => sum + amount, 0).toLocaleString();
        const contributionElement = container.querySelector('.total-contribution') as HTMLElement;
        if (contributionElement) {
            contributionElement.textContent = `$${totalContribution}`;
            if (costPerViewTooltip) {
                contributionElement.title = costPerViewTooltip;
            }
        }
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

    // Update individual video chart data without recreating the chart
    updateVideoChart(video: Video) {
        const chart = this.videoCharts.get(video.id);
        if (!chart) {
            this.renderVideoChart(video);
            return;
        }

        // Get the current number of data points in the chart
        const currentDataLength = chart.data.datasets[0]?.data.length || 0;
        
        // If we have new data points, add them
        if (viewData.times.length > currentDataLength) {
            const newTimes = viewData.times.slice(currentDataLength);
            const newDataPoints = [
                // Platform datasets
                ...PLATFORMS.map(platform => 
                    newTimes.map(time => {
                        const timeIndex = viewData.times.indexOf(time);
                        return video[platform][timeIndex];
                    })
                ),
                // Total dataset
                newTimes.map(time => {
                    const timeIndex = viewData.times.indexOf(time);
                    const platformViews = getPlatformViews(video, timeIndex);
                    return platformViews.all;
                })
            ];
            
            ChartManager.updateChartData(chart as ChartType<'line', { x: Datelike; y: number; }[], unknown>, newTimes, newDataPoints);
        }
    }

    // Update all video charts
    updateVideoCharts() {
        videoData.forEach(video => {
            this.updateVideoChart(video);
        });
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
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Show last check time from localStorage if available
    try {
        const lastCheckElement = document.getElementById('last-check');
        const raw = localStorage.getItem('lastApiRequestTime');
        if (lastCheckElement && raw) {
            const d = new Date(raw);
            if (!isNaN(d.getTime())) {
                lastCheckElement.textContent = d.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                }) + ' at ' + d.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
            }
        }
    } catch {}

    // Debug: Add force dirty/clean toggle button
    if (isDebug) {
        window._forceDirtyOverride = undefined;
        const debugButtons = document.getElementById('debug-buttons');
        if (debugButtons) {
            const label = document.createElement('label');
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.gap = '0.5em';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.style.marginRight = '0.5em';
            checkbox.checked = false;
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode('Force Data Dirty'));
            checkbox.onchange = () => {
                if (checkbox.checked) {
                    window._forceDirtyOverride = true;
                    console.log('[Debug] Force Data Dirty: ON');
                } else {
                    delete window._forceDirtyOverride;
                    console.log('[Debug] Force Data Dirty: OFF (using normal logic)');
                }
            };
            debugButtons.appendChild(label);
        }
    }

    new ProducerTracker();
});