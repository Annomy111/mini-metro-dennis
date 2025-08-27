/**
 * Manages the game's UI, state, and player progress outside of active gameplay.
 */
class MenuSystem {
    constructor() {
        /** @type {string} */
        this.currentScreen = 'main'; // main, city-select, game, stats, achievements
        /** @type {string|null} */
        this.selectedCity = null;
        /** @type {string} */
        this.selectedMode = 'normal';
        
        /**
         * Data for all cities available in the menu.
         * @type {object}
         */
        this.cities = {
            london: {
                name: 'London',
                unlocked: true,
                color: '#DD2515',
                position: { x: 0.48, y: 0.35 },
                features: ['Thames River'],
                highscores: { normal: 0, endless: 0, extreme: 0, creative: 0 }
            },
            paris: {
                name: 'Paris',
                unlocked: true,
                color: '#2581C4',
                position: { x: 0.49, y: 0.38 },
                features: ['Seine River'],
                highscores: { normal: 0, endless: 0, extreme: 0, creative: 0 }
            },
            newyork: {
                name: 'New York',
                unlocked: true,
                color: '#F0AB00',
                position: { x: 0.25, y: 0.42 },
                features: ['Rivers', 'Islands'],
                highscores: { normal: 0, endless: 0, extreme: 0, creative: 0 }
            },
            berlin: {
                name: 'Berlin',
                unlocked: false,
                color: '#35AB52',
                position: { x: 0.52, y: 0.34 },
                features: ['Spree River'],
                requiredAchievement: 'london_500',
                highscores: { normal: 0, endless: 0, extreme: 0, creative: 0 }
            },
            osaka: {
                name: 'Osaka',
                unlocked: false,
                color: '#FF6B9D',
                position: { x: 0.85, y: 0.45 },
                features: ['Bay Area'],
                requiredAchievement: 'paris_500',
                highscores: { normal: 0, endless: 0, extreme: 0, creative: 0 }
            },
            hongkong: {
                name: 'Hong Kong',
                unlocked: false,
                color: '#00BFFF',
                position: { x: 0.78, y: 0.52 },
                features: ['Islands', 'Harbor'],
                requiredAchievement: 'newyork_500',
                highscores: { normal: 0, endless: 0, extreme: 0, creative: 0 }
            },
            moscow: {
                name: 'Moscow',
                unlocked: false,
                color: '#C70039',
                position: { x: 0.58, y: 0.28 },
                features: ['Moscow River'],
                requiredAchievement: 'berlin_500',
                highscores: { normal: 0, endless: 0, extreme: 0, creative: 0 }
            },
            cairo: {
                name: 'Cairo',
                unlocked: false,
                color: '#FFC300',
                position: { x: 0.55, y: 0.55 },
                features: ['Nile River'],
                requiredAchievement: 'complete_5_cities',
                highscores: { normal: 0, endless: 0, extreme: 0, creative: 0 }
            }
        };
        
        /**
         * Data for all available game modes.
         * @type {object}
         */
        this.gameModes = {
            normal: {
                name: 'Normal',
                description: 'Klassisches Spiel mit wöchentlichen Upgrades',
                icon: '▶',
                unlocked: true
            },
            endless: {
                name: 'Endless',
                description: 'Kein Game Over - Effizienz-basierte Upgrades',
                icon: '∞',
                unlocked: true
            },
            extreme: {
                name: 'Extreme',
                description: 'Keine Änderungen nach Platzierung möglich',
                icon: '⚡',
                unlocked: false,
                requiresAchievement: 'normal_1000'
            },
            creative: {
                name: 'Creative',
                description: 'Sandbox mit unbegrenzten Ressourcen',
                icon: '✏',
                unlocked: false,
                requiresAchievement: 'complete_all_normal'
            }
        };
        
        /**
         * Data for all achievements in the game.
         * @type {object}
         */
        this.achievements = {
            london_500: {
                name: 'London Commuter',
                description: 'Transport 500 passengers in London',
                icon: '🚇',
                progress: 0,
                target: 500,
                unlocked: false
            },
            paris_500: {
                name: 'Parisian',
                description: 'Transport 500 passengers in Paris',
                icon: '🗼',
                progress: 0,
                target: 500,
                unlocked: false
            },
            newyork_500: {
                name: 'New Yorker',
                description: 'Transport 500 passengers in New York',
                icon: '🗽',
                progress: 0,
                target: 500,
                unlocked: false
            },
            complete_5_cities: {
                name: 'World Traveler',
                description: 'Complete 5 different cities',
                icon: '🌍',
                progress: 0,
                target: 5,
                unlocked: false
            },
            daily_streak: {
                name: 'Daily Commuter',
                description: 'Play daily challenge 7 days in a row',
                icon: '📅',
                progress: 0,
                target: 7,
                unlocked: false
            },
            normal_1000: {
                name: 'Expert Planner',
                description: 'Transport 1000 passengers in Normal mode',
                icon: '🎯',
                progress: 0,
                target: 1000,
                unlocked: false
            }
        };
        
        /**
         * Data for the daily challenge.
         * @type {object}
         */
        this.dailyChallenge = {
            city: 'london',
            seed: this.getDailySeed(),
            played: false,
            score: 0,
            leaderboard: []
        };
        
        // Load saved data
        this.loadGameData();
    }
    
