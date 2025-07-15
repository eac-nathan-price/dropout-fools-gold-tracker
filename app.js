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
    }

    setupEventListeners() {
        // Platform filter for producer comparison
        document.getElementById('platform-filter').addEventListener('change', (e) => {
            this.currentPlatform = e.target.value;
            this.renderProducerComparisonChart();
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
        const labels = dates.map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        // Create datasets for each producer
        const datasets = producers.map(producer => {
            const data = dates.map(date => getProducerViewsForDate(producer.id, date, this.currentPlatform));
            
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
                labels: labels,
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
                            label: function(context) {
                                const producer = producers.find(p => p.name === context.dataset.label);
                                return `${producer.name}: ${formatNumber(context.parsed.y)} views`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
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
            return `<span class="producer-bubble" style="background: ${producer.color};"><span class="producer-icon">👤</span>${producer.name}</span>`;
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

        const labels = video.youtubeViews.map(view => {
            const date = new Date(view.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        // Create stacked area chart for YouTube and TikTok
        const youtubeData = video.youtubeViews.map(view => view.count);
        const tiktokData = video.tiktokViews.map(view => view.count);

        // Calculate total views for each date
        const totalData = youtubeData.map((youtube, index) => youtube + tiktokData[index]);

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
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
                            label: function(context) {
                                return `${context.dataset.label}: ${formatNumber(context.parsed.y)} views`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
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