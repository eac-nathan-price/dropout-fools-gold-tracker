// Main application logic for Producer Performance Tracker
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import {
    producers,
    videoData,
    sampleTimes,
    getProducerById,
    getProducerViewsForDate,
    formatNumber,
    getLatestTotalViews,
    getProducersFromContributions,
    Video
} from './data';

class ProducerTracker {
    currentPlatform: string;
    producerChart: Chart<'line', { x: number | string | Date; y: number; }[], unknown> | null;
    videoCharts: Map<string, Chart<'line', { x: number | string | Date; y: number; }[], unknown>>;

    constructor() {
        this.currentPlatform = 'all';
        this.producerChart = null;
        this.videoCharts = new Map();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateLastUpdated();
        this.renderProducerComparisonChart();
        this.renderVideoCharts();
        this.renderProducerStats();
    }

    setupEventListeners() {
        // Platform filter for producer comparison
        const platformFilter = document.getElementById('platform-filter') as HTMLSelectElement | null;
        if (platformFilter) {
            platformFilter.addEventListener('change', (e: Event) => {
                const target = e.target as HTMLSelectElement;
                this.currentPlatform = target.value;
                this.renderProducerComparisonChart();
                this.renderProducerStats();
            });
        }

        // Producer legend click handlers
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

        // Destroy existing chart if it exists
        if (this.producerChart) {
            this.producerChart.destroy();
        }
        
        // Create datasets for each producer with actual timestamps
        const datasets = producers.map(producer => {
            const data = sampleTimes.map(time => ({
                x: time,
                y: getProducerViewsForDate(producer.id, time, this.currentPlatform as 'all' | 'youtube' | 'tiktok' | 'instagram')
            }));
            
            return {
                label: producer.name,
                data: data,
                borderColor: producer.color,
                backgroundColor: producer.color + '20', // 20% opacity
                borderWidth: 3,
                fill: false,
                tension: 0.4,
                pointBackgroundColor: producer.color,
                pointBorderColor: '#1a1a1a',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 8
            };
        });

        this.producerChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: datasets as any // Chart.js expects a certain structure
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false // We have our custom legend
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: '#2d2d2d',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#ffd700',
                        borderWidth: 1,
                        callbacks: {
                            title: function(context: any) {
                                const date = new Date(context[0].parsed.x);
                                const timeString = date.toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    hour12: true 
                                });
                                const dateString = date.toLocaleDateString('en-US', { 
                                    month: 'long', 
                                    day: 'numeric' 
                                });
                                return `${dateString}, ${timeString}`;
                            },
                            label: function(context: any) {
                                const producer = producers.find(p => p.name === context.dataset.label);
                                return `${producer ? producer.name : 'Unknown'}: ${formatNumber(context.parsed.y)} views`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
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
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    renderProducerStats() {
        const container = document.querySelector('.producer-legend');
        if (!container) return;

        container.innerHTML = '';
        
        // Get producer stats and determine winner/loser
        const producerStats = producers.map(producer => ({
            ...producer,
            stats: this.getProducerStats(producer.id)
        }));
        
        // Sort by total views to determine winner and loser
        producerStats.sort((a, b) => b.stats.total - a.stats.total);
        const winner = producerStats[0];
        const loser = producerStats[producerStats.length - 1];
        
        producerStats.forEach(producer => {
            const imageName = producer.name.toLowerCase();
            const isWinner = producer.id === winner.id;
            const isLoser = producer.id === loser.id;
            
            const producerCard = document.createElement('div');
            producerCard.className = 'legend-item';
            producerCard.dataset.producer = producer.id;
            producerCard.style.background = producer.color;
            
            const crownElement = isWinner ? '<div class="crown">👑</div>' : '';
            const stinkLines = isLoser ? '<div class="stink-lines"><svg class="stink-line left" viewBox="0 0 20 40"><path class="sine-path" d="M10 0 Q15 8 10 16 Q5 24 10 32 Q15 40 10 40" stroke="#8B4513" stroke-width="2" fill="none"/></svg><svg class="stink-line center" viewBox="0 0 20 40"><path class="sine-path" d="M10 0 Q15 8 10 16 Q5 24 10 32 Q15 40 10 40" stroke="#8B4513" stroke-width="2" fill="none"/></svg><svg class="stink-line right" viewBox="0 0 20 40"><path class="sine-path" d="M10 0 Q15 8 10 16 Q5 24 10 32 Q15 40 10 40" stroke="#8B4513" stroke-width="2" fill="none"/></svg></div>' : '';
            
            const shortsText = producer.stats.videoCount === 1 ? 'Short' : 'Shorts';
            
            producerCard.innerHTML = `
                <div class="producer-card">
                    <div class="producer-profile">
                        ${crownElement}
                        ${stinkLines}
                        <img src="/assets/${imageName}.png" alt="${producer.fullName}" class="profile-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <span class="fallback-icon">👤</span>
                    </div>
                    <div class="producer-info">
                        <div class="producer-name">${producer.fullName}</div>
                        <div class="producer-total">${formatNumber(producer.stats.total)} Views</div>
                        <div class="producer-breakdown">
                            <span class="youtube-count">YT: ${formatNumber(producer.stats.youtube)}</span>
                            <span class="tiktok-count">TT: ${formatNumber(producer.stats.tiktok)}</span>
                            ${producer.stats.instagram > 0 ? `<span class="instagram-count">IR: ${formatNumber(producer.stats.instagram)}</span>` : ''}
                        </div>
                        <div class="producer-video-line">
                            <span class="producer-video-count">${producer.stats.videoCount} ${shortsText}</span>
                            <span class="producer-solo-count">${producer.stats.soloVideoCount} Solo</span>
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(producerCard);
        });
    }

    getProducerStats(producerId: string) {
        let youtubeTotal = 0;
        let tiktokTotal = 0;
        let instagramTotal = 0;
        let videoCount = 0;
        let soloVideoCount = 0;
        
        videoData.forEach(video => {
            const producers = getProducersFromContributions(video.contributions);
            if (producers.includes(producerId)) {
                videoCount++;
                if (producers.length === 1) {
                    soloVideoCount++;
                }
                const sharePercentage = 1 / producers.length;
                
                // Always calculate all platform totals for display in cards
                const latestIndex = sampleTimes.length - 1;
                youtubeTotal += video.youtubeViews[latestIndex] * sharePercentage;
                tiktokTotal += video.tiktokViews[latestIndex] * sharePercentage;
                
                if (video.instagramViews) {
                    instagramTotal += video.instagramViews[latestIndex] * sharePercentage;
                }
            }
        });
        
        return {
            total: Math.round(youtubeTotal + tiktokTotal + instagramTotal),
            youtube: Math.round(youtubeTotal),
            tiktok: Math.round(tiktokTotal),
            instagram: Math.round(instagramTotal),
            videoCount: videoCount,
            soloVideoCount: soloVideoCount
        };
    }

    toggleProducerVisibility(producerId: string) {
        const legendItem = document.querySelector(`[data-producer="${producerId}"]`) as HTMLElement | null;
        if (!legendItem) return;
        
        const isHidden = legendItem.classList.contains('hidden');
        
        if (isHidden) {
            legendItem.classList.remove('hidden');
            // Chart.js doesn't have show/hide methods, we need to update the chart data
            this.renderProducerComparisonChart();
        } else {
            legendItem.classList.add('hidden');
            // Chart.js doesn't have show/hide methods, we need to update the chart data
            this.renderProducerComparisonChart();
        }
    }

    renderVideoCharts() {
        const container = document.getElementById('video-charts-grid');
        if (!container) return;
        container.innerHTML = '';
        
        videoData.forEach(video => {
            const chartContainer = this.createVideoChartContainer(video);
            container.appendChild(chartContainer);
        });

        // Render charts after DOM elements are created
        setTimeout(() => {
            videoData.forEach(video => {
                this.renderVideoChart(video);
            });
        }, 100);
    }

    createVideoChartContainer(video: Video) {
        const container = document.createElement('div');
        container.className = 'chart-container';
        container.id = `container-${video.id}`;
        
        // Calculate total views and producer share
        const totalViews = getLatestTotalViews(video);
        const producers = getProducersFromContributions(video.contributions);
        const producerShare = totalViews / producers.length;
        
        // Calculate total contribution
        const totalContribution = Object.values(video.contributions).reduce((sum, amount) => sum + amount, 0).toLocaleString();
        
        // Get performance indicators for last 24 hours
        const performanceIndicators = this.getPerformanceIndicators(video);
        
        // Check if this video has the best views-per-dollar ratio
        const isBestValue = this.isBestValuePerDollar(video);
        
        // Create producer bubbles
        const producerBubbles = producers.map(producerId => {
            const producer = getProducerById(producerId);
            if (!producer) return '';
            const imageName = producer.name.toLowerCase();
            const contribution = video.contributions[producerId] || 0;
            const tooltipText = `${producer.fullName}: $${contribution} - ${formatNumber(producerShare)} views`;
            return `<span class="producer-bubble" style="background: ${producer.color};" title="${tooltipText}"><span class="producer-icon"><img src="/assets/${imageName}.png" alt="${producer.name}" class="profile-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><span class="fallback-icon">👤</span></span>${producer.name}</span>`;
        }).join('');

        container.innerHTML = `
            <div class="chart-header">
                <div class="chart-title clickable-title" data-video-link="${video.links.youtube}">${video.title}</div>
                <div class="total-views-display">${formatNumber(getLatestTotalViews(video))}</div>
            </div>
            <div class="chart-subheader">
                <div class="platform-links">
                    <a href="${video.links.youtube}" target="_blank" class="platform-icon youtube-icon" title="Watch on YouTube">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                    </a>
                    <a href="${video.links.tiktok}" target="_blank" class="platform-icon tiktok-icon" title="Watch on TikTok">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                        </svg>
                    </a>
                    <a href="${video.links.instagram}" target="_blank" class="platform-icon instagram-icon" title="Watch on Instagram">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                    </a>
                </div>
                <div class="performance-indicators">
                    ${performanceIndicators}
                    ${isBestValue ? '<div class="value-indicator-container" title="Best views per dollar ratio"><span class="value-indicator">$</span></div>' : ''}
                </div>
                <div class="total-contribution">
                    $${totalContribution}
                </div>
            </div>
            <canvas id="chart-${video.id}" width="400" height="200"></canvas>
            <div class="producer-bubbles">
                ${producerBubbles}
            </div>
        `;
        
        // Add click handler for video title
        const titleElement = container.querySelector('.clickable-title') as HTMLElement;
        if (titleElement) {
            titleElement.addEventListener('click', () => {
                this.showYouTubePlayer(video.links.youtube, video.title);
            });
        }
        
        return container;
    }

    getPerformanceIndicators(video: Video): string {
        const indicators: string[] = [];
        
        // Get the most recent data point and the one closest to 24 hours ago
        const lastIndex = sampleTimes.length - 1;
        const prevDayIndex = this.get24HourPreviousIndex();
        
        // Calculate 24-hour growth for each platform
        const youtubeGrowth = video.youtubeViews[lastIndex] - video.youtubeViews[prevDayIndex];
        const tiktokGrowth = video.tiktokViews[lastIndex] - video.tiktokViews[prevDayIndex];
        const instagramGrowth = video.instagramViews ? video.instagramViews[lastIndex] - video.instagramViews[prevDayIndex] : 0;
        const totalGrowth = youtubeGrowth + tiktokGrowth + instagramGrowth;
        
        // Check if this video is the best performer in each category
        const isBestYouTube = this.isBestPerformer(video.id, 'youtube', youtubeGrowth);
        const isBestTiktok = this.isBestPerformer(video.id, 'tiktok', tiktokGrowth);
        const isBestInstagram = this.isBestPerformer(video.id, 'instagram', instagramGrowth);
        const isBestOverall = this.isBestPerformer(video.id, 'overall', totalGrowth);
        
        if (isBestYouTube) indicators.push(`<div class="performance-arrow-container" title="Best YouTube performer in last 24h (+${formatNumber(youtubeGrowth)} views)"><span class="performance-arrow youtube-arrow"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 16L12 4M7 9L12 4L17 9"/><text x="12" y="22" text-anchor="middle" font-size="8" font-weight="100" letter-spacing="2" fill="currentColor">24</text></svg></span></div>`);
        if (isBestTiktok) indicators.push(`<div class="performance-arrow-container" title="Best TikTok performer in last 24h (+${formatNumber(tiktokGrowth)} views)"><span class="performance-arrow tiktok-arrow"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 16L12 4M7 9L12 4L17 9"/><text x="12" y="22" text-anchor="middle" font-size="8" font-weight="100" letter-spacing="2" fill="currentColor">24</text></svg></span></div>`);
        if (isBestInstagram) indicators.push(`<div class="performance-arrow-container" title="Best Instagram performer in last 24h (+${formatNumber(instagramGrowth)} views)"><span class="performance-arrow instagram-arrow"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 16L12 4M7 9L12 4L17 9"/><text x="12" y="22" text-anchor="middle" font-size="8" font-weight="100" letter-spacing="2" fill="currentColor">24</text></svg></span></div>`);
        if (isBestOverall) indicators.push(`<div class="performance-arrow-container" title="Best overall performer in last 24h (+${formatNumber(totalGrowth)} views)"><span class="performance-arrow overall-arrow"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 16L12 4M7 9L12 4L17 9"/><text x="12" y="22" text-anchor="middle" font-size="8" font-weight="100" letter-spacing="2" fill="currentColor">24</text></svg></span></div>`);
        
        return indicators.join('');
    }

    get24HourPreviousIndex(): number {
        const lastIndex = sampleTimes.length - 1;
        const currentTime = sampleTimes[lastIndex];
        const targetTime = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
        
        let closestIndex = 0;
        let minDifference = Math.abs(sampleTimes[0].getTime() - targetTime.getTime());
        
        for (let i = 1; i < sampleTimes.length; i++) {
            const difference = Math.abs(sampleTimes[i].getTime() - targetTime.getTime());
            if (difference < minDifference) {
                minDifference = difference;
                closestIndex = i;
            }
        }
        
        return closestIndex;
    }

    isBestPerformer(videoId: string, platform: 'youtube' | 'tiktok' | 'instagram' | 'overall', growth: number): boolean {
        const lastIndex = sampleTimes.length - 1;
        const prevDayIndex = this.get24HourPreviousIndex();
        
        let maxGrowth = -1;
        
        videoData.forEach(video => {
            let videoGrowth = 0;
            
            if (platform === 'youtube') {
                videoGrowth = video.youtubeViews[lastIndex] - video.youtubeViews[prevDayIndex];
            } else if (platform === 'tiktok') {
                videoGrowth = video.tiktokViews[lastIndex] - video.tiktokViews[prevDayIndex];
            } else if (platform === 'instagram') {
                videoGrowth = video.instagramViews ? video.instagramViews[lastIndex] - video.instagramViews[prevDayIndex] : 0;
            } else if (platform === 'overall') {
                const youtubeGrowth = video.youtubeViews[lastIndex] - video.youtubeViews[prevDayIndex];
                const tiktokGrowth = video.tiktokViews[lastIndex] - video.tiktokViews[prevDayIndex];
                const instagramGrowth = video.instagramViews ? video.instagramViews[lastIndex] - video.instagramViews[prevDayIndex] : 0;
                videoGrowth = youtubeGrowth + tiktokGrowth + instagramGrowth;
            }
            
            if (videoGrowth > maxGrowth) {
                maxGrowth = videoGrowth;
            }
        });
        
        return growth === maxGrowth && growth > 0;
    }

    isBestValuePerDollar(video: Video): boolean {
        const totalViews = getLatestTotalViews(video);
        const totalContribution = Object.values(video.contributions).reduce((sum, amount) => sum + amount, 0);
        const viewsPerDollar = totalViews / totalContribution;
        
        let maxViewsPerDollar = 0;
        
        videoData.forEach(v => {
            const vTotalViews = getLatestTotalViews(v);
            const vTotalContribution = Object.values(v.contributions).reduce((sum, amount) => sum + amount, 0);
            const vViewsPerDollar = vTotalViews / vTotalContribution;
            
            if (vViewsPerDollar > maxViewsPerDollar) {
                maxViewsPerDollar = vViewsPerDollar;
            }
        });
        
        return viewsPerDollar === maxViewsPerDollar && viewsPerDollar > 0;
    }

    renderVideoChart(video: Video) {
        const ctx = document.getElementById(`chart-${video.id}`) as HTMLCanvasElement | null;
        if (!ctx) return;

        // Create datasets with actual timestamps for linear time scaling
        const youtubeData = sampleTimes.map((time, index) => ({
            x: time,
            y: video.youtubeViews[index]
        }));
        
        const tiktokData = sampleTimes.map((time, index) => ({
            x: time,
            y: video.tiktokViews[index]
        }));

        const instagramData = video.instagramViews ? sampleTimes.map((time, index) => ({
            x: time,
            y: video.instagramViews[index]
        })) : [];

        // Calculate total views for each date
        const totalData = sampleTimes.map((date, index) => ({
            x: new Date(date),
            y: video.youtubeViews[index] + video.tiktokViews[index] + (video.instagramViews ? video.instagramViews[index] : 0)
        }));

        const datasets = [
            {
                label: 'YouTube',
                data: youtubeData,
                borderColor: '#ff0000',
                backgroundColor: 'rgba(255, 0, 0, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ff0000',
                pointBorderColor: '#1a1a1a',
                pointBorderWidth: 1,
                pointRadius: 3,
                pointHoverRadius: 5
            },
            {
                label: 'TikTok',
                data: tiktokData,
                borderColor: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#1a1a1a',
                pointBorderWidth: 1,
                pointRadius: 3,
                pointHoverRadius: 5
            }
        ];

        // Add Instagram dataset if data exists
        if (instagramData.length > 0) {
            datasets.push({
                label: 'Instagram',
                data: instagramData,
                borderColor: '#ff69b4',
                backgroundColor: 'rgba(255, 105, 180, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ff69b4',
                pointBorderColor: '#1a1a1a',
                pointBorderWidth: 1,
                pointRadius: 3,
                pointHoverRadius: 5
            });
        }

        datasets.push({
            label: 'Total',
            data: totalData,
            borderColor: '#ffd700',
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            borderWidth: 3,
            fill: false,
            tension: 0.4,
            pointBackgroundColor: '#ffd700',
            pointBorderColor: '#1a1a1a',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
        });

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#cccccc',
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: '#2d2d2d',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#ffd700',
                        borderWidth: 1,
                        callbacks: {
                            title: function(context: any) {
                                const date = new Date(context[0].parsed.x);
                                const timeString = date.toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    hour12: true 
                                });
                                const dateString = date.toLocaleDateString('en-US', { 
                                    month: 'long', 
                                    day: 'numeric' 
                                });
                                return `${dateString}, ${timeString}`;
                            },
                            label: function(context: any) {
                                return `${context.dataset.label}: ${formatNumber(context.parsed.y)} views`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            displayFormats: {
                                day: 'MMM d'
                            }
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#cccccc',
                            font: {
                                size: 10
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
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });

        this.videoCharts.set(video.id, chart);
    }

