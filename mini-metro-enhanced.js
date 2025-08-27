// Mini Metro Enhanced - Premium UI Experience

class MiniMetroUI {
    constructor() {
        this.currentScreen = 'main-menu';
        this.selectedCity = null;
        this.selectedMode = 'normal';
        this.currentView = 'map';
        this.cities = this.initializeCities();
        this.achievements = this.initializeAchievements();
        this.soundEnabled = true;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadProgress();
        this.hideLoadingScreen();
        this.initializeWorldMap();
        this.startBackgroundAnimations();
        this.setupSoundEffects();
    }
    
    initializeCities() {
        const cities = [
            // Starting cities
            { id: 'london', name: 'LONDON', x: 0.51, y: 0.33, unlocked: true, target: 750, highscore: 0, stars: 0, difficulty: 3, river: 'thames', continent: 'europe' },
            { id: 'paris', name: 'PARIS', x: 0.52, y: 0.35, unlocked: true, target: 750, highscore: 0, stars: 0, difficulty: 3, river: 'seine', continent: 'europe' },
            { id: 'newyork', name: 'NEW YORK', x: 0.28, y: 0.40, unlocked: true, target: 750, highscore: 0, stars: 0, difficulty: 4, river: 'hudson', continent: 'north-america' },
            
            // Unlockable cities
            { id: 'berlin', name: 'BERLIN', x: 0.54, y: 0.32, unlocked: false, target: 750, requires: 'london', highscore: 0, stars: 0, difficulty: 4, river: 'spree', continent: 'europe' },
            { id: 'tokyo', name: 'TOKYO', x: 0.86, y: 0.42, unlocked: false, target: 900, requires: 'paris', highscore: 0, stars: 0, difficulty: 5, continent: 'asia' },
            { id: 'hongkong', name: 'HONG KONG', x: 0.82, y: 0.48, unlocked: false, target: 900, requires: 'newyork', highscore: 0, stars: 0, difficulty: 4, continent: 'asia' },
            { id: 'osaka', name: 'OSAKA', x: 0.85, y: 0.43, unlocked: false, target: 900, requires: 'berlin', highscore: 0, stars: 0, difficulty: 4, continent: 'asia' },
            { id: 'saopaulo', name: 'SÃO PAULO', x: 0.35, y: 0.68, unlocked: false, target: 1000, requires: 'tokyo', highscore: 0, stars: 0, difficulty: 4, continent: 'south-america' },
            { id: 'petersburg', name: 'ST PETERSBURG', x: 0.58, y: 0.25, unlocked: false, target: 1000, requires: 'hongkong', highscore: 0, stars: 0, difficulty: 3, continent: 'europe' },
            { id: 'montreal', name: 'MONTREAL', x: 0.28, y: 0.35, unlocked: false, target: 1000, requires: 'osaka', highscore: 0, stars: 0, difficulty: 3, continent: 'north-america' },
            { id: 'sanfrancisco', name: 'SAN FRANCISCO', x: 0.22, y: 0.42, unlocked: false, target: 1100, requires: 'saopaulo', highscore: 0, stars: 0, difficulty: 4, continent: 'north-america' },
            { id: 'cairo', name: 'CAIRO', x: 0.58, y: 0.52, unlocked: false, target: 1100, requires: 'petersburg', highscore: 0, stars: 0, difficulty: 3, continent: 'africa' },
            { id: 'istanbul', name: 'ISTANBUL', x: 0.57, y: 0.40, unlocked: false, target: 1100, requires: 'montreal', highscore: 0, stars: 0, difficulty: 4, continent: 'europe' },
            { id: 'shanghai', name: 'SHANGHAI', x: 0.83, y: 0.46, unlocked: false, target: 1200, requires: 'sanfrancisco', highscore: 0, stars: 0, difficulty: 5, continent: 'asia' },
            { id: 'singapore', name: 'SINGAPORE', x: 0.79, y: 0.58, unlocked: false, target: 1200, requires: 'cairo', highscore: 0, stars: 0, difficulty: 4, continent: 'asia' },
            { id: 'stockholm', name: 'STOCKHOLM', x: 0.55, y: 0.24, unlocked: false, target: 1200, requires: 'istanbul', highscore: 0, stars: 0, difficulty: 3, continent: 'europe' },
            { id: 'mumbai', name: 'MUMBAI', x: 0.71, y: 0.50, unlocked: false, target: 1300, requires: 'shanghai', highscore: 0, stars: 0, difficulty: 5, continent: 'asia' },
            { id: 'auckland', name: 'AUCKLAND', x: 0.95, y: 0.72, unlocked: false, target: 1300, requires: 'singapore', highscore: 0, stars: 0, difficulty: 3, continent: 'oceania' },
            { id: 'seoul', name: 'SEOUL', x: 0.84, y: 0.41, unlocked: false, target: 1300, requires: 'stockholm', highscore: 0, stars: 0, difficulty: 4, continent: 'asia' },
            { id: 'washington', name: 'WASHINGTON', x: 0.29, y: 0.39, unlocked: false, target: 1400, requires: 'mumbai', highscore: 0, stars: 0, difficulty: 3, continent: 'north-america' },
            { id: 'prague', name: 'PRAGUE', x: 0.54, y: 0.34, unlocked: false, target: 1400, requires: 'auckland', highscore: 0, stars: 0, difficulty: 3, continent: 'europe' },
            { id: 'melbourne', name: 'MELBOURNE', x: 0.88, y: 0.73, unlocked: false, target: 1400, requires: 'seoul', highscore: 0, stars: 0, difficulty: 4, continent: 'oceania' },
            { id: 'taipei', name: 'TAIPEI', x: 0.83, y: 0.47, unlocked: false, target: 1500, requires: 'washington', highscore: 0, stars: 0, difficulty: 4, continent: 'asia' },
            { id: 'lisbon', name: 'LISBON', x: 0.48, y: 0.39, unlocked: false, target: 1500, requires: 'prague', highscore: 0, stars: 0, difficulty: 3, continent: 'europe' },
            { id: 'guangzhou', name: 'GUANGZHOU', x: 0.82, y: 0.48, unlocked: false, target: 1500, requires: 'melbourne', highscore: 0, stars: 0, difficulty: 4, continent: 'asia' },
            { id: 'warsaw', name: 'WARSAW', x: 0.55, y: 0.31, unlocked: false, target: 1600, requires: 'taipei', highscore: 0, stars: 0, difficulty: 3, continent: 'europe' },
            { id: 'bangkok', name: 'BANGKOK', x: 0.78, y: 0.54, unlocked: false, target: 1600, requires: 'lisbon', highscore: 0, stars: 0, difficulty: 4, continent: 'asia' },
            { id: 'dubai', name: 'DUBAI', x: 0.65, y: 0.47, unlocked: false, target: 1600, requires: 'guangzhou', highscore: 0, stars: 0, difficulty: 4, continent: 'asia' },
            { id: 'bucharest', name: 'BUCHAREST', x: 0.56, y: 0.37, unlocked: false, target: 1700, requires: 'warsaw', highscore: 0, stars: 0, difficulty: 3, continent: 'europe' },
            { id: 'budapest', name: 'BUDAPEST', x: 0.55, y: 0.36, unlocked: false, target: 1700, requires: 'bangkok', highscore: 0, stars: 0, difficulty: 3, continent: 'europe' },
            { id: 'mexico', name: 'MEXICO CITY', x: 0.24, y: 0.50, unlocked: false, target: 1700, requires: 'dubai', highscore: 0, stars: 0, difficulty: 4, continent: 'north-america' },
            { id: 'lagos', name: 'LAGOS', x: 0.52, y: 0.57, unlocked: false, target: 1800, requires: 'bucharest', highscore: 0, stars: 0, difficulty: 5, continent: 'africa' },
            { id: 'jakarta', name: 'JAKARTA', x: 0.80, y: 0.60, unlocked: false, target: 1800, requires: 'budapest', highscore: 0, stars: 0, difficulty: 4, continent: 'asia' },
            { id: 'changchun', name: 'CHANGCHUN', x: 0.84, y: 0.37, unlocked: false, target: 1800, requires: 'mexico', highscore: 0, stars: 0, difficulty: 3, continent: 'asia' }
        ];
        
        return cities;
    }
    
