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
            if (video.producers.includes(producerId)) {
                videoCount++;
                if (video.producers.length === 1) {
                    soloVideoCount++;
                }
                const sharePercentage = 1 / video.producers.length;
                
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
        const producerShare = totalViews / video.producers.length;
        
        // Create producer bubbles
        const producerBubbles = video.producers.map(producerId => {
            const producer = getProducerById(producerId);
            if (!producer) return '';
            const imageName = producer.name.toLowerCase();
            return `<span class="producer-bubble" style="background: ${producer.color};" title="${producer.fullName}: ${formatNumber(producerShare)} views"><span class="producer-icon"><img src="/assets/${imageName}.png" alt="${producer.name}" class="profile-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><span class="fallback-icon">👤</span></span>${producer.name}</span>`;
        }).join('');

        container.innerHTML = `
            <div class="chart-header">
                <div class="chart-title clickable-title" data-video-link="${video.link}">${video.title}</div>
                <div class="total-views-display">${formatNumber(getLatestTotalViews(video))}</div>
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
                this.showYouTubePlayer(video.link, video.title);
            });
        }
        
        return container;
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