    showYouTubePlayer(videoLink: string, videoTitle: string) {
        // Remove existing player if present
        const existingPlayer = document.querySelector('.youtube-player-fixed');
        if (existingPlayer) {
            existingPlayer.remove();
        }

        // Create fixed player in bottom right
        const player = document.createElement('div');
        player.className = 'youtube-player-fixed';
        player.innerHTML = `
            <div class="youtube-player-header">
                <h4>${videoTitle}</h4>
                <button class="close-button">&times;</button>
            </div>
            <div class="youtube-player-content">
                <iframe 
                    width="340" 
                    height="640" 
                    src="${videoLink.replace('/shorts/', '/embed/')}?autoplay=1&rel=0" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    loading="lazy">
                </iframe>
            </div>
        `;
        
        document.body.appendChild(player);
        
        // Close player when clicking close button
        const closeButton = player.querySelector('.close-button') as HTMLElement;
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                player.remove();
            });
        }
        
        // Close player with Escape key
        document.addEventListener('keydown', function closeOnEscape(e) {
            if (e.key === 'Escape') {
                player.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        });
    }

    updateLastUpdated() {
        const lastUpdated = document.getElementById('last-updated');
        const latestDate = sampleTimes[sampleTimes.length - 1];
        
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
    new ProducerTracker();
}); 