    initializeAchievements() {
        return [
            { id: 'first_city', name: 'First Steps', description: 'Complete your first city', icon: '🎯', progress: 0, target: 1, unlocked: false },
            { id: 'efficient', name: 'Efficiency Expert', description: 'Transport 1000 passengers with 3 lines', icon: '⚡', progress: 0, target: 1000, unlocked: false },
            { id: 'bridge_master', name: 'Bridge Master', description: 'Complete a city using only 2 bridges', icon: '🌉', progress: 0, target: 1, unlocked: false },
            { id: 'speed_demon', name: 'Speed Demon', description: 'Transport 500 passengers in under 5 minutes', icon: '🏃', progress: 0, target: 500, unlocked: false },
            { id: 'perfectionist', name: 'Perfectionist', description: 'Get 3 stars on 10 cities', icon: '⭐', progress: 0, target: 10, unlocked: false },
            { id: 'world_tour', name: 'World Tour', description: 'Unlock all cities', icon: '🌍', progress: 0, target: 34, unlocked: false },
            { id: 'minimalist', name: 'Minimalist', description: 'Complete a city with only 2 lines', icon: '➖', progress: 0, target: 1, unlocked: false },
            { id: 'rush_hour', name: 'Rush Hour Hero', description: 'Handle 50 passengers at once', icon: '🚇', progress: 0, target: 50, unlocked: false }
        ];
    }
    
