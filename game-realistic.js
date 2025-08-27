/**
 * Represents the main game engine for the Mini Metro game.
 * This class manages the game state, rendering, user input, and all gameplay logic.
 */
class MiniMetro {
    /**
     * Initializes the game engine.
     */
    constructor() {
        /** @type {HTMLCanvasElement} */
        this.canvas = document.getElementById('gameCanvas');
        /** @type {CanvasRenderingContext2D} */
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        
        // Design tokens - smaller on mobile
        const isMobile = window.innerWidth < 768;
        /**
         * Design tokens for styling the game elements.
         * @type {object}
         */
        this.designTokens = {
            u: 4,
            wl: isMobile ? 6 : 8,
            ws: isMobile ? 3 : 4,
            Ro: isMobile ? 16 : 24,  // Station outer radius - much smaller on mobile
            Ri: isMobile ? 13 : 20,  // Station inner radius
            sp: isMobile ? 8 : 10,
            bridgeWidth: 30,
            bridgeHeight: 20
        };
        
        // Game state
        /** @type {string} */
        this.currentCity = 'london';
        /** @type {string} */
        this.currentMode = 'normal';
        /** @type {object|null} */
        this.cityConfig = null;
        
        /** @type {boolean} */
        this.nightMode = false;
        /** @type {boolean} */
        this.paused = false;
        /** @type {boolean} */
        this.gameOver = false;
        /** @type {number} */
        this.gameSpeed = 1;
        
        /** @type {Array<object>} */
        this.stations = [];
        /** @type {Array<object>} */
        this.lines = [];
        /** @type {Array<object>} */
        this.trains = [];
        /** @type {Array<object>} */
        this.passengers = [];
        /** @type {Array<object>} */
        this.bridges = [];
        
        /** @type {number} */
        this.score = 0;
        /** @type {number} */
        this.week = 1;
        /** @type {number} */
        this.day = 1;
        /** @type {number} */
        this.dayProgress = 0;
        /** @type {number} */
        this.dayDuration = 20000;
        /** @type {number} */
        this.timeOfDay = 6;
        
        // Resources
        /** @type {number} */
        this.availableLines = 3;
        /** @type {number} */
        this.availableTrains = 3;
        /** @type {number} */
        this.availableCarriages = 0;
        /** @type {number} */
        this.availableBridges = 3;
        /** @type {number} */
        this.availableInterchanges = 0;
        
        // Interaction
        /** @type {object|null} */
        this.hoveredStation = null;
        /** @type {object|null} */
        this.drawingLine = null;
        /** @type {object|null} */
        this.selectedStation = null;
        /** @type {number|null} */
        this.tempMouseX = null;
        /** @type {number|null} */
        this.tempMouseY = null;
        
        // Station shapes
        /** @type {Array<string>} */
        this.stationShapes = ['circle', 'triangle', 'square'];
        /** @type {Array<string>} */
        this.rareShapes = ['diamond', 'cross', 'star', 'pentagon', 'fan'];
        
        /** @type {number} */
        this.lastFrameTime = 0;
        this.init();
    }
    
