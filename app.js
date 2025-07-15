// Main application logic for Producer Performance Tracker
class ProducerTracker {
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
        document.getElementById('platform-filter').addEventListener('change', (e) => {
            this.currentPlatform = e.target.value;
            this.renderProducerComparisonChart();
            this.renderProducerStats();
        });

        // Producer legend click handlers
        document.querySelectorAll('.legend-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const producerId = e.currentTarget.dataset.producer;
                this.toggleProducerVisibility(producerId);
            });
        });
    }

    renderProducerComparisonChart() {
        const ctx = document.getElementById('producer-comparison-chart');
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.producerChart) {
            this.producerChart.destroy();
        }

        const dates = getAllDates();
        
        // Create datasets for each producer with actual timestamps
        const datasets = producers.map(producer => {
            const data = dates.map(date => ({
                x: new Date(date),
                y: getProducerViewsForDate(producer.id, date, this.currentPlatform)
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
                datasets: datasets
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
                            title: function(context) {
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
                            label: function(context) {
                                const producer = producers.find(p => p.name === context.dataset.label);
                                return `${producer.name}: ${formatNumber(context.parsed.y)} views`;
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
                            callback: function(value) {
                                return formatNumber(value);
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
            const stinkLines = isLoser ? '<div class="stink-lines">💨</div>' : '';
            
            producerCard.innerHTML = `
                <div class="producer-card">
                    <div class="producer-profile">
                        ${crownElement}
                        ${stinkLines}
                        <img src="assets/${imageName}.png" alt="${producer.fullName}" class="profile-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <span class="fallback-icon">👤</span>
                    </div>
                    <div class="producer-info">
                        <div class="producer-name">${producer.fullName}</div>
                        <div class="producer-total">${formatNumber(producer.stats.total)} Views</div>
                        <div class="producer-breakdown">
                            <span class="youtube-count">YT: ${formatNumber(producer.stats.youtube)}</span>
                            <span class="tiktok-count">TT: ${formatNumber(producer.stats.tiktok)}</span>
                        </div>
                    </div>
                </div>
            `;
            
            producerCard.addEventListener('click', () => {
                this.toggleProducerVisibility(producer.id);
            });
            
            container.appendChild(producerCard);
        });
    }

    getProducerStats(producerId) {
        const dates = getAllDates();
        const latestDate = dates[dates.length - 1];
        
        let youtubeTotal = 0;
        let tiktokTotal = 0;
        
        videoData.forEach(video => {
            if (video.producers.includes(producerId)) {
                const sharePercentage = 1 / video.producers.length;
                
                if (this.currentPlatform === 'youtube' || this.currentPlatform === 'all') {
                    const youtubeView = video.youtubeViews.find(v => v.date === latestDate);
                    if (youtubeView) {
                        youtubeTotal += youtubeView.count * sharePercentage;
                    }
                }
                
                if (this.currentPlatform === 'tiktok' || this.currentPlatform === 'all') {
                    const tiktokView = video.tiktokViews.find(v => v.date === latestDate);
                    if (tiktokView) {
                        tiktokTotal += tiktokView.count * sharePercentage;
                    }
                }
            }
        });
        
        return {
            total: Math.round(youtubeTotal + tiktokTotal),
            youtube: Math.round(youtubeTotal),
            tiktok: Math.round(tiktokTotal)
        };
    }

    toggleProducerVisibility(producerId) {
        const legendItem = document.querySelector(`[data-producer="${producerId}"]`);
        const isHidden = legendItem.classList.contains('hidden');
        
        if (isHidden) {
            legendItem.classList.remove('hidden');
            this.producerChart.show(producerId);
        } else {
            legendItem.classList.add('hidden');
            this.producerChart.hide(producerId);
        }
    }

    renderVideoCharts() {
        const container = document.getElementById('video-charts-grid');
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

    createVideoChartContainer(video) {
        const container = document.createElement('div');
        container.className = 'chart-container';
        
        // Create producer bubbles
        const producerBubbles = video.producers.map(producerId => {
            const producer = getProducerById(producerId);
            const imageName = producer.name.toLowerCase();
            return `<span class="producer-bubble" style="background: ${producer.color};"><span class="producer-icon"><img src="assets/${imageName}.png" alt="${producer.name}" class="profile-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><span class="fallback-icon">👤</span></span>${producer.name}</span>`;
        }).join('');

        container.innerHTML = `
            <div class="chart-header">
                <div class="chart-title">${video.title}</div>
                <div class="total-views-display">${formatNumber(getLatestTotalViews(video))}</div>
            </div>
            <canvas id="chart-${video.id}" width="400" height="200"></canvas>
            <div class="producer-bubbles">
                ${producerBubbles}
            </div>
        `;
        return container;
    }

    renderVideoChart(video) {
        const ctx = document.getElementById(`chart-${video.id}`);
        if (!ctx) return;

        // Create datasets with actual timestamps for linear time scaling
        const youtubeData = video.youtubeViews.map(view => ({
            x: new Date(view.date),
            y: view.count
        }));
        
        const tiktokData = video.tiktokViews.map(view => ({
            x: new Date(view.date),
            y: view.count
        }));

        // Calculate total views for each date
        const totalData = youtubeData.map((youtube, index) => ({
            x: youtube.x,
            y: youtube.y + tiktokData[index].y
        }));

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
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
                    },
                    {
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
                    }
                ]
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
                            title: function(context) {
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
                            label: function(context) {
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
                            callback: function(value) {
                                return formatNumber(value);
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

    updateLastUpdated() {
        const lastUpdated = document.getElementById('last-updated');
        const now = new Date();
        lastUpdated.textContent = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProducerTracker();
}); 