    setupEventListeners() {
        // Prevent context menu
        document.addEventListener('contextmenu', e => e.preventDefault());
        
        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscape();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterCities(e.target.dataset.filter);
            });
        });
        
        // Mode cards
        document.querySelectorAll('.mode-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.playHoverSound();
            });
        });
    }
    
    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 350);
        }, 2000);
    }
    
    initializeWorldMap() {
        const svg = document.querySelector('.world-map');
        const markersGroup = svg.querySelector('.city-markers');
        const connectionsGroup = svg.querySelector('.connections');
        
        // Draw connections between unlocked cities
        this.cities.forEach(city => {
            if (city.unlocked && city.requires) {
                const requiredCity = this.cities.find(c => c.id === city.requires);
                if (requiredCity && requiredCity.unlocked) {
                    const connection = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    connection.classList.add('city-connection');
                    connection.setAttribute('d', `M${requiredCity.x * 1200},${requiredCity.y * 600} L${city.x * 1200},${city.y * 600}`);
                    connectionsGroup.appendChild(connection);
                }
            }
        });
        
        // Create city markers
        this.cities.forEach(city => {
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            marker.classList.add('city-marker');
            if (city.unlocked) marker.classList.add('unlocked');
            if (city.highscore >= city.target) marker.classList.add('completed');
            if (!city.unlocked) marker.classList.add('locked');
            
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.classList.add('city-marker-circle');
            circle.setAttribute('cx', city.x * 1200);
            circle.setAttribute('cy', city.y * 600);
            circle.setAttribute('r', 8);
            
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.classList.add('city-marker-label');
            label.setAttribute('x', city.x * 1200);
            label.setAttribute('y', city.y * 600 + 20);
            label.textContent = city.name.substring(0, 3).toUpperCase();
            
            marker.appendChild(circle);
            marker.appendChild(label);
            
            if (city.unlocked) {
                marker.addEventListener('click', () => this.selectCityFromMap(city));
                marker.addEventListener('mouseenter', () => this.showCityPreview(city));
            }
            
            markersGroup.appendChild(marker);
        });
        
        // Initialize grid view
        this.renderCityGrid();
    }
    
    renderCityGrid() {
        const grid = document.getElementById('cities-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        this.cities.forEach(city => {
            const card = document.createElement('div');
            card.className = 'city-card';
            if (!city.unlocked) card.classList.add('locked');
            if (city.highscore >= city.target) card.classList.add('completed');
            card.dataset.cityId = city.id;
            
            const stars = Array(3).fill('').map((_, i) => 
                `<span class="star ${i < city.stars ? '' : 'empty'}">★</span>`
            ).join('');
            
            const difficultyDots = Array(5).fill('').map((_, i) => 
                i < city.difficulty ? '●' : '○'
            ).join('');
            
            card.innerHTML = `
                <div class="city-card-name">${city.name}</div>
                <div class="city-card-preview">
                    <div class="city-river ${city.river || ''}"></div>
                </div>
                <div class="city-card-stats">
                    <span class="city-card-target">🎯 ${city.target}</span>
                    <span class="city-card-highscore">🏆 ${city.highscore || '-'}</span>
                </div>
                <div class="city-card-stars">${stars}</div>
                <div class="city-difficulty" style="position: absolute; top: 10px; right: 10px; font-size: 12px; color: var(--text-tertiary);">${difficultyDots}</div>
            `;
            
            if (city.unlocked) {
                card.addEventListener('click', () => this.selectCityFromGrid(city));
            }
            
            grid.appendChild(card);
        });
    }
    
    selectCityFromMap(city) {
        this.selectedCity = city;
        this.updateCityDetailPanel(city);
        this.playClickSound();
    }
    
    selectCityFromGrid(city) {
        this.selectedCity = city;
        this.showModeSelection();
        this.playClickSound();
    }
    
    showCityPreview(city) {
        const canvas = document.getElementById('city-preview-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw simplified city preview
        ctx.strokeStyle = '#D4E6F1';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        
        if (city.river === 'thames') {
            // S-curve for Thames
            ctx.beginPath();
            ctx.moveTo(0, 75);
            ctx.bezierCurveTo(100, 50, 200, 100, 300, 75);
            ctx.stroke();
        } else if (city.river === 'seine') {
            // Gentle curve for Seine
            ctx.beginPath();
            ctx.moveTo(0, 75);
            ctx.quadraticCurveTo(150, 50, 300, 75);
            ctx.stroke();
        } else if (city.river === 'hudson') {
            // Straight lines for Hudson/East rivers
            ctx.beginPath();
            ctx.moveTo(100, 0);
            ctx.lineTo(100, 150);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(200, 0);
            ctx.lineTo(200, 150);
            ctx.stroke();
        } else {
            // Default river
            ctx.beginPath();
            ctx.moveTo(0, 75);
            ctx.lineTo(300, 75);
            ctx.stroke();
        }
    }
    
    updateCityDetailPanel(city) {
        document.querySelector('.city-detail-panel .city-name').textContent = city.name;
        
        // Update difficulty
        const difficultyDots = Array(5).fill('').map((_, i) => 
            i < city.difficulty ? '●' : '○'
        ).join('');
        document.querySelector('.city-difficulty').textContent = difficultyDots;
        
        // Update stats
        document.querySelector('.stat-item:nth-child(1) .stat-value').textContent = city.target;
        document.querySelector('.stat-item:nth-child(2) .stat-value').textContent = city.highscore || '-';
        document.querySelector('.stat-item:nth-child(3) .stat-value').textContent = city.highscore ? `#${Math.floor(Math.random() * 1000) + 100}` : '-';
        
        // Update leaderboard
        const leaderboardList = document.querySelector('.leaderboard-list');
        leaderboardList.innerHTML = '';
        
        const mockLeaderboard = [
            { rank: 1, name: 'MetroMaster', score: 2847 },
            { rank: 2, name: 'RailKing', score: 2341 },
            { rank: 3, name: 'TrainPro', score: 1923 }
        ];
        
        mockLeaderboard.forEach(entry => {
            const entryEl = document.createElement('div');
            entryEl.className = 'leaderboard-entry';
            
            const rankClass = entry.rank === 1 ? 'gold' : entry.rank === 2 ? 'silver' : entry.rank === 3 ? 'bronze' : '';
            
            entryEl.innerHTML = `
                <span class="leaderboard-rank ${rankClass}">#${entry.rank}</span>
                <span class="leaderboard-name">${entry.name}</span>
                <span class="leaderboard-score">${entry.score}</span>
            `;
            
            leaderboardList.appendChild(entryEl);
        });
        
        // Update play button
        const playBtn = document.querySelector('.play-city-btn');
        if (city.unlocked) {
            playBtn.disabled = false;
            playBtn.textContent = `PLAY ${city.name}`;
            playBtn.onclick = () => this.showModeSelection();
        } else {
            playBtn.disabled = true;
            playBtn.textContent = 'CITY LOCKED';
        }
        
        // Draw city preview
        this.showCityPreview(city);
    }
    
    showModeSelection() {
        if (!this.selectedCity) return;
        
        document.getElementById('selected-city-title').textContent = this.selectedCity.name;
        document.getElementById('selected-city-desc').textContent = this.getCityDescription(this.selectedCity);
        
        // Update mode availability
        const extremeUnlocked = this.selectedCity.highscore >= 1500;
        const creativeUnlocked = this.cities.filter(c => c.stars >= 3).length >= 10;
        
        document.querySelector('.mode-card[data-mode="extreme"]').classList.toggle('locked', !extremeUnlocked);
        document.querySelector('.mode-card[data-mode="creative"]').classList.toggle('locked', !creativeUnlocked);
        
        document.querySelector('.mode-card[data-mode="extreme"] .select-mode-btn').disabled = !extremeUnlocked;
        document.querySelector('.mode-card[data-mode="creative"] .select-mode-btn').disabled = !creativeUnlocked;
        
        this.showScreen('mode-select');
    }
    
    getCityDescription(city) {
        const descriptions = {
            london: 'Cross the Thames and connect historic London',
            paris: 'Navigate the Seine and its romantic islands',
            newyork: 'Bridge the rivers to unite the five boroughs',
            berlin: 'Limited bridges challenge your planning',
            tokyo: 'Master the world\'s busiest metro system',
            hongkong: 'Connect islands in the Pearl River Delta'
        };
        
        return descriptions[city.id] || 'Build an efficient metro network';
    }
    
    filterCities(filter) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        const cards = document.querySelectorAll('.city-card');
        cards.forEach(card => {
            const cityId = card.dataset.cityId;
            const city = this.cities.find(c => c.id === cityId);
            
            let show = true;
            if (filter === 'unlocked') show = city.unlocked;
            else if (filter === 'locked') show = !city.unlocked;
            else if (filter === 'completed') show = city.highscore >= city.target;
            
            card.style.display = show ? '' : 'none';
        });
    }
    
    startBackgroundAnimations() {
        // Animate background metro lines
        const paths = document.querySelectorAll('.bg-line');
        paths.forEach((path, index) => {
            const length = path.getTotalLength();
            path.style.strokeDasharray = `${length} ${length}`;
            path.style.strokeDashoffset = length;
        });
    }
    
    setupSoundEffects() {
        this.clickSound = document.getElementById('click-sound');
    }
    
    playClickSound() {
        if (this.soundEnabled && this.clickSound) {
            this.clickSound.currentTime = 0;
            this.clickSound.play().catch(() => {});
        }
    }
    
    playHoverSound() {
        // Could add hover sound here
    }
    
    handleEscape() {
        if (this.currentScreen === 'mode-select') {
            this.showScreen('city-select');
        } else if (this.currentScreen !== 'main-menu') {
            this.showScreen('main-menu');
        }
    }
    
    handleResize() {
        // Update canvas if needed
        if (this.currentScreen === 'game') {
            this.resizeGameCanvas();
        }
    }
    
    resizeGameCanvas() {
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenId;
        }
        
        this.playClickSound();
    }
    
    loadProgress() {
        const saved = localStorage.getItem('miniMetroProgress');
        if (saved) {
            try {
                const progress = JSON.parse(saved);
                
                // Update cities
                this.cities.forEach(city => {
                    if (progress.cities && progress.cities[city.id]) {
                        Object.assign(city, progress.cities[city.id]);
                    }
                });
                
                // Update achievements
                if (progress.achievements) {
                    this.achievements.forEach(achievement => {
                        if (progress.achievements[achievement.id]) {
                            Object.assign(achievement, progress.achievements[achievement.id]);
                        }
                    });
                }
                
                // Check unlock conditions
                this.checkUnlockConditions();
            } catch (e) {
                console.error('Failed to load progress:', e);
            }
        }
        
        this.updateProgressDisplay();
    }
    
    saveProgress() {
        const progress = {
            cities: {},
            achievements: {}
        };
        
        this.cities.forEach(city => {
            progress.cities[city.id] = {
                unlocked: city.unlocked,
                highscore: city.highscore,
                stars: city.stars
            };
        });
        
        this.achievements.forEach(achievement => {
            progress.achievements[achievement.id] = {
                progress: achievement.progress,
                unlocked: achievement.unlocked
            };
        });
        
        localStorage.setItem('miniMetroProgress', JSON.stringify(progress));
    }
    
    checkUnlockConditions() {
        this.cities.forEach(city => {
            if (!city.unlocked && city.requires) {
                const requiredCity = this.cities.find(c => c.id === city.requires);
                if (requiredCity && requiredCity.highscore >= requiredCity.target) {
                    city.unlocked = true;
                    this.showUnlockAnimation(city);
                }
            }
        });
    }
    
    showUnlockAnimation(city) {
        // Create unlock notification
        const notification = document.createElement('div');
        notification.className = 'unlock-notification';
        notification.innerHTML = `
            <div class="unlock-icon">🔓</div>
            <div class="unlock-text">
                <div class="unlock-title">CITY UNLOCKED!</div>
                <div class="unlock-city">${city.name}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }
    
    updateProgressDisplay() {
        const unlocked = this.cities.filter(c => c.unlocked).length;
        const total = this.cities.length;
        
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${(unlocked / total) * 100}%`;
        }
        
        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = `${unlocked} of ${total} Cities Unlocked`;
        }
    }
}

