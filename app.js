// Main application logic
class ShortsTracker {
    constructor() {
        this.currentTab = 'individual';
        this.filters = {
            platform: 'all',
            tag: 'all'
        };
        this.charts = new Map();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.populateFilters();
        this.updateLastUpdated();
        this.renderCurrentTab();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Individual video filters
        document.getElementById('platform-filter').addEventListener('change', (e) => {
            this.filters.platform = e.target.value;
            this.renderIndividualVideos();
        });

        document.getElementById('tag-filter').addEventListener('change', (e) => {
            this.filters.tag = e.target.value;
            this.renderIndividualVideos();
        });

        // Group filters
        document.getElementById('group-platform-filter').addEventListener('change', (e) => {
            this.filters.groupPlatform = e.target.value;
            this.renderGroupCharts();
        });
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabName);
        });

        this.currentTab = tabName;
        this.renderCurrentTab();
    }

    populateFilters() {
        // Populate tag filter
        const tagFilter = document.getElementById('tag-filter');
        const tags = getAllTags();
        
        tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
            tagFilter.appendChild(option);
        });
    }

    renderCurrentTab() {
        if (this.currentTab === 'individual') {
            this.renderIndividualVideos();
        } else {
            this.renderGroupCharts();
        }
    }

    renderIndividualVideos() {
        const container = document.getElementById('individual-charts');
        const filteredVideos = this.getFilteredVideos();
        
        if (filteredVideos.length === 0) {
            container.innerHTML = '<div class="loading">No videos found with current filters</div>';
            return;
        }

        container.innerHTML = '';
        
        filteredVideos.forEach(video => {
            const chartContainer = this.createVideoChartContainer(video);
            container.appendChild(chartContainer);
        });

        // Render charts after DOM elements are created
        setTimeout(() => {
            filteredVideos.forEach(video => {
                this.renderVideoChart(video);
            });
        }, 100);
    }

    renderGroupCharts() {
        const container = document.getElementById('group-charts');
        const platformFilter = this.filters.groupPlatform || 'all';
        
        // Get all unique tags
        const tags = getAllTags();
        const filteredTags = tags.filter(tag => {
            if (platformFilter === 'all') return true;
            return videoData.some(video => 
                video.platform === platformFilter && video.tags.includes(tag)
            );
        });

        if (filteredTags.length === 0) {
            container.innerHTML = '<div class="loading">No groups found with current filters</div>';
            return;
        }

        container.innerHTML = '';
        
        filteredTags.forEach(tag => {
            const chartContainer = this.createGroupChartContainer(tag);
            container.appendChild(chartContainer);
        });

        // Render charts after DOM elements are created
        setTimeout(() => {
            filteredTags.forEach(tag => {
                this.renderGroupChart(tag);
            });
        }, 100);
    }

    getFilteredVideos() {
        return videoData.filter(video => {
            if (this.filters.platform !== 'all' && video.platform !== this.filters.platform) {
                return false;
            }
            if (this.filters.tag !== 'all' && !video.tags.includes(this.filters.tag)) {
                return false;
            }
            return true;
        });
    }

    createVideoChartContainer(video) {
        const container = document.createElement('div');
        container.className = 'chart-container';
        container.innerHTML = `
            <div class="chart-header">
                <div>
                    <div class="chart-title">${video.title}</div>
                    <div class="tags">
                        ${video.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <span class="platform-badge ${video.platform}">${video.platform}</span>
            </div>
            <canvas id="chart-${video.id}" width="400" height="200"></canvas>
            <div class="chart-stats">
                <div class="stat-item">
                    <div class="stat-value">${formatNumber(getLatestViews(video))}</div>
                    <div class="stat-label">Latest Views</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${formatNumber(getTotalViews(video))}</div>
                    <div class="stat-label">Total Views</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${formatNumber(getAverageGrowth(video))}</div>
                    <div class="stat-label">Avg Daily Growth</div>
                </div>
            </div>
        `;
        return container;
    }

    createGroupChartContainer(tag) {
        const container = document.createElement('div');
        container.className = 'chart-container';
        container.innerHTML = `
            <div class="chart-header">
                <div>
                    <div class="chart-title">${tag.charAt(0).toUpperCase() + tag.slice(1)} Group</div>
                    <div class="tags">
                        <span class="tag">${tag}</span>
                    </div>
                </div>
            </div>
            <canvas id="group-chart-${tag}" width="400" height="200"></canvas>
            <div class="chart-stats">
                <div class="stat-item">
                    <div class="stat-value" id="group-total-${tag}">-</div>
                    <div class="stat-label">Total Views</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="group-videos-${tag}">-</div>
                    <div class="stat-label">Videos</div>
                </div>
            </div>
        `;
        return container;
    }

    renderVideoChart(video) {
        const ctx = document.getElementById(`chart-${video.id}`);
        if (!ctx) return;

        const labels = video.views.map(view => {
            const date = new Date(view.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        const data = video.views.map(view => view.count);

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Views',
                    data: data,
                    borderColor: video.platform === 'youtube' ? '#ff0000' : '#000000',
                    backgroundColor: video.platform === 'youtube' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: video.platform === 'youtube' ? '#ff0000' : '#000000',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `Views: ${formatNumber(context.parsed.y)}`;
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
                            color: '#666',
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: '#f0f0f0'
                        },
                        ticks: {
                            color: '#666',
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

        this.charts.set(video.id, chart);
    }

    renderGroupChart(tag) {
        const ctx = document.getElementById(`group-chart-${tag}`);
        if (!ctx) return;

        // Get all videos with this tag
        const platformFilter = this.filters.groupPlatform || 'all';
        const groupVideos = videoData.filter(video => {
            if (!video.tags.includes(tag)) return false;
            if (platformFilter !== 'all' && video.platform !== platformFilter) return false;
            return true;
        });

        if (groupVideos.length === 0) return;

        // Get all unique dates from all videos in the group
        const allDates = new Set();
        groupVideos.forEach(video => {
            video.views.forEach(view => allDates.add(view.date));
        });

        const sortedDates = Array.from(allDates).sort();
        const labels = sortedDates.map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        // Calculate aggregated views for each date
        const aggregatedData = sortedDates.map(date => {
            return groupVideos.reduce((sum, video) => {
                const viewData = video.views.find(v => v.date === date);
                return sum + (viewData ? viewData.count : 0);
            }, 0);
        });

        // Update stats
        const totalViews = aggregatedData[aggregatedData.length - 1] || 0;
        document.getElementById(`group-total-${tag}`).textContent = formatNumber(totalViews);
        document.getElementById(`group-videos-${tag}`).textContent = groupVideos.length;

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Views',
                    data: aggregatedData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `Total Views: ${formatNumber(context.parsed.y)}`;
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
                            color: '#666',
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: '#f0f0f0'
                        },
                        ticks: {
                            color: '#666',
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

        this.charts.set(`group-${tag}`, chart);
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
    new ShortsTracker();
}); 