    /**
     * Generates a seed for the daily challenge based on the current date.
     * @returns {string} The daily seed string.
     */
    getDailySeed() {
        const today = new Date();
        return `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    }
    
    /**
     * Loads game data from localStorage.
     */
    loadGameData() {
        const savedData = localStorage.getItem('miniMetroSave');
        if (savedData) {
            const data = JSON.parse(savedData);
            
            // Merge saved data
            if (data.cities) {
                Object.keys(data.cities).forEach(cityKey => {
                    if (this.cities[cityKey]) {
                        Object.assign(this.cities[cityKey], data.cities[cityKey]);
                    }
                });
            }
            
            if (data.achievements) {
                Object.keys(data.achievements).forEach(achKey => {
                    if (this.achievements[achKey]) {
                        Object.assign(this.achievements[achKey], data.achievements[achKey]);
                    }
                });
            }
            
            if (data.dailyChallenge && data.dailyChallenge.seed === this.getDailySeed()) {
                this.dailyChallenge = data.dailyChallenge;
            }
        }
        
        this.checkUnlocks();
    }
    
    /**
     * Saves the current game data to localStorage.
     */
    saveGameData() {
        const saveData = {
            cities: this.cities,
            achievements: this.achievements,
            dailyChallenge: this.dailyChallenge,
            lastSaved: new Date().toISOString()
        };
        
        localStorage.setItem('miniMetroSave', JSON.stringify(saveData));
    }
    
    /**
     * Checks for and applies any new unlocks based on achievements.
     */
    checkUnlocks() {
        // Check city unlocks based on achievements
        Object.keys(this.cities).forEach(cityKey => {
            const city = this.cities[cityKey];
            if (city.requiredAchievement && this.achievements[city.requiredAchievement]) {
                city.unlocked = this.achievements[city.requiredAchievement].unlocked;
            }
        });
        
        // Check mode unlocks
        Object.keys(this.gameModes).forEach(modeKey => {
            const mode = this.gameModes[modeKey];
            if (mode.requiresAchievement && this.achievements[mode.requiresAchievement]) {
                mode.unlocked = this.achievements[mode.requiresAchievement].unlocked;
            }
        });
    }
    
    /**
     * Updates the progress of an achievement.
     * @param {string} achievementId - The ID of the achievement to update.
     * @param {number} progress - The new progress value.
     */
    updateAchievement(achievementId, progress) {
        const achievement = this.achievements[achievementId];
        if (!achievement || achievement.unlocked) return;
        
        achievement.progress = Math.min(progress, achievement.target);
        
        if (achievement.progress >= achievement.target) {
            achievement.unlocked = true;
            this.showAchievementNotification(achievement);
            this.checkUnlocks();
        }
        
        this.saveGameData();
    }
    
    /**
     * Displays a notification for an unlocked achievement.
     * @param {object} achievement - The achievement that was unlocked.
     */
    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-text">
                <div class="achievement-title">Achievement Unlocked!</div>
                <div class="achievement-name">${achievement.name}</div>
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
            }, 300);
        }, 3000);
    }
    
    /**
     * Updates the high score for a given city and mode.
     * @param {string} city - The city key.
     * @param {string} mode - The game mode.
     * @param {number} score - The new score.
     * @returns {boolean} True if a new high score was set, false otherwise.
     */
    updateHighscore(city, mode, score) {
        if (this.cities[city] && this.cities[city].highscores[mode] < score) {
            this.cities[city].highscores[mode] = score;
            this.saveGameData();
            return true; // New highscore
        }
        return false;
    }
    
    /**
     * Starts the game for a selected city and mode.
     * @param {string} city - The city key.
     * @param {string} mode - The game mode.
     */
    startGame(city, mode) {
        this.selectedCity = city;
        this.selectedMode = mode;
        this.currentScreen = 'game';
        
        // Initialize game with selected city and mode
        if (window.game) {
            window.game.initializeCity(city, mode);
        }
    }
    
    /**
     * Shows the main menu screen.
     */
    showMainMenu() {
        this.currentScreen = 'main';
    }
    
    /**
     * Shows the city selection screen.
     */
    showCitySelect() {
        this.currentScreen = 'city-select';
    }
    
    /**
     * Shows the achievements screen.
     */
    showAchievements() {
        this.currentScreen = 'achievements';
    }
    
    /**
     * Shows the statistics screen.
     */
    showStatistics() {
        this.currentScreen = 'statistics';
    }
    
    /**
     * Starts the daily challenge or shows the leaderboard if already played.
     */
    showDailyChallenge() {
        if (!this.dailyChallenge.played) {
            this.startGame('london', 'daily');
            this.dailyChallenge.played = true;
            this.saveGameData();
        } else {
            // Show daily challenge leaderboard
            this.currentScreen = 'daily-leaderboard';
        }
    }
}

/**
 * Manages all audio for the game, including procedural sound effects and music.
 */
class AudioSystem {
    constructor() {
        /** @type {AudioContext} */
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        /** @type {number} */
        this.masterVolume = 0.5;
        /** @type {number} */
        this.musicVolume = 0.7;
        /** @type {number} */
        this.sfxVolume = 0.8;
        
        /**
         * Musical scales for procedural audio generation.
         * @type {object}
         */
        this.scales = {
            major: [0, 2, 4, 5, 7, 9, 11],
            minor: [0, 2, 3, 5, 7, 8, 10],
            pentatonic: [0, 2, 4, 7, 9]
        };
        
        /** @type {string} */
        this.currentScale = 'pentatonic';
        /** @type {number} */
        this.baseFrequency = 220; // A3
        
        /** @type {Map<number, object[]>} */
        this.lineSequences = new Map();
        /** @type {boolean} */
        this.isPlaying = false;
    }
    
    /**
     * Initializes the audio system, resuming the AudioContext on user interaction.
     */
    init() {
        // Initialize audio on first user interaction
        document.addEventListener('click', () => {
            if (this.context.state === 'suspended') {
                this.context.resume();
            }
        }, { once: true });
    }
    
    /**
     * Plays a single audio note.
     * @param {number} frequency - The frequency of the note in Hz.
     * @param {number} [duration=0.1] - The duration of the note in seconds.
     * @param {number} [volume=0.5] - The volume of the note.
     */
    playNote(frequency, duration = 0.1, volume = 0.5) {
        if (!this.isPlaying) return;
        
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
        
        // Envelope
        gainNode.gain.setValueAtTime(0, this.context.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * this.sfxVolume * this.masterVolume, this.context.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
        
        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);
    }
    
    /**
     * Gets the frequency for a station based on its index.
     * @param {number} stationIndex - The index of the station.
     * @returns {number} The frequency of the note for the station.
     */
    getFrequencyForStation(stationIndex) {
        const scale = this.scales[this.currentScale];
        const note = scale[stationIndex % scale.length];
        const octave = Math.floor(stationIndex / scale.length);
        return this.baseFrequency * Math.pow(2, (note + octave * 12) / 12);
    }
    
    /**
     * Plays a sound effect for a specific station type.
     * @param {string} stationType - The type of the station.
     */
    playStationSound(stationType) {
        const frequencies = {
            circle: 440,
            triangle: 523,
            square: 349,
            diamond: 587,
            cross: 392,
            star: 659,
            pentagon: 466,
            fan: 554
        };
        
        this.playNote(frequencies[stationType] || 440, 0.15, 0.3);
    }
    
    /**
     * Plays a sound effect for a passenger action.
     * @param {string} action - The action ('board' or 'alight').
     */
    playPassengerSound(action) {
        if (action === 'board') {
            this.playNote(880, 0.05, 0.2);
        } else if (action === 'alight') {
            this.playNote(1760, 0.05, 0.2);
        }
    }
    
    /**
     * Plays a sound effect for drawing a line.
     */
    playLineDrawSound() {
        this.playNote(330, 0.1, 0.2);
    }
    
    /**
     * Plays a sound effect for an upgrade.
     */
    playUpgradeSound() {
        const notes = [440, 554, 659];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playNote(freq, 0.2, 0.4), i * 100);
        });
    }
    
    /**
     * Starts the game's procedural music.
     */
    startGameMusic() {
        this.isPlaying = true;
        // Procedural music based on game state would go here
    }
    
    /**
     * Stops the game's music.
     */
    stopGameMusic() {
        this.isPlaying = false;
        this.lineSequences.clear();
    }
    
    /**
     * Updates the musical sequence for a line.
     * @param {number} lineId - The ID of the line.
     * @param {object[]} stations - The array of stations on the line.
     */
    updateLineSequence(lineId, stations) {
        // Update the musical sequence for a line based on its stations
        this.lineSequences.set(lineId, stations);
    }
}

// Initialize menu system
const menuSystem = new MenuSystem();
const audioSystem = new AudioSystem();
audioSystem.init();

// Export for use in game.js
window.menuSystem = menuSystem;
window.audioSystem = audioSystem;