    /**
     * Sets up the canvas to fill the screen and handles resizing.
     */
    setupCanvas() {
        // Set canvas to match window size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Store dimensions for calculations
        this.displayWidth = window.innerWidth;
        this.displayHeight = window.innerHeight;
        
        // Apply CSS for crisp rendering on mobile
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        this.canvas.style.touchAction = 'none';
        this.canvas.style.userSelect = 'none';
        this.canvas.style.webkitUserSelect = 'none';
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.displayWidth = window.innerWidth;
            this.displayHeight = window.innerHeight;
            this.canvas.style.width = window.innerWidth + 'px';
            this.canvas.style.height = window.innerHeight + 'px';
        });
    }
    
    /**
     * Initializes the game by loading configurations, generating stations, and starting the game loop.
     */
    init() {
        this.loadCityConfig();
        this.generateInitialStations();
        this.createInitialLines();
        this.setupEventListeners();
        this.updateUI();
        this.gameLoop(0);
    }
    
    /**
     * Loads the configuration for the current city from the CityMaps object.
     */
    loadCityConfig() {
        if (typeof CityMaps !== 'undefined' && CityMaps[this.currentCity]) {
            this.cityConfig = CityMaps[this.currentCity];
            this.availableBridges = this.cityConfig.initialBridges || 3;
            
            // Update UI with city name
            this.updateCityDisplay();
        } else {
            // Fallback configuration
            this.cityConfig = {
                name: 'CUSTOM',
                rivers: [],
                spawnZones: [{x: 0.1, y: 0.1, w: 0.8, h: 0.8}],
                initialBridges: 3
            };
        }
    }
    
    /**
     * Updates the city name display in the UI.
     */
    updateCityDisplay() {
        // Add city name to canvas or UI
        const cityNameEl = document.getElementById('city-name');
        if (cityNameEl) {
            cityNameEl.textContent = this.cityConfig.name;
        }
    }
    
    /**
     * Generates the initial set of stations for the current city.
     */
    generateInitialStations() {
        // Adjust for mobile screens
        const isMobile = window.innerWidth < 768;
        const minDistance = isMobile ? 200 : 120; // Much more space on mobile
        const stationCount = isMobile ? 3 : 6; // Only 3 stations to start on mobile
        this.stations = [];
        
        // Use more screen space on mobile, avoiding UI areas
        const spawnZones = this.cityConfig.spawnZones || 
            (isMobile ? [{x: 0.1, y: 0.18, w: 0.8, h: 0.6}] : [{x: 0.1, y: 0.1, w: 0.8, h: 0.8}]);
        
        for (let i = 0; i < stationCount; i++) {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 100) {
                // Pick random spawn zone with weighting
                const zone = spawnZones[Math.floor(Math.random() * spawnZones.length)];
                // Add padding on mobile to avoid UI elements
                let x = (zone.x + Math.random() * zone.w) * this.canvas.width;
                let y = (zone.y + Math.random() * zone.h) * this.canvas.height;
                
                // On mobile, ensure stations aren't too close to edges
                if (isMobile) {
                    const edgePadding = 40;
                    x = Math.max(edgePadding, Math.min(x, this.canvas.width - edgePadding));
                    y = Math.max(edgePadding + 60, Math.min(y, this.canvas.height - edgePadding - 60));
                }
                
                if (!this.isInWater(x, y) && this.isValidStationPosition(x, y, minDistance)) {
                    const shapes = i < 3 ? this.stationShapes : [...this.stationShapes, ...this.rareShapes];
                    const shape = shapes[Math.floor(Math.random() * shapes.length)];
                    
                    this.stations.push({
                        id: i,
                        x: x,
                        y: y,
                        shape: shape,
                        passengers: [],
                        capacity: 6,
                        isInterchange: false,
                        overcrowding: 0,
                        maxOvercrowding: 8000,
                        zone: zone.name || 'Zone ' + i
                    });
                    placed = true;
                }
                attempts++;
            }
        }
    }
    
    /**
     * Checks if a given coordinate is in a water body.
     * @param {number} x - The x-coordinate.
     * @param {number} y - The y-coordinate.
     * @returns {boolean} True if the coordinate is in water, false otherwise.
     */
    isInWater(x, y) {
        if (!this.cityConfig || !this.cityConfig.rivers) return false;
        
        const relX = x / this.canvas.width;
        const relY = y / this.canvas.height;
        
        // Check rivers
        for (let river of this.cityConfig.rivers) {
            for (let i = 0; i < river.points.length - 1; i++) {
                const p1 = river.points[i];
                const p2 = river.points[i + 1];
                const dist = this.distanceToLineSegment(relX, relY, p1.x, p1.y, p2.x, p2.y);
                
                if (dist * this.canvas.width < river.width / 2) {
                    return true;
                }
            }
        }
        
        // Check bay/ocean areas
        if (this.cityConfig.water) {
            const water = this.cityConfig.water;
            if (water.type === 'bay') {
                if (relX >= water.x && relX <= water.x + water.width &&
                    relY >= water.y && relY <= water.y + water.height) {
                    return true;
                }
            }
        }
        
        // Check islands (they are land, not water)
        if (this.cityConfig.islands) {
            for (let island of this.cityConfig.islands) {
                if (island.isLand) {
                    const islandRelX = island.x;
                    const islandRelY = island.y;
                    const islandRelW = typeof island.width === 'number' && island.width < 1 
                        ? island.width 
                        : island.width / this.canvas.width;
                    const islandRelH = typeof island.height === 'number' && island.height < 1 
                        ? island.height 
                        : island.height / this.canvas.height;
                    
                    if (relX >= islandRelX - islandRelW/2 && relX <= islandRelX + islandRelW/2 &&
                        relY >= islandRelY - islandRelH/2 && relY <= islandRelY + islandRelH/2) {
                        return false; // Islands are land
                    }
                }
            }
        }
        
        return false;
    }
    
    /**
     * Calculates the shortest distance from a point to a line segment.
     * @param {number} px - The x-coordinate of the point.
     * @param {number} py - The y-coordinate of the point.
     * @param {number} x1 - The x-coordinate of the start of the line segment.
     * @param {number} y1 - The y-coordinate of the start of the line segment.
     * @param {number} x2 - The x-coordinate of the end of the line segment.
     * @param {number} y2 - The y-coordinate of the end of the line segment.
     * @returns {number} The distance from the point to the line segment.
     */
    distanceToLineSegment(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        
        if (lenSq !== 0) param = dot / lenSq;
        
        let xx, yy;
        
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Checks if a new station position is valid (i.e., not too close to other stations).
     * @param {number} x - The x-coordinate of the new station.
     * @param {number} y - The y-coordinate of the new station.
     * @param {number} minDistance - The minimum allowed distance to other stations.
     * @returns {boolean} True if the position is valid, false otherwise.
     */
    isValidStationPosition(x, y, minDistance) {
        for (let station of this.stations) {
            const dist = Math.hypot(station.x - x, station.y - y);
            if (dist < minDistance) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Creates the initial set of empty lines available to the player.
     */
    createInitialLines() {
        this.lines = [];
        const lineColors = ['#DD2515', '#2581C4', '#35AB52', '#F0AB00', '#00BFFF', '#FFDD55'];
        
        for (let i = 0; i < this.availableLines; i++) {
            this.lines.push({
                id: i,
                color: lineColors[i],
                stations: [],
                segments: [],
                trains: [],
                bridges: []
            });
        }
    }
    
    /**
     * Sets up event listeners for mouse and touch input.
     */
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
        
        // Track touch state
        this.touches = {};
        this.longPressTimer = null;
        this.touchStartTime = 0;
        this.lastTouchEnd = 0;
    }
    
    /**
     * Handles the mouse down event.
     * @param {MouseEvent} e - The mouse event.
     */
    onMouseDown(e) {
        if (this.paused || this.gameOver) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const station = this.getStationAt(x, y);
        
        if (e.button === 0 && station) {
            // Check if station is already on a line
            const existingLine = this.lines.find(l => 
                l.stations.length > 0 && 
                l.stations[l.stations.length - 1] === station
            );
            
            if (existingLine) {
                // Extend existing line from this station
                this.drawingLine = existingLine;
                this.selectedStation = station;
            } else {
                // Start new line
                const emptyLine = this.lines.find(l => l.stations.length === 0);
                if (emptyLine) {
                    this.drawingLine = emptyLine;
                    this.selectedStation = station;
                    emptyLine.stations = [station];
                }
            }
        } else if (e.button === 2) {
            // Right click to delete line
            this.handleRightClick(x, y);
        }
    }
    
    /**
     * Handles a right-click event to delete a line segment.
     * @param {number} x - The x-coordinate of the click.
     * @param {number} y - The y-coordinate of the click.
     */
    handleRightClick(x, y) {
        // Find line segment near click
        for (let line of this.lines) {
            if (line.stations.length < 2) continue;
            
            for (let i = 0; i < line.stations.length - 1; i++) {
                const s1 = line.stations[i];
                const s2 = line.stations[i + 1];
                
                // Check distance to line segment
                const dist = this.distanceToLineSegment(
                    x / this.canvas.width, 
                    y / this.canvas.height,
                    s1.x / this.canvas.width,
                    s1.y / this.canvas.height,
                    s2.x / this.canvas.width,
                    s2.y / this.canvas.height
                ) * this.canvas.width;
                
                if (dist < 10) {
                    // Clear this line
                    line.stations = [];
                    line.segments = [];
                    
                    // Remove trains from this line
                    this.trains = this.trains.filter(t => t.line !== line);
                    line.trains = [];
                    
                    return;
                }
            }
        }
    }
    
    /**
     * Handles the mouse move event.
     * @param {MouseEvent} e - The mouse event.
     */
    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.hoveredStation = this.getStationAt(x, y);
        
        if (this.drawingLine) {
            this.tempMouseX = x;
            this.tempMouseY = y;
        }
    }
    
    /**
     * Handles the touch start event.
     * @param {TouchEvent} e - The touch event.
     */
    onTouchStart(e) {
        e.preventDefault();
        if (this.paused || this.gameOver) return;
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Debug log
        console.log('Touch start:', {x: x.toFixed(0), y: y.toFixed(0)});
        
        this.touchStartTime = Date.now();
        
        // Store touch info
        this.touches[touch.identifier] = { x, y, startX: x, startY: y };
        
        const station = this.getStationAt(x, y);
        console.log('Station found:', station ? 'YES' : 'NO');
        
        if (station) {
            // Start long press timer for deletion
            this.longPressTimer = setTimeout(() => {
                this.handleRightClick(x, y);
                this.drawingLine = null;
                this.selectedStation = null;
            }, 500);
            
            // Check if we can extend from this station
            let canExtend = false;
            
            // First check if this station is at the end of an existing line
            for (let line of this.lines) {
                if (line.stations.length > 0) {
                    const lastStation = line.stations[line.stations.length - 1];
                    const firstStation = line.stations[0];
                    
                    if (lastStation === station || firstStation === station) {
                        // Can extend this line
                        this.drawingLine = line;
                        this.selectedStation = station;
                        canExtend = true;
                        console.log('Extending existing line');
                        break;
                    }
                }
            }
            
            // If we can't extend, start a new line
            if (!canExtend) {
                const emptyLine = this.lines.find(l => l.stations.length === 0);
                if (emptyLine) {
                    this.drawingLine = emptyLine;
                    this.selectedStation = station;
                    // Don't overwrite stations array, just push to it
                    if (!emptyLine.stations.includes(station)) {
                        emptyLine.stations.push(station);
                    }
                    console.log('Starting new line', emptyLine.id, 'with station');
                } else {
                    console.log('No empty lines available!');
                }
            }
        }
    }
    
    /**
     * Handles the touch move event.
     * @param {TouchEvent} e - The touch event.
     */
    onTouchMove(e) {
        e.preventDefault();
        
        // Clear long press timer on move
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        this.touches[touch.identifier] = { x, y };
        this.hoveredStation = this.getStationAt(x, y);
        
        if (this.drawingLine) {
            this.tempMouseX = x;
            this.tempMouseY = y;
        }
    }
    
    /**
     * Handles the touch end event.
     * @param {TouchEvent} e - The touch event.
     */
    onTouchEnd(e) {
        e.preventDefault();
        
        // Clear long press timer
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        
        const touchDuration = Date.now() - this.touchStartTime;
        
        // Handle double tap for deletion
        const currentTime = Date.now();
        const tapGap = currentTime - this.lastTouchEnd;
        if (tapGap < 300 && tapGap > 0) {
            const touch = e.changedTouches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            this.handleRightClick(x, y);
        }
        this.lastTouchEnd = currentTime;
        
        // Handle normal touch end (like mouse up)
        if (this.drawingLine) {
            const touch = e.changedTouches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            const station = this.getStationAt(x, y);
            
            if (station && station !== this.selectedStation) {
                // Check if we need a bridge to connect
                const needsBridge = this.crossesWater(
                    this.selectedStation.x, this.selectedStation.y,
                    station.x, station.y
                );
                
                if (needsBridge) {
                    if (this.availableBridges > 0) {
                        this.availableBridges--;
                        this.bridges.push({
                            from: this.selectedStation,
                            to: station,
                            line: this.drawingLine
                        });
                        this.drawingLine.bridges.push({
                            from: this.selectedStation,
                            to: station
                        });
                    } else {
                        // Can't connect without bridge
                        console.log('No bridges available');
                        this.drawingLine = null;
                        this.selectedStation = null;
                        this.tempMouseX = null;
                        this.tempMouseY = null;
                        return;
                    }
                }
                
                // Add station to line
                if (!this.drawingLine.stations.includes(station)) {
                    // Check if we're extending from the beginning
                    if (this.drawingLine.stations[0] === this.selectedStation) {
                        // Add to beginning
                        this.drawingLine.stations.unshift(station);
                    } else {
                        // Add to end
                        this.drawingLine.stations.push(station);
                    }
                    console.log('Station added to line! Line now has', this.drawingLine.stations.length, 'stations');
                }
                
                // Add train if this is the first complete line
                if (this.drawingLine.stations.length === 2 && this.drawingLine.trains.length === 0) {
                    const train = {
                        line: this.drawingLine,
                        position: 0,
                        direction: 1,
                        speed: 0.0003,
                        capacity: 6,
                        passengers: []
                    };
                    this.trains.push(train);
                    this.drawingLine.trains.push(train);
                    console.log('Train added to line!');
                }
                
                // Clear drawing state but keep the line
                this.selectedStation = null;
            }
            
            // Only clear drawing state, not the line itself
            this.drawingLine = null;
            this.selectedStation = null;
            this.tempMouseX = null;
            this.tempMouseY = null;
        }
        
        // Clean up touch tracking
        const touch = e.changedTouches[0];
        delete this.touches[touch.identifier];
    }
    
    /**
     * Handles the mouse up event to finalize line drawing.
     * @param {MouseEvent} e - The mouse event.
     */
    onMouseUp(e) {
        if (!this.drawingLine) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const station = this.getStationAt(x, y);
        
        if (station && station !== this.selectedStation && !this.drawingLine.stations.includes(station)) {
            // Check if connection needs bridge
            const lastStation = this.drawingLine.stations[this.drawingLine.stations.length - 1];
            const needsBridge = this.crossesWater(lastStation.x, lastStation.y, station.x, station.y);
            
            if (needsBridge && this.availableBridges <= 0) {
                // Can't connect without bridge
                this.showNoBridgeWarning();
            } else {
                if (needsBridge) {
                    this.availableBridges--;
                    this.drawingLine.bridges.push({
                        from: lastStation,
                        to: station
                    });
                }
                
                this.drawingLine.stations.push(station);
                this.recalculateLineSegments(this.drawingLine);
                
                if (this.drawingLine.stations.length >= 2 && this.drawingLine.trains.length === 0) {
                    this.addTrainToLine(this.drawingLine);
                }
            }
        } else if (this.drawingLine.stations.length === 1) {
            // Clear incomplete line
            this.drawingLine.stations = [];
        }
        
        this.drawingLine = null;
        this.selectedStation = null;
        this.tempMouseX = null;
        this.tempMouseY = null;
    }
    
    /**
     * Finds the station at a given coordinate.
     * @param {number} x - The x-coordinate.
     * @param {number} y - The y-coordinate.
     * @returns {object|null} The station object if found, otherwise null.
     */
    getStationAt(x, y) {
        // Increase touch target size for mobile - adjusted for smaller stations
        const isMobile = 'ontouchstart' in window;
        const touchRadius = isMobile ? this.designTokens.Ro + 25 : this.designTokens.Ro + 5;
        
        for (let station of this.stations) {
            const dist = Math.hypot(station.x - x, station.y - y);
            if (dist < touchRadius) {
                return station;
            }
        }
        return null;
    }
    
    /**
     * Checks if a line segment between two points crosses a water body.
     * @param {number} x1 - The x-coordinate of the first point.
     * @param {number} y1 - The y-coordinate of the first point.
     * @param {number} x2 - The x-coordinate of the second point.
     * @param {number} y2 - The y-coordinate of the second point.
     * @returns {boolean} True if the line crosses water, false otherwise.
     */
    crossesWater(x1, y1, x2, y2) {
        const steps = 20;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = x1 + (x2 - x1) * t;
            const y = y1 + (y2 - y1) * t;
            if (this.isInWater(x, y)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Displays a warning message when no bridges are available.
     */
    showNoBridgeWarning() {
        // Flash warning on screen
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #DD2515;
            color: white;
            padding: 20px;
            border-radius: 8px;
            font-size: 18px;
            z-index: 1000;
        `;
        warning.textContent = 'Keine Brücken verfügbar!';
        document.body.appendChild(warning);
        
        setTimeout(() => {
            document.body.removeChild(warning);
        }, 2000);
    }
    
    /**
     * Recalculates the segments of a line after a change.
     * @param {object} line - The line to recalculate.
     */
    recalculateLineSegments(line) {
        line.segments = [];
        
        for (let i = 0; i < line.stations.length - 1; i++) {
            line.segments.push({
                from: line.stations[i],
                to: line.stations[i + 1],
                needsBridge: this.crossesWater(
                    line.stations[i].x, 
                    line.stations[i].y,
                    line.stations[i + 1].x, 
                    line.stations[i + 1].y
                )
            });
        }
    }
    
    /**
     * Adds a new train to a line if resources are available.
     * @param {object} line - The line to add the train to.
     */
    addTrainToLine(line) {
        if (this.availableTrains > 0) {
            const train = {
                id: this.trains.length,
                line: line,
                position: 0,
                direction: 1,
                speed: 0.0005,
                passengers: [],
                capacity: 6
            };
            
            this.trains.push(train);
            line.trains.push(train);
            this.availableTrains--;
        }
    }
    
    /**
     * Renders the entire game screen.
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = this.cityConfig.backgroundColor || '#F5F5F5';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render city name
        this.renderCityName();
        
        // Render water
        this.renderWater();
        
        // Render landmarks
        this.renderLandmarks();
        
        // Render lines
        this.renderLines();
        
        // Render temp line while drawing
        if (this.drawingLine && this.tempMouseX) {
            this.renderTempLine();
        }
        
        // Render bridges
        this.renderBridges();
        
        // Render stations
        this.renderStations();
        
        // Render trains
        this.renderTrains();
        
        // Render passengers
        this.renderPassengers();
        
        // Render UI
        this.renderUI();
    }
    
    /**
     * Renders the city name on the canvas.
     */
    renderCityName() {
        this.ctx.save();
        
        const isMobile = window.innerWidth < 768;
        
        if (isMobile) {
            // Mobile: Position top right, smaller text
            this.ctx.font = 'bold 32px Helvetica Neue, Helvetica, sans-serif';
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(this.cityConfig.name.toUpperCase(), this.canvas.width - 20, 80);
            
            // Subtitle if exists
            if (this.cityConfig.subtitle) {
                this.ctx.font = '18px Helvetica Neue, Helvetica, sans-serif';
                this.ctx.fillText(this.cityConfig.subtitle, this.canvas.width - 20, 105);
            }
        } else {
            // Desktop: Original position
            this.ctx.font = 'bold 48px Helvetica Neue, Helvetica, sans-serif';
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(this.cityConfig.name, 30, 60);
            
            // Subtitle
            if (this.cityConfig.subtitle) {
                this.ctx.font = '24px Helvetica Neue, Helvetica, sans-serif';
                this.ctx.fillText(this.cityConfig.subtitle, 30, 90);
            }
        }
        
        this.ctx.restore();
    }
    
    /**
     * Renders water bodies (rivers, bays) on the canvas.
     */
    renderWater() {
        if (!this.cityConfig) return;
        
        this.ctx.save();
        
        // Set water color
        const waterColor = this.cityConfig.waterColor || '#D4E6F1';
        
        // Render rivers
        if (this.cityConfig.rivers) {
            for (let river of this.cityConfig.rivers) {
                this.ctx.strokeStyle = waterColor;
                this.ctx.fillStyle = waterColor;
                this.ctx.lineWidth = river.width;
                this.ctx.lineCap = 'round';
                this.ctx.lineJoin = 'round';
                
                this.ctx.beginPath();
                for (let i = 0; i < river.points.length; i++) {
                    const p = river.points[i];
                    const x = p.x * this.canvas.width;
                    const y = p.y * this.canvas.height;
                    
                    if (i === 0) {
                        this.ctx.moveTo(x, y);
                    } else if (river.type === 'curve' && i < river.points.length - 1) {
                        // Smooth curves for realistic rivers
                        const next = river.points[i + 1];
                        const cpX = x;
                        const cpY = y;
                        const nextX = next.x * this.canvas.width;
                        const nextY = next.y * this.canvas.height;
                        
                        this.ctx.quadraticCurveTo(cpX, cpY, (x + nextX) / 2, (y + nextY) / 2);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
                this.ctx.stroke();
                
                // Add river name label
                if (river.name && river.points.length > 0) {
                    const midPoint = river.points[Math.floor(river.points.length / 2)];
                    this.ctx.font = '12px Helvetica Neue, Helvetica, sans-serif';
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                    this.ctx.fillText(
                        river.name, 
                        midPoint.x * this.canvas.width - 20, 
                        midPoint.y * this.canvas.height
                    );
                }
            }
        }
        
        // Render bay/ocean
        if (this.cityConfig.water) {
            const water = this.cityConfig.water;
            this.ctx.fillStyle = waterColor;
            
            if (water.type === 'bay') {
                this.ctx.fillRect(
                    water.x * this.canvas.width,
                    water.y * this.canvas.height,
                    water.width * this.canvas.width,
                    water.height * this.canvas.height
                );
            }
        }
        
        // Render islands
        if (this.cityConfig.islands) {
            for (let island of this.cityConfig.islands) {
                if (island.isLand) {
                    // Islands are land (background color)
                    this.ctx.fillStyle = this.cityConfig.backgroundColor || '#F5F5F5';
                } else {
                    // Water islands in river
                    this.ctx.fillStyle = this.cityConfig.backgroundColor || '#F5F5F5';
                }
                
                const x = island.x * this.canvas.width;
                const y = island.y * this.canvas.height;
                const w = (typeof island.width === 'number' && island.width < 1 
                    ? island.width * this.canvas.width 
                    : island.width);
                const h = (typeof island.height === 'number' && island.height < 1 
                    ? island.height * this.canvas.height 
                    : island.height);
                
                if (island.shape === 'ellipse') {
                    this.ctx.beginPath();
                    this.ctx.ellipse(x, y, w/2, h/2, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                } else {
                    this.ctx.fillRect(x - w/2, y - h/2, w, h);
                }
                
                // Island name
                if (island.name) {
                    this.ctx.font = '11px Helvetica Neue, Helvetica, sans-serif';
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(island.name, x, y);
                    this.ctx.textAlign = 'left';
                }
            }
        }
        
        this.ctx.restore();
    }
    
    /**
     * Renders landmarks on the canvas.
     */
    renderLandmarks() {
        if (!this.cityConfig || !this.cityConfig.landmarks) return;
        
        this.ctx.save();
        this.ctx.font = '10px Helvetica Neue, Helvetica, sans-serif';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        
        for (let landmark of this.cityConfig.landmarks) {
            const x = landmark.x * this.canvas.width;
            const y = landmark.y * this.canvas.height;
            
            this.ctx.fillText(landmark.name, x, y);
        }
        
        this.ctx.restore();
    }
    
    /**
     * Renders all metro lines on the canvas.
     */
    renderLines() {
        for (let line of this.lines) {
            if (line.stations.length < 2) continue;
            
            // Debug: Log lines being rendered
            if (line.stations.length > 0) {
                console.log(`Rendering line ${line.id} with ${line.stations.length} stations`);
            }
            
            this.ctx.strokeStyle = line.color;
            this.ctx.lineWidth = this.designTokens.wl;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            this.ctx.beginPath();
            for (let i = 0; i < line.stations.length; i++) {
                const station = line.stations[i];
                if (i === 0) {
                    this.ctx.moveTo(station.x, station.y);
                } else {
                    this.ctx.lineTo(station.x, station.y);
                }
            }
            this.ctx.stroke();
        }
    }
    
    /**
     * Renders the temporary line while the user is drawing it.
     */
    renderTempLine() {
        if (!this.drawingLine || !this.selectedStation || !this.tempMouseX) return;
        
        const lastStation = this.drawingLine.stations[this.drawingLine.stations.length - 1];
        
        this.ctx.strokeStyle = this.drawingLine.color;
        this.ctx.lineWidth = this.designTokens.wl;
        this.ctx.lineCap = 'round';
        this.ctx.setLineDash([10, 5]);
        
        // Check if crosses water
        const crossesWater = this.crossesWater(lastStation.x, lastStation.y, this.tempMouseX, this.tempMouseY);
        if (crossesWater && this.availableBridges <= 0) {
            this.ctx.strokeStyle = 'rgba(221, 37, 21, 0.5)'; // Red for no bridge
        }
        
        this.ctx.beginPath();
        this.ctx.moveTo(lastStation.x, lastStation.y);
        this.ctx.lineTo(this.tempMouseX, this.tempMouseY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    /**
     * Renders all bridges on the canvas.
     */
    renderBridges() {
        for (let line of this.lines) {
            for (let bridge of line.bridges) {
                const midX = (bridge.from.x + bridge.to.x) / 2;
                const midY = (bridge.from.y + bridge.to.y) / 2;
                
                this.ctx.save();
                this.ctx.translate(midX, midY);
                
                // Bridge icon
                this.ctx.fillStyle = 'white';
                this.ctx.strokeStyle = '#333';
                this.ctx.lineWidth = 2;
                
                this.ctx.beginPath();
                this.ctx.rect(-15, -10, 30, 20);
                this.ctx.fill();
                this.ctx.stroke();
                
                this.ctx.font = '12px Helvetica Neue';
                this.ctx.fillStyle = '#333';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('🌉', 0, 4);
                
                this.ctx.restore();
            }
        }
    }
    
    /**
     * Renders all stations on the canvas.
     */
    renderStations() {
        const colors = {
            stationFill: '#FFFFFF',
            stationStroke: '#0A0404'
        };
        
        for (let station of this.stations) {
            // Debug: draw touch area
            if (window.debugTouch) {
                this.ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
                this.ctx.beginPath();
                const touchRadius = 'ontouchstart' in window ? this.designTokens.Ro + 25 : this.designTokens.Ro + 5;
                this.ctx.arc(station.x, station.y, touchRadius, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.save();
            this.ctx.translate(station.x, station.y);
            
            // Hover effect
            if (this.hoveredStation === station) {
                this.ctx.shadowColor = this.cityConfig.primaryColor || '#80C3FF';
                this.ctx.shadowBlur = 15;
            }
            
            // Station shape
            this.ctx.fillStyle = colors.stationFill;
            this.ctx.strokeStyle = colors.stationStroke;
            this.ctx.lineWidth = this.designTokens.ws;
            
            this.drawStationShape(station.shape, this.designTokens.Ro);
            
            // Overcrowding
            if (station.overcrowding > 0) {
                const progress = station.overcrowding / station.maxOvercrowding;
                this.ctx.strokeStyle = '#DD2515';
                this.ctx.lineWidth = 4;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, this.designTokens.Ro + 12, -Math.PI/2, -Math.PI/2 + Math.PI * 2 * progress);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        }
    }
    
    /**
     * Draws a station shape on the canvas.
     * @param {string} shape - The shape to draw (e.g., 'circle', 'triangle').
     * @param {number} size - The size of the shape.
     */
    drawStationShape(shape, size) {
        this.ctx.beginPath();
        
        switch(shape) {
            case 'circle':
                this.ctx.arc(0, 0, size, 0, Math.PI * 2);
                break;
            case 'triangle':
                const h = size * Math.sqrt(3);
                this.ctx.moveTo(0, -size);
                this.ctx.lineTo(-size, h/2);
                this.ctx.lineTo(size, h/2);
                this.ctx.closePath();
                break;
            case 'square':
                this.ctx.rect(-size, -size, size * 2, size * 2);
                break;
            default:
                this.ctx.arc(0, 0, size, 0, Math.PI * 2);
        }
        
        this.ctx.fill();
        this.ctx.stroke();
    }
    
    /**
     * Renders all trains on the canvas.
     */
    renderTrains() {
        // Simple train rendering
        for (let train of this.trains) {
            if (!train.line || train.line.stations.length < 2) continue;
            
            const stationIndex = Math.floor(train.position * (train.line.stations.length - 1));
            const nextIndex = Math.min(stationIndex + 1, train.line.stations.length - 1);
            const t = (train.position * (train.line.stations.length - 1)) % 1;
            
            const station1 = train.line.stations[stationIndex];
            const station2 = train.line.stations[nextIndex];
            
            const x = station1.x + (station2.x - station1.x) * t;
            const y = station1.y + (station2.y - station1.y) * t;
            
            this.ctx.save();
            this.ctx.translate(x, y);
            
            this.ctx.fillStyle = '#333';
            this.ctx.strokeStyle = train.line.color;
            this.ctx.lineWidth = 2;
            
            this.ctx.beginPath();
            this.ctx.rect(-20, -6, 40, 12);
            this.ctx.fill();
            this.ctx.stroke();
            
            this.ctx.restore();
        }
    }
    
    /**
     * Renders all waiting passengers at stations.
     */
    renderPassengers() {
        for (let station of this.stations) {
            if (station.passengers.length === 0) continue;
            
            const angleStep = (Math.PI * 2) / Math.max(6, station.passengers.length);
            
            for (let i = 0; i < station.passengers.length; i++) {
                const passenger = station.passengers[i];
                const angle = i * angleStep - Math.PI / 2;
                const radius = this.designTokens.Ro + 40; // More space from station
                
                const x = station.x + Math.cos(angle) * radius;
                const y = station.y + Math.sin(angle) * radius;
                
                this.ctx.save();
                this.ctx.translate(x, y);
                
                // Draw background circle for better visibility
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
                this.ctx.strokeStyle = '#000';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, 16, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
                
                // Draw passenger shape with strong contrast
                this.ctx.fillStyle = '#000';
                this.ctx.strokeStyle = '#000';
                this.ctx.lineWidth = 1.5;
                this.ctx.scale(0.7, 0.7); // Better scale for visibility
                
                this.drawStationShape(passenger.targetShape, 12); // Better size
                
                this.ctx.restore();
            }
        }
    }
    
    /**
     * Renders the user interface elements (e.g., score, week).
     */
    renderUI() {
        // Bridge counter
        this.ctx.save();
        this.ctx.font = '16px Helvetica Neue, Helvetica, sans-serif';
        this.ctx.fillStyle = '#333';
        this.ctx.fillText(`Brücken: ${this.availableBridges}`, this.canvas.width - 150, 30);
        this.ctx.restore();
    }
    
    /**
     * Spawns a new passenger at a random station.
     */
    spawnPassenger() {
        if (this.stations.length < 2) return;
        
        const station = this.stations[Math.floor(Math.random() * this.stations.length)];
        const targetShapes = this.stations
            .filter(s => s !== station)
            .map(s => s.shape);
        
        if (targetShapes.length > 0) {
            const targetShape = targetShapes[Math.floor(Math.random() * targetShapes.length)];
            
            station.passengers.push({
                id: this.passengers.length,
                station: station,
                targetShape: targetShape,
                waitTime: 0
            });
            
            this.passengers.push(station.passengers[station.passengers.length - 1]);
        }
    }
    
    /**
     * Updates the state of all trains.
     * @param {number} deltaTime - The time elapsed since the last frame.
     */
    updateTrains(deltaTime) {
        for (let train of this.trains) {
            if (!train.line || train.line.stations.length < 2) continue;
            
            // Move train
            train.position += train.direction * train.speed * deltaTime;
            
            // Check if at a station
            const stationIndex = Math.floor(train.position * (train.line.stations.length - 1));
            const positionAtStation = (train.position * (train.line.stations.length - 1)) % 1 < 0.05;
            
            if (positionAtStation) {
                const station = train.line.stations[stationIndex];
                
                // Drop off passengers
                train.passengers = train.passengers.filter(p => {
                    if (p.targetShape === station.shape) {
                        this.score++; // Increase score for delivered passenger
                        return false; // Remove from train
                    }
                    return true; // Keep on train
                });
                
                // Pick up passengers
                if (train.passengers.length < train.capacity) {
                    const boarding = [];
                    station.passengers = station.passengers.filter(p => {
                        // Check if passenger wants to go to a station on this line
                        const targetStationOnLine = train.line.stations.some(s => s.shape === p.targetShape);
                        
                        if (targetStationOnLine && train.passengers.length + boarding.length < train.capacity) {
                            boarding.push(p);
                            return false; // Remove from station
                        }
                        return true; // Keep at station
                    });
                    
                    train.passengers.push(...boarding);
                }
            }
            
            // Reverse at ends
            if (train.position >= 1) {
                train.position = 1;
                train.direction = -1;
            } else if (train.position <= 0) {
                train.position = 0;
                train.direction = 1;
            }
        }
    }
    
    /**
     * Updates the state of all passengers.
     * @param {number} deltaTime - The time elapsed since the last frame.
     */
    updatePassengers(deltaTime) {
        for (let station of this.stations) {
            if (station.passengers.length > station.capacity) {
                station.overcrowding += deltaTime;
                if (station.overcrowding >= station.maxOvercrowding) {
                    this.endGame();
                }
            } else {
                station.overcrowding = Math.max(0, station.overcrowding - deltaTime);
            }
        }
    }
    
    /**
     * Updates the game time, including day, week, and passenger spawning.
     * @param {number} deltaTime - The time elapsed since the last frame.
     */
    updateGameTime(deltaTime) {
        if (this.paused || this.gameOver) return;
        
        this.dayProgress += deltaTime * this.gameSpeed;
        
        if (this.dayProgress >= this.dayDuration) {
            this.dayProgress = 0;
            this.day++;
            
            if (this.day > 7) {
                this.day = 1;
                this.week++;
                // Add bridges based on city config
                const bridgesPerWeek = this.cityConfig.bridgesPerWeek || 1;
                this.availableBridges += Math.floor(bridgesPerWeek);
            }
        }
        
        // Spawn passengers more frequently based on week and time of day
        const spawnRate = this.calculateSpawnRate();
        if (Math.random() < spawnRate * deltaTime / 1000) {
            this.spawnPassenger();
        }
    }
    
    /**
     * Calculates the passenger spawn rate based on game progress and time of day.
     * @returns {number} The calculated spawn rate.
     */
    calculateSpawnRate() {
        // More balanced spawn rate for enjoyable gameplay
        let rate = 0.3 + (this.week * 0.1);  // Much slower base rate
        
        // Rush hour multiplier (7-9 AM and 5-7 PM)
        const timeProgress = this.dayProgress / this.dayDuration;
        const currentHour = 6 + (16 * timeProgress); // 6 AM to 10 PM
        
        if ((currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19)) {
            rate *= 1.5; // Gentler rush hour increase
        }
        
        return Math.min(rate, 2.0); // Reasonable cap for better gameplay
    }
    
    /**
     * Updates the UI with the latest score and week.
     */
    updateUI() {
        // Update score, week, etc.
        const scoreEl = document.getElementById('score-value');
        if (scoreEl) scoreEl.textContent = this.score;
        
        const weekEl = document.getElementById('week-value');
        if (weekEl) weekEl.textContent = this.week;
    }
    
    /**
     * Toggles the paused state of the game.
     */
    togglePause() {
        this.paused = !this.paused;
    }
    
    /**
     * Cycles through the available game speeds.
     */
    cycleSpeed() {
        if (this.gameSpeed === 1) {
            this.gameSpeed = 2;
        } else if (this.gameSpeed === 2) {
            this.gameSpeed = 0;
        } else {
            this.gameSpeed = 1;
        }
    }
    
    /**
     * Toggles the night mode.
     */
    toggleNightMode() {
        this.nightMode = !this.nightMode;
        document.body.classList.toggle('night-mode');
    }
    
    /**
     * Initializes a new game with the specified city and mode.
     * @param {string} city - The key of the city to play.
     * @param {string} mode - The game mode to play.
     */
    initializeCity(city, mode) {
        this.currentCity = city || 'london';
        this.currentMode = mode || 'normal';
        this.restart();
    }
    
    /**
     * Restarts the game, resetting all state variables.
     */
    restart() {
        this.stations = [];
        this.lines = [];
        this.trains = [];
        this.passengers = [];
        this.bridges = [];
        
        this.score = 0;
        this.week = 1;
        this.day = 1;
        this.dayProgress = 0;
        
        this.loadCityConfig();
        this.generateInitialStations();
        this.createInitialLines();
        
        this.gameOver = false;
        this.paused = false;
    }
    
    /**
     * Ends the game and displays the game over screen.
     */
    endGame() {
        this.gameOver = true;
        const gameOverEl = document.getElementById('game-over');
        if (gameOverEl) {
            gameOverEl.style.display = 'block';
            const finalScoreEl = document.getElementById('final-score');
            if (finalScoreEl) finalScoreEl.textContent = this.score;
        }
    }
    
    /**
     * The main game loop, which updates and renders the game on each frame.
     * @param {number} currentTime - The current time provided by requestAnimationFrame.
     */
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        if (!this.paused && !this.gameOver && deltaTime < 100) {
            this.updateGameTime(deltaTime);
            this.updateTrains(deltaTime);
            this.updatePassengers(deltaTime);
        }
        
        this.render();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize
const game = new MiniMetro();
window.game = game;