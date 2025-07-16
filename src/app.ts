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
            const producerCard = this.createProducerCard(producer, winner, loser);
            container.appendChild(producerCard);
        });
    }

    createProducerCard(producer: any, winner: any, loser: any): HTMLElement {
        const template = document.getElementById('producer-card-template') as HTMLTemplateElement;
        if (!template) {
            throw new Error('Producer card template not found');
        }

        const clone = template.content.cloneNode(true) as DocumentFragment;
        const card = clone.querySelector('.legend-item') as HTMLElement;
        
        if (!card) {
            throw new Error('Producer card element not found in template');
        }

        // Set basic properties
        card.dataset.producer = producer.id;
        card.style.background = producer.color;

        // Add crown for winner
        if (producer.id === winner.id) {
            const crown = document.createElement('div');
            crown.className = 'crown';
            crown.textContent = '👑';
            card.querySelector('.producer-profile')?.appendChild(crown);
        }

        // Add stink lines for loser
        if (producer.id === loser.id) {
            const stinkLines = this.createStinkLines();
            card.querySelector('.producer-profile')?.appendChild(stinkLines);
        }

        // Set image and fallback
        const imageName = producer.name.toLowerCase();
        const img = card.querySelector('.profile-image') as HTMLImageElement;
        if (img) {
            img.src = `/assets/${imageName}.png`;
            img.alt = producer.fullName;
        }

        // Set text content
        const nameElement = card.querySelector('.producer-name');
        if (nameElement) nameElement.textContent = producer.fullName;

        const totalElement = card.querySelector('.producer-total');
        if (totalElement) totalElement.textContent = `${formatNumber(producer.stats.total)} Views`;

        const youtubeCount = card.querySelector('.youtube-count');
        if (youtubeCount) youtubeCount.textContent = `YT: ${formatNumber(producer.stats.youtube)}`;

        const tiktokCount = card.querySelector('.tiktok-count');
        if (tiktokCount) tiktokCount.textContent = `TT: ${formatNumber(producer.stats.tiktok)}`;

        const instagramCount = card.querySelector('.instagram-count') as HTMLElement;
        if (instagramCount && producer.stats.instagram > 0) {
            instagramCount.textContent = `IR: ${formatNumber(producer.stats.instagram)}`;
            instagramCount.style.display = 'inline';
        }

        const videoCount = card.querySelector('.producer-video-count');
        const shortsText = producer.stats.videoCount === 1 ? 'Short' : 'Shorts';
        if (videoCount) videoCount.textContent = `${producer.stats.videoCount} ${shortsText}`;

        const soloCount = card.querySelector('.producer-solo-count');
        if (soloCount) soloCount.textContent = `${producer.stats.soloVideoCount} Solo`;

        return card;
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

    createVideoChartContainer(video: Video): HTMLElement {
        const template = document.getElementById('video-chart-container-template') as HTMLTemplateElement;
        if (!template) {
            throw new Error('Video chart container template not found');
        }

        const clone = template.content.cloneNode(true) as DocumentFragment;
        const container = clone.querySelector('.chart-container') as HTMLElement;
        
        if (!container) {
            throw new Error('Chart container element not found in template');
        }

        // Set container ID
        container.id = `container-${video.id}`;

        // Set title and link
        const titleElement = container.querySelector('.clickable-title') as HTMLElement;
        if (titleElement) {
            titleElement.textContent = video.title;
            titleElement.dataset.videoLink = video.links.youtube;
        }

        // Set total views
        const totalViewsElement = container.querySelector('.total-views-display');
        if (totalViewsElement) {
            totalViewsElement.textContent = formatNumber(getLatestTotalViews(video));
        }

        // Set platform links
        const youtubeLink = container.querySelector('.youtube-icon') as HTMLAnchorElement;
        if (youtubeLink) youtubeLink.href = video.links.youtube;

        const tiktokLink = container.querySelector('.tiktok-icon') as HTMLAnchorElement;
        if (tiktokLink) tiktokLink.href = video.links.tiktok;

        const instagramLink = container.querySelector('.instagram-icon') as HTMLAnchorElement;
        if (instagramLink) instagramLink.href = video.links.instagram;

        // Set total contribution
        const totalContribution = Object.values(video.contributions).reduce((sum, amount) => sum + amount, 0).toLocaleString();
        const contributionElement = container.querySelector('.total-contribution');
        if (contributionElement) {
            contributionElement.textContent = `$${totalContribution}`;
        }

        // Add performance indicators
        const performanceIndicators = this.getPerformanceIndicators(video);
        const indicatorsContainer = container.querySelector('.performance-indicators');
        if (indicatorsContainer) {
            indicatorsContainer.innerHTML = performanceIndicators;
        }

                 // Add value indicator if best value
         const isBestValue = this.isBestValuePerDollar(video);
         if (isBestValue && indicatorsContainer) {
             const totalViews = getLatestTotalViews(video);
             const totalContribution = Object.values(video.contributions).reduce((sum, amount) => sum + amount, 0);
             const viewsPerDollar = Math.round(totalViews / totalContribution);
             const valueIndicator = this.createBestValueIndicator(viewsPerDollar);
             indicatorsContainer.appendChild(valueIndicator);
         }

        // Set canvas ID
        const canvas = container.querySelector('canvas') as HTMLCanvasElement;
        if (canvas) {
            canvas.id = `chart-${video.id}`;
        }

        // Add producer bubbles
        const producerBubbles = this.createProducerBubbles(video);
        const bubblesContainer = container.querySelector('.producer-bubbles');
        if (bubblesContainer) {
            bubblesContainer.innerHTML = '';
            producerBubbles.forEach(bubble => {
                bubblesContainer.appendChild(bubble);
            });
        }
        
        // Add click handler for video title
        if (titleElement) {
            titleElement.addEventListener('click', () => {
                this.showYouTubePlayer(video.links.youtube, video.title);
            });
        }
        
        return container;
    }

    createStinkLines(): HTMLElement {
        const template = document.getElementById('stink-lines-template') as HTMLTemplateElement;
        if (!template) {
            throw new Error('Stink lines template not found');
        }

        const clone = template.content.cloneNode(true) as DocumentFragment;
        const stinkLines = clone.querySelector('.stink-lines') as HTMLElement;
        
        if (!stinkLines) {
            throw new Error('Stink lines element not found in template');
        }

        return stinkLines;
    }

    createBestValueIndicator(viewsPerDollar: number): HTMLElement {
        const template = document.getElementById('best-value-indicator-template') as HTMLTemplateElement;
        if (!template) {
            throw new Error('Best value indicator template not found');
        }

        const clone = template.content.cloneNode(true) as DocumentFragment;
        const indicator = clone.querySelector('.value-indicator-container') as HTMLElement;
        
        if (!indicator) {
            throw new Error('Value indicator element not found in template');
        }

        // Set the tooltip with the views per dollar ratio
        indicator.title = `Best value: ${formatNumber(viewsPerDollar)} views per dollar`;

        return indicator;
    }

    createProducerBubbles(video: Video): HTMLElement[] {
        const template = document.getElementById('producer-bubble-template') as HTMLTemplateElement;
        if (!template) {
            throw new Error('Producer bubble template not found');
        }

        const producers = getProducersFromContributions(video.contributions);
        const totalViews = getLatestTotalViews(video);
        const producerShare = totalViews / producers.length;

        return producers.map(producerId => {
            const producer = getProducerById(producerId);
            if (!producer) return document.createElement('span');

            const clone = template.content.cloneNode(true) as DocumentFragment;
            const bubble = clone.querySelector('.producer-bubble') as HTMLElement;
            
            if (!bubble) return document.createElement('span');

            // Set bubble properties
            bubble.style.background = producer.color;
            const contribution = video.contributions[producerId] || 0;
            bubble.title = `${producer.fullName}: $${contribution} - ${formatNumber(producerShare)} views`;

            // Set image
            const imageName = producer.name.toLowerCase();
            const img = bubble.querySelector('.profile-image') as HTMLImageElement;
            if (img) {
                img.src = `/assets/${imageName}.png`;
                img.alt = producer.name;
            }

            // Set producer name
            const nameElement = bubble.querySelector('.producer-name');
            if (nameElement) nameElement.textContent = producer.name;

            return bubble;
        });
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
        
        if (isBestYouTube) {
            const arrow = this.createPerformanceArrow('youtube-arrow', `Best YouTube performer in last 24h (+${formatNumber(youtubeGrowth)} views)`);
            indicators.push(arrow.outerHTML);
        }
        if (isBestTiktok) {
            const arrow = this.createPerformanceArrow('tiktok-arrow', `Best TikTok performer in last 24h (+${formatNumber(tiktokGrowth)} views)`);
            indicators.push(arrow.outerHTML);
        }
        if (isBestInstagram) {
            const arrow = this.createPerformanceArrow('instagram-arrow', `Best Instagram performer in last 24h (+${formatNumber(instagramGrowth)} views)`);
            indicators.push(arrow.outerHTML);
        }
        if (isBestOverall) {
            const arrow = this.createPerformanceArrow('overall-arrow', `Best overall performer in last 24h (+${formatNumber(totalGrowth)} views)`);
            indicators.push(arrow.outerHTML);
        }
        
        return indicators.join('');
    }

    createPerformanceArrow(arrowClass: string, title: string): HTMLElement {
        const template = document.getElementById('performance-arrow-template') as HTMLTemplateElement;
        if (!template) {
            throw new Error('Performance arrow template not found');
        }

        const clone = template.content.cloneNode(true) as DocumentFragment;
        const container = clone.querySelector('.performance-arrow-container') as HTMLElement;
        
        if (!container) {
            throw new Error('Performance arrow container not found in template');
        }

        container.title = title;
        const arrow = container.querySelector('.performance-arrow') as HTMLElement;
        if (arrow) {
            arrow.className = `performance-arrow ${arrowClass}`;
        }

        return container;
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

        // Create fixed player using template
        const template = document.getElementById('youtube-player-template') as HTMLTemplateElement;
        if (!template) {
            throw new Error('YouTube player template not found');
        }

        const clone = template.content.cloneNode(true) as DocumentFragment;
        const player = clone.querySelector('.youtube-player-fixed') as HTMLElement;
        
        if (!player) {
            throw new Error('YouTube player element not found in template');
        }

        // Set title
        const titleElement = player.querySelector('h4');
        if (titleElement) titleElement.textContent = videoTitle;

        // Set iframe src
        const iframe = player.querySelector('iframe') as HTMLIFrameElement;
        if (iframe) {
            iframe.src = videoLink.replace('/shorts/', '/embed/') + '?autoplay=1&rel=0';
        }
        
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