// Global functions for onclick handlers
function showMainMenu() {
    window.gameUI.showScreen('main-menu');
}

function showCitySelect() {
    window.gameUI.showScreen('city-select');
}

function showDailyChallenge() {
    alert('Daily Challenge: Complete London with 1000 passengers using only 2 lines!');
}

function showAchievements() {
    window.gameUI.showScreen('achievements');
    window.gameUI.renderAchievements();
}

function showLeaderboard() {
    alert('Global Leaderboard coming soon!');
}

function showSettings() {
    alert('Settings menu coming soon!');
}

function setView(view) {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    document.querySelectorAll('.city-view').forEach(v => {
        v.classList.remove('active');
    });
    
    if (view === 'map') {
        document.getElementById('world-map-view').classList.add('active');
    } else {
        document.getElementById('grid-view').classList.add('active');
    }
    
    window.gameUI.currentView = view;
}

function startGame(mode) {
    if (!window.gameUI.selectedCity) {
        alert('Please select a city first!');
        return;
    }
    
    // Hide menu screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    // Show game canvas
    const canvas = document.getElementById('gameCanvas');
    canvas.style.display = 'block';
    document.getElementById('game-ui').style.display = 'block';
    
    // Initialize game
    if (typeof MiniMetro !== 'undefined') {
        if (!window.game) {
            window.game = new MiniMetro();
        }
        window.game.initializeCity(window.gameUI.selectedCity.id, mode);
    } else {
        console.log(`Starting: ${window.gameUI.selectedCity.name} - ${mode} mode`);
    }
}

function exitToMenu() {
    // Save progress if game is running
    if (window.game) {
        // Update highscore
        const city = window.gameUI.cities.find(c => c.id === window.gameUI.selectedCity.id);
        if (city && window.game.score > city.highscore) {
            city.highscore = window.game.score;
            
            // Calculate stars
            if (city.highscore >= city.target * 2) city.stars = 3;
            else if (city.highscore >= city.target * 1.5) city.stars = 2;
            else if (city.highscore >= city.target) city.stars = 1;
            
            window.gameUI.saveProgress();
        }
    }
    
    // Return to menu
    document.getElementById('gameCanvas').style.display = 'none';
    document.getElementById('game-ui').style.display = 'none';
    window.gameUI.showScreen('main-menu');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gameUI = new MiniMetroUI();
    
    // Add unlock notification styles
    const style = document.createElement('style');
    style.textContent = `
        .unlock-notification {
            position: fixed;
            top: 20px;
            right: -400px;
            background: linear-gradient(135deg, #667EEA, #764BA2);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            transition: right 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            z-index: 10000;
        }
        
        .unlock-notification.show {
            right: 20px;
        }
        
        .unlock-icon {
            font-size: 32px;
        }
        
        .unlock-title {
            font-size: 12px;
            letter-spacing: 2px;
            margin-bottom: 4px;
            opacity: 0.9;
        }
        
        .unlock-city {
            font-size: 20px;
            font-weight: 600;
            letter-spacing: 1px;
        }
    `;
    document.head.appendChild(style);
});