class MiniMetro {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        
        this.u = 4;
        this.designTokens = {
            u: 4,
            wl: 8,
            ws: 5,
            Ro: 24,
            Ri: 19,
            sp: 10,
            vp: 5,
            wi: 4,
            ai: 4,
            wc: 4,
            re: 24,
            rw: 24,
            rm: 24
        };
        
        this.colors = {
            day: {
                background: '#FFFFFF',
                water: '#E4ECF4',
                stationFill: '#FFFFFF',
                stationStroke: '#0A0404',
                passenger: '#0A0404',
                text: '#0A0404'
            },
            night: {
                background: '#242021',
                water: '#E4ECF4',
                stationFill: '#353136',
                stationStroke: '#F2F2F2',
                passenger: '#F2F2F2',
                text: '#F2F2F2'
            }
        };
        
        this.lineColors = ['#DD2515', '#2581C4', '#35AB52', '#F0AB00', '#00BFFF', '#FFDD55'];
        
        this.nightMode = false;
        this.paused = false;
        this.gameOver = false;
        
        this.stations = [];
        this.lines = [];
        this.trains = [];
        this.passengers = [];
        
        this.score = 0;
        this.week = 1;
        this.day = 1;
        this.dayProgress = 0;
        this.dayDuration = 20000; // 20 seconds per day, 140 seconds per week
        this.timeOfDay = 6; // Start at 6:00 AM
        this.gameSpeed = 1; // 1x, 2x, or 0 (paused)
        
        this.selectedLine = null;
        this.draggedHandle = null;
        this.hoveredStation = null;
        
        this.stationShapes = ['circle', 'triangle', 'square'];
        this.rareShapes = ['diamond', 'cross', 'star', 'pentagon', 'teardrop', 'oval', 'fan'];
        
        this.upgrades = [
            { type: 'line', icon: '━', name: 'Neue Linie' },
            { type: 'train', icon: '▣', name: 'Lokomotive' },
            { type: 'carriage', icon: '▢', name: 'Waggon' },
            { type: 'bridge', icon: '╫', name: 'Brücke/Tunnel' },
            { type: 'interchange', icon: '◉', name: 'Umsteigebahnhof' }
        ];
        
        this.dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        
        // City configurations with realistic water features
        this.cityConfigs = {
            london: {
                water: [
                    { type: 'river', points: [
                        {x: 0, y: 0.6}, {x: 0.15, y: 0.58}, {x: 0.3, y: 0.6},
                        {x: 0.45, y: 0.65}, {x: 0.6, y: 0.62}, {x: 0.75, y: 0.58},
                        {x: 0.9, y: 0.6}, {x: 1, y: 0.62}
                    ], width: 60, name: 'Thames' }
                ],
                spawnZones: [{x: 0.1, y: 0.1, w: 0.8, h: 0.4}, {x: 0.1, y: 0.7, w: 0.8, h: 0.2}],
                color: '#DD2515'
            },
            paris: {
                water: [
                    { type: 'river', points: [
                        {x: 0, y: 0.5}, {x: 0.2, y: 0.48}, {x: 0.4, y: 0.5},
                        {x: 0.6, y: 0.52}, {x: 0.8, y: 0.5}, {x: 1, y: 0.48}
                    ], width: 50, name: 'Seine' },
                    { type: 'island', x: 0.5, y: 0.5, w: 0.08, h: 0.04, name: 'Île de la Cité' }
                ],
                spawnZones: [{x: 0.1, y: 0.1, w: 0.8, h: 0.35}, {x: 0.1, y: 0.65, w: 0.8, h: 0.25}],
                color: '#2581C4'
            },
            newyork: {
                water: [
                    { type: 'river', points: [{x: 0.3, y: 0}, {x: 0.3, y: 1}], width: 40, name: 'Hudson River' },
                    { type: 'river', points: [{x: 0.7, y: 0}, {x: 0.7, y: 1}], width: 40, name: 'East River' },
                    { type: 'island', x: 0.5, y: 0.5, w: 0.35, h: 0.8, name: 'Manhattan' }
                ],
                spawnZones: [{x: 0.05, y: 0.1, w: 0.2, h: 0.8}, {x: 0.35, y: 0.1, w: 0.3, h: 0.8}, {x: 0.75, y: 0.1, w: 0.2, h: 0.8}],
                color: '#F0AB00'
            },
            berlin: {
                water: [
                    { type: 'river', points: [
                        {x: 0, y: 0.4}, {x: 0.3, y: 0.42}, {x: 0.5, y: 0.45},
                        {x: 0.7, y: 0.43}, {x: 1, y: 0.45}
                    ], width: 45, name: 'Spree' }
                ],
                spawnZones: [{x: 0.1, y: 0.05, w: 0.8, h: 0.3}, {x: 0.1, y: 0.55, w: 0.8, h: 0.35}],
                color: '#35AB52'
            }
        };
        
        this.currentCity = 'london';
        this.currentMode = 'normal';
        
        this.availableLines = 3;
        this.availableTrains = 3;
        this.availableCarriages = 0;
        this.availableBridges = 0;
        this.availableInterchanges = 0;
        
        this.lastFrameTime = 0;
        this.needsRedraw = true;
        this.init();
    }
    
    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }
    
    init() {
        this.generateInitialStations();
        this.createInitialLines();
        this.setupEventListeners();
        this.updateClockDisplay();
        this.needsRedraw = true;
        this.gameLoop(0);
    }
    
    generateInitialStations() {
        const minDistance = 150;
        const maxAttempts = 100;
        const stationCount = 6;
        
        // Get city configuration
        const cityConfig = this.cityConfigs[this.currentCity] || this.cityConfigs.london;
        const spawnZones = cityConfig.spawnZones;
        
        for (let i = 0; i < stationCount; i++) {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < maxAttempts) {
                // Pick a random spawn zone
                const zone = spawnZones[Math.floor(Math.random() * spawnZones.length)];
                const x = (zone.x + Math.random() * zone.w) * this.canvas.width;
                const y = (zone.y + Math.random() * zone.h) * this.canvas.height;
                
                // Check if position is valid (not in water, not too close to other stations)
                let validPosition = !this.isInWater(x, y);
                
                if (validPosition) {
                    for (let station of this.stations) {
                        const dist = Math.hypot(station.x - x, station.y - y);
                        if (dist < minDistance) {
                            validPosition = false;
                            break;
                        }
                    }
                }
                
                if (validPosition) {
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
                        maxOvercrowding: 8000
                    });
                    placed = true;
                }
                attempts++;
            }
        }
    }
    
    isInWater(x, y) {
        const cityConfig = this.cityConfigs[this.currentCity];
        if (!cityConfig || !cityConfig.water) return false;
        
        const relX = x / this.canvas.width;
        const relY = y / this.canvas.height;
        
        for (let water of cityConfig.water) {
            if (water.type === 'river') {
                // Check if point is near river path
                for (let i = 0; i < water.points.length - 1; i++) {
                    const p1 = water.points[i];
                    const p2 = water.points[i + 1];
                    
                    // Simple distance from line segment
                    const dist = this.distanceFromLineSegment(relX, relY, p1.x, p1.y, p2.x, p2.y);
                    if (dist * this.canvas.width < water.width) {
                        return true;
                    }
                }
            } else if (water.type === 'island') {
                // Check if point is inside island rectangle
                if (Math.abs(relX - water.x) < water.w/2 && Math.abs(relY - water.y) < water.h/2) {
                    return false; // Islands are land, not water
                }
            }
        }
        return false;
    }
    
    distanceFromLineSegment(px, py, x1, y1, x2, y2) {
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
    
    createInitialLines() {
        for (let i = 0; i < this.availableLines; i++) {
            this.lines.push({
                id: i,
                color: this.lineColors[i],
                stations: [],
                trains: [],
                segments: []
            });
        }
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    onMouseDown(e) {
        if (this.paused || this.gameOver) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const station = this.getStationAt(x, y);
        
        if (e.button === 0) {
            if (station) {
                // Find an empty line to use
                let lineToUse = null;
                for (let line of this.lines) {
                    if (line.stations.length === 0) {
                        lineToUse = line;
                        break;
                    }
                }
                
                // Or extend an existing line if clicking on endpoint
                if (!lineToUse) {
                    const handle = this.getLineHandleAt(x, y);
                    if (handle && this.getStationAt(x, y)) {
                        this.draggedHandle = handle;
                        return;
                    }
                }
                
                // Start new line from this station
                if (lineToUse) {
                    this.startDrawingLine(lineToUse, station);
                }
            } else {
                // Check if clicking on line endpoint to extend
                const handle = this.getLineHandleAt(x, y);
                if (handle) {
                    this.draggedHandle = handle;
                }
            }
        } else if (e.button === 2) {
            // Right click to remove station from line
            if (station) {
                for (let line of this.lines) {
                    const index = line.stations.indexOf(station);
                    if (index !== -1) {
                        // Remove station and all segments after it
                        if (index === 0) {
                            // Removing first station
                            line.stations.shift();
                        } else if (index === line.stations.length - 1) {
                            // Removing last station
                            line.stations.pop();
                        } else {
                            // Removing middle station splits the line - just remove everything after
                            line.stations = line.stations.slice(0, index);
                        }
                        this.recalculateLineSegments(line);
                        break;
                    }
                }
            }
        }
    }
    
    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.hoveredStation = this.getStationAt(x, y);
        
        if (this.draggedHandle) {
            this.updateDraggedLine(x, y);
        }
    }
    
    onMouseUp(e) {
        if (this.draggedHandle) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const station = this.getStationAt(x, y);
            if (station && !this.draggedHandle.line.stations.includes(station)) {
                // Add station to line
                if (this.draggedHandle.isStart) {
                    this.draggedHandle.line.stations.unshift(station);
                } else {
                    this.draggedHandle.line.stations.push(station);
                }
                this.recalculateLineSegments(this.draggedHandle.line);
                
                // Add train if line now has 2+ stations
                if (this.draggedHandle.line.trains.length === 0 && this.draggedHandle.line.stations.length >= 2) {
                    this.addTrainToLine(this.draggedHandle.line);
                }
            } else {
                // If not connected to a station, clear incomplete line
                if (this.draggedHandle.line.stations.length < 2) {
                    this.draggedHandle.line.stations = [];
                    this.draggedHandle.line.segments = [];
                }
            }
            
            this.draggedHandle = null;
            this.tempEndpoint = null;
            this.needsRedraw = true;
        }
    }
    
    getStationAt(x, y) {
        for (let station of this.stations) {
            const dist = Math.hypot(station.x - x, station.y - y);
            if (dist < this.designTokens.Ro) {
                return station;
            }
        }
        return null;
    }
    
    getLineHandleAt(x, y) {
        const handleRadius = 15;
        
        for (let line of this.lines) {
            if (line.stations.length > 0) {
                const firstStation = line.stations[0];
                const lastStation = line.stations[line.stations.length - 1];
                
                if (Math.hypot(firstStation.x - x, firstStation.y - y) < handleRadius) {
                    return { line: line, isStart: true };
                }
                
                if (Math.hypot(lastStation.x - x, lastStation.y - y) < handleRadius) {
                    return { line: line, isStart: false };
                }
            }
        }
        return null;
    }
    
    startDrawingLine(line, station) {
        line.stations = [station];
        this.draggedHandle = { line: line, isStart: false };
    }
    
    canConnect(line, station) {
        const lastStation = line.stations[line.stations.length - 1];
        return true;
    }
    
    updateDraggedLine(x, y) {
        if (!this.draggedHandle) return;
        
        const line = this.draggedHandle.line;
        if (line.stations.length > 0) {
            const baseStation = this.draggedHandle.isStart ? line.stations[0] : line.stations[line.stations.length - 1];
            
            const angle = Math.atan2(y - baseStation.y, x - baseStation.x);
            const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
            
            const distance = Math.hypot(x - baseStation.x, y - baseStation.y);
            
            const tempEndpoint = {
                x: baseStation.x + Math.cos(snappedAngle) * distance,
                y: baseStation.y + Math.sin(snappedAngle) * distance
            };
            
            this.draggedHandle.tempEndpoint = tempEndpoint;
        }
    }
    
    recalculateLineSegments(line) {
        line.segments = [];
        
        for (let i = 0; i < line.stations.length - 1; i++) {
            const from = line.stations[i];
            const to = line.stations[i + 1];
            
            const angle = Math.atan2(to.y - from.y, to.x - from.x);
            const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
            
            const distance = Math.hypot(to.x - from.x, to.y - from.y);
            
            const adjustedTo = {
                x: from.x + Math.cos(snappedAngle) * distance,
                y: from.y + Math.sin(snappedAngle) * distance
            };
            
            line.segments.push({
                from: from,
                to: adjustedTo,
                angle: snappedAngle
            });
        }
    }
    
    addTrainToLine(line) {
        if (this.availableTrains > 0) {
            const train = {
                id: this.trains.length,
                line: line,
                position: 0,
                currentSegment: 0,
                direction: 1,
                speed: 0.5,
                capacity: 6,
                passengers: [],
                carriages: 0,
                state: 'moving',
                stationStopTime: 0
            };
            
            this.trains.push(train);
            line.trains.push(train);
            this.availableTrains--;
        }
    }
    
    spawnPassenger() {
        if (this.stations.length < 2) return;
        
        const station = this.stations[Math.floor(Math.random() * this.stations.length)];
        
        let targetShapes = this.stations
            .filter(s => s !== station)
            .map(s => s.shape);
        
        if (targetShapes.length > 0) {
            const targetShape = targetShapes[Math.floor(Math.random() * targetShapes.length)];
            
            const passenger = {
                id: this.passengers.length,
                station: station,
                targetShape: targetShape,
                waitTime: 0
            };
            
            station.passengers.push(passenger);
            this.passengers.push(passenger);
        }
    }
    
    updateTrains(deltaTime) {
        for (let train of this.trains) {
            if (train.state === 'stopped') {
                train.stationStopTime -= deltaTime;
                
                if (train.stationStopTime <= 0) {
                    train.state = 'moving';
                    this.unloadPassengers(train);
                    this.loadPassengers(train);
                }
            } else if (train.state === 'moving') {
                const line = train.line;
                if (line.segments.length === 0) continue;
                
                const segment = line.segments[train.currentSegment];
                if (!segment) continue;
                
                const segmentLength = Math.hypot(
                    segment.to.x - segment.from.x,
                    segment.to.y - segment.from.y
                );
                
                train.position += train.speed * deltaTime / segmentLength;
                
                if (train.position >= 1) {
                    train.position = 0;
                    
                    const currentStation = line.stations[train.currentSegment + 1];
                    if (currentStation) {
                        train.state = 'stopped';
                        train.stationStopTime = currentStation.isInterchange ? 400 : 700;
                    }
                    
                    if (train.direction === 1) {
                        train.currentSegment++;
                        if (train.currentSegment >= line.segments.length) {
                            train.currentSegment = line.segments.length - 1;
                            train.direction = -1;
                        }
                    } else {
                        train.currentSegment--;
                        if (train.currentSegment < 0) {
                            train.currentSegment = 0;
                            train.direction = 1;
                        }
                    }
                }
            }
        }
    }
    
    loadPassengers(train) {
        const line = train.line;
        const stationIndex = train.direction === 1 ? train.currentSegment + 1 : train.currentSegment;
        const station = line.stations[stationIndex];
        
        if (!station) return;
        
        let availableSpace = train.capacity + (train.carriages * 4) - train.passengers.length;
        
        for (let i = station.passengers.length - 1; i >= 0 && availableSpace > 0; i--) {
            const passenger = station.passengers[i];
            
            const canReachTarget = this.canReachShape(line, station, passenger.targetShape);
            
            if (canReachTarget) {
                // Add loading animation time
                passenger.boardingAnimation = true;
                station.passengers.splice(i, 1);
                train.passengers.push(passenger);
                availableSpace--;
            }
        }
    }
    
    unloadPassengers(train) {
        const line = train.line;
        const stationIndex = train.direction === 1 ? train.currentSegment + 1 : train.currentSegment;
        const station = line.stations[stationIndex];
        
        if (!station) return;
        
        for (let i = train.passengers.length - 1; i >= 0; i--) {
            const passenger = train.passengers[i];
            
            if (passenger.targetShape === station.shape) {
                train.passengers.splice(i, 1);
                this.score++;
                this.updateScore();
                
                const index = this.passengers.indexOf(passenger);
                if (index > -1) {
                    this.passengers.splice(index, 1);
                }
            }
        }
    }
    
    canReachShape(line, fromStation, targetShape) {
        for (let station of line.stations) {
            if (station.shape === targetShape) {
                return true;
            }
        }
        return false;
    }
    
    updatePassengers(deltaTime) {
        for (let station of this.stations) {
            if (station.passengers.length > station.capacity) {
                station.overcrowding += deltaTime;
                
                if (station.overcrowding >= station.maxOvercrowding && !this.gameOver) {
                    this.endGame();
                }
            } else {
                station.overcrowding = Math.max(0, station.overcrowding - deltaTime);
            }
            
            for (let passenger of station.passengers) {
                passenger.waitTime += deltaTime;
            }
        }
    }
    
    updateGameTime(deltaTime) {
        if (this.gameOver) return;
        if (this.paused || this.gameSpeed === 0) return;
        
        const adjustedDelta = deltaTime * this.gameSpeed;
        this.dayProgress += adjustedDelta;
        
        // Update time of day (24 hour cycle in game time)
        const hoursPerDay = 24;
        const hourProgress = (this.dayProgress / this.dayDuration) * hoursPerDay;
        this.timeOfDay = (6 + hourProgress) % 24; // Start at 6 AM
        
        if (this.dayProgress >= this.dayDuration) {
            this.dayProgress = 0;
            this.day++;
            
            if (this.day > 7) {
                this.day = 1;
                this.week++;
                this.showUpgradeModal();
            }
            
            this.updateWeekDisplay();
            this.updateClockDisplay();
        }
        
        // Spawn passengers more frequently based on time of day
        const spawnRate = this.getSpawnRateForTime();
        if (Math.random() < adjustedDelta * spawnRate / 1000) {
            this.spawnPassenger();
        }
    }
    
    getSpawnRateForTime() {
        // Rush hours: 7-9 AM and 5-7 PM
        const hour = Math.floor(this.timeOfDay);
        if ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 19)) {
            return 2.0; // Double spawn rate during rush hours
        }
        // Night time: lower spawn rate
        if (hour < 6 || hour >= 22) {
            return 0.5;
        }
        return 1.0;
    }
    
    updateClockDisplay() {
        const hours = Math.floor(this.timeOfDay);
        const minutes = Math.floor((this.timeOfDay - hours) * 60);
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        document.getElementById('clock-time').textContent = timeString;
        document.getElementById('day-name').textContent = this.dayNames[this.day % 7];
    }
    
    showUpgradeModal() {
        this.paused = true;
        const modal = document.getElementById('upgrade-modal');
        const optionsContainer = document.getElementById('upgrade-options');
        
        optionsContainer.innerHTML = '';
        
        const availableUpgrades = [...this.upgrades];
        const selectedUpgrades = [];
        
        for (let i = 0; i < 2; i++) {
            const index = Math.floor(Math.random() * availableUpgrades.length);
            selectedUpgrades.push(availableUpgrades.splice(index, 1)[0]);
        }
        
        selectedUpgrades.forEach(upgrade => {
            const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.innerHTML = `
                <div class="upgrade-icon">${upgrade.icon}</div>
                <div class="upgrade-name">${upgrade.name}</div>
            `;
            
            card.onclick = () => this.selectUpgrade(upgrade);
            optionsContainer.appendChild(card);
        });
        
        modal.classList.add('active');
    }
    
    selectUpgrade(upgrade) {
        switch(upgrade.type) {
            case 'line':
                this.availableLines++;
                if (this.lines.length < this.lineColors.length) {
                    this.createInitialLines();
                }
                break;
            case 'train':
                this.availableTrains++;
                break;
            case 'carriage':
                this.availableCarriages++;
                break;
            case 'bridge':
                this.availableBridges++;
                break;
            case 'interchange':
                this.availableInterchanges++;
                break;
        }
        
        document.getElementById('upgrade-modal').classList.remove('active');
        this.paused = false;
    }
    
    render() {
        const colors = this.nightMode ? this.colors.night : this.colors.day;
        
        // Clear canvas with background color
        this.ctx.fillStyle = colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Enable antialiasing for smoother lines
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        this.renderWater();
        
        this.renderLines();
        
        this.renderStations();
        
        this.renderTrains();
        
        this.renderPassengers();
        
        if (this.draggedHandle && this.draggedHandle.tempEndpoint) {
            const line = this.draggedHandle.line;
            const baseStation = this.draggedHandle.isStart ? 
                line.stations[0] : line.stations[line.stations.length - 1];
            
            this.ctx.strokeStyle = line.color;
            this.ctx.lineWidth = this.designTokens.wl;
            this.ctx.lineCap = 'round';
            this.ctx.setLineDash([10, 5]);
            
            this.ctx.beginPath();
            this.ctx.moveTo(baseStation.x, baseStation.y);
            this.ctx.lineTo(this.draggedHandle.tempEndpoint.x, this.draggedHandle.tempEndpoint.y);
            this.ctx.stroke();
            
            this.ctx.setLineDash([]);
        }
    }
    
    renderWater() {
        const cityConfig = this.cityConfigs[this.currentCity];
        if (!cityConfig || !cityConfig.water) return;
        
        this.ctx.fillStyle = this.colors.day.water;
        this.ctx.strokeStyle = this.colors.day.water;
        
        for (let water of cityConfig.water) {
            if (water.type === 'river') {
                // Draw river as thick curved line
                this.ctx.lineWidth = water.width;
                this.ctx.lineCap = 'round';
                this.ctx.lineJoin = 'round';
                this.ctx.beginPath();
                
                for (let i = 0; i < water.points.length; i++) {
                    const p = water.points[i];
                    const x = p.x * this.canvas.width;
                    const y = p.y * this.canvas.height;
                    
                    if (i === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        // Use quadratic curves for smoother rivers
                        if (i < water.points.length - 1) {
                            const nextP = water.points[i + 1];
                            const cpX = x;
                            const cpY = y;
                            const nextX = nextP.x * this.canvas.width;
                            const nextY = nextP.y * this.canvas.height;
                            
                            this.ctx.quadraticCurveTo(cpX, cpY, (x + nextX) / 2, (y + nextY) / 2);
                        } else {
                            this.ctx.lineTo(x, y);
                        }
                    }
                }
                this.ctx.stroke();
                
            } else if (water.type === 'island') {
                // Draw island as filled rectangle (actually land surrounded by water)
                const x = (water.x - water.w/2) * this.canvas.width;
                const y = (water.y - water.h/2) * this.canvas.height;
                const w = water.w * this.canvas.width;
                const h = water.h * this.canvas.height;
                
                // Draw water around island (simplified)
                this.ctx.fillRect(x - 20, y - 20, w + 40, h + 40);
            }
        }
    }
    
    renderLines() {
        for (let line of this.lines) {
            if (line.segments.length === 0) continue;
            
            this.ctx.strokeStyle = line.color;
            this.ctx.lineWidth = this.designTokens.wl;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            this.ctx.beginPath();
            
            for (let i = 0; i < line.segments.length; i++) {
                const segment = line.segments[i];
                
                if (i === 0) {
                    this.ctx.moveTo(segment.from.x, segment.from.y);
                }
                
                if (i < line.segments.length - 1) {
                    const nextSegment = line.segments[i + 1];
                    
                    // Calculate angle difference for smooth curves
                    const angle1 = segment.angle;
                    const angle2 = nextSegment.angle;
                    const angleDiff = Math.abs(angle2 - angle1);
                    
                    if (angleDiff > 0.01 && angleDiff < Math.PI - 0.01) {
                        // Create smooth curve at junction
                        const curveRadius = this.designTokens.re;
                        const midX = segment.to.x;
                        const midY = segment.to.y;
                        
                        // Calculate control points for smooth bezier curve
                        const dist = curveRadius * 0.5;
                        const cp1x = midX - Math.cos(angle1) * dist;
                        const cp1y = midY - Math.sin(angle1) * dist;
                        const cp2x = midX + Math.cos(angle2) * dist;
                        const cp2y = midY + Math.sin(angle2) * dist;
                        
                        // Draw to curve start point
                        const curveStartX = midX - Math.cos(angle1) * curveRadius;
                        const curveStartY = midY - Math.sin(angle1) * curveRadius;
                        this.ctx.lineTo(curveStartX, curveStartY);
                        
                        // Draw curve
                        const curveEndX = midX + Math.cos(angle2) * curveRadius;
                        const curveEndY = midY + Math.sin(angle2) * curveRadius;
                        this.ctx.quadraticCurveTo(midX, midY, curveEndX, curveEndY);
                        
                        // Continue to next segment
                        if (i === line.segments.length - 2) {
                            this.ctx.lineTo(nextSegment.to.x, nextSegment.to.y);
                        }
                    } else {
                        // Straight connection for aligned segments
                        this.ctx.lineTo(segment.to.x, segment.to.y);
                        if (i === line.segments.length - 2) {
                            this.ctx.lineTo(nextSegment.to.x, nextSegment.to.y);
                        }
                    }
                } else {
                    this.ctx.lineTo(segment.to.x, segment.to.y);
                }
            }
            
            this.ctx.stroke();
        }
    }
    
    renderStations() {
        const colors = this.nightMode ? this.colors.night : this.colors.day;
        
        for (let station of this.stations) {
            this.ctx.save();
            this.ctx.translate(station.x, station.y);
            
            // Highlight hovered station
            if (this.hoveredStation === station) {
                this.ctx.shadowColor = '#80C3FF';
                this.ctx.shadowBlur = 20;
            }
            
            this.ctx.fillStyle = colors.stationFill;
            this.ctx.strokeStyle = colors.stationStroke;
            this.ctx.lineWidth = this.designTokens.ws;
            
            this.drawStationShape(station.shape, this.designTokens.Ro);
            
            if (station.isInterchange) {
                this.ctx.strokeStyle = colors.stationStroke;
                this.ctx.lineWidth = this.designTokens.wi;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, this.designTokens.Ro + this.designTokens.ai + this.designTokens.wi/2, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            
            if (station.overcrowding > 0) {
                const progress = station.overcrowding / station.maxOvercrowding;
                this.ctx.strokeStyle = '#DD2515';
                this.ctx.lineWidth = this.designTokens.wc;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, this.designTokens.Ro + 12, -Math.PI/2, -Math.PI/2 + Math.PI * 2 * progress);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        }
    }
    
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
                this.ctx.roundRect(-size, -size, size * 2, size * 2, 2);
                break;
                
            case 'diamond':
                this.ctx.save();
                this.ctx.rotate(Math.PI / 4);
                this.ctx.roundRect(-size * 0.7, -size * 0.7, size * 1.4, size * 1.4, 2);
                this.ctx.restore();
                break;
                
            case 'cross':
                const arm = size / 3;
                this.ctx.moveTo(-arm, -size);
                this.ctx.lineTo(arm, -size);
                this.ctx.lineTo(arm, -arm);
                this.ctx.lineTo(size, -arm);
                this.ctx.lineTo(size, arm);
                this.ctx.lineTo(arm, arm);
                this.ctx.lineTo(arm, size);
                this.ctx.lineTo(-arm, size);
                this.ctx.lineTo(-arm, arm);
                this.ctx.lineTo(-size, arm);
                this.ctx.lineTo(-size, -arm);
                this.ctx.lineTo(-arm, -arm);
                this.ctx.closePath();
                break;
                
            case 'star':
                const spikes = 5;
                const outerRadius = size;
                const innerRadius = size * 0.4; // Sharper star
                
                for (let i = 0; i < spikes * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = (i * Math.PI) / spikes - Math.PI / 2;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    if (i === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
                this.ctx.closePath();
                break;
                
            case 'pentagon':
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                    const x = Math.cos(angle) * size;
                    const y = Math.sin(angle) * size;
                    
                    if (i === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
                this.ctx.closePath();
                break;
                
            case 'teardrop':
                this.ctx.arc(0, size * 0.3, size * 0.7, 0, Math.PI * 2);
                this.ctx.moveTo(-size * 0.7, size * 0.3);
                this.ctx.quadraticCurveTo(0, -size * 1.2, size * 0.7, size * 0.3);
                break;
                
            case 'oval':
                this.ctx.ellipse(0, 0, size * 1.3, size * 0.8, 0, 0, Math.PI * 2);
                break;
                
            case 'fan':
                // Fan shape - like a quarter circle with lines
                const fanAngle = Math.PI / 2;
                const fanRadius = size;
                
                this.ctx.moveTo(0, 0);
                this.ctx.arc(0, 0, fanRadius, -fanAngle/2, fanAngle/2);
                this.ctx.closePath();
                
                // Add fan lines
                this.ctx.fill();
                this.ctx.stroke();
                
                // Draw radial lines
                const lines = 3;
                for (let i = 1; i < lines; i++) {
                    const angle = -fanAngle/2 + (fanAngle * i / lines);
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, 0);
                    this.ctx.lineTo(Math.cos(angle) * fanRadius * 0.8, Math.sin(angle) * fanRadius * 0.8);
                    this.ctx.stroke();
                }
                return; // Early return since we already drew it
        }
        
        this.ctx.fill();
        this.ctx.stroke();
    }
    
    renderTrains() {
        const colors = this.nightMode ? this.colors.night : this.colors.day;
        
        for (let train of this.trains) {
            const line = train.line;
            if (line.segments.length === 0) continue;
            
            const segment = line.segments[train.currentSegment];
            if (!segment) continue;
            
            const x = segment.from.x + (segment.to.x - segment.from.x) * train.position;
            const y = segment.from.y + (segment.to.y - segment.from.y) * train.position;
            
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(segment.angle);
            
            this.ctx.fillStyle = colors.stationStroke;
            this.ctx.strokeStyle = line.color;
            this.ctx.lineWidth = 2;
            
            const trainLength = 40;
            const trainHeight = 12;
            
            this.ctx.beginPath();
            this.ctx.roundRect(-trainLength/2, -trainHeight/2, trainLength, trainHeight, trainHeight/2);
            this.ctx.fill();
            this.ctx.stroke();
            
            for (let i = 0; i < train.carriages; i++) {
                const carriageLength = 24;
                const gap = 2;
                const xOffset = -trainLength/2 - (carriageLength + gap) * (i + 1);
                
                this.ctx.beginPath();
                this.ctx.roundRect(xOffset, -trainHeight/2, carriageLength, trainHeight, trainHeight/2);
                this.ctx.fill();
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        }
    }
    
    renderPassengers() {
        const colors = this.nightMode ? this.colors.night : this.colors.day;
        
        for (let station of this.stations) {
            // Show capacity indicators
            if (station.passengers.length > 0) {
                const capacityRatio = station.passengers.length / station.capacity;
                if (capacityRatio >= 0.5 && capacityRatio < 1) {
                    // Draw subtle warning indicator
                    this.ctx.save();
                    this.ctx.globalAlpha = 0.3;
                    this.ctx.strokeStyle = '#F0AB00';
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.arc(station.x, station.y, this.designTokens.Ro + 8, 0, Math.PI * 2);
                    this.ctx.stroke();
                    this.ctx.restore();
                }
            }
            
            const angleStep = (Math.PI * 2) / Math.max(6, station.passengers.length);
            
            for (let i = 0; i < station.passengers.length; i++) {
                const passenger = station.passengers[i];
                const angle = i * angleStep - Math.PI / 2; // Start from top
                const radius = this.designTokens.Ro + 15;
                
                // Subtle animation based on wait time
                const wobble = Math.sin(passenger.waitTime * 0.002) * 2;
                
                const x = station.x + Math.cos(angle) * (radius + wobble);
                const y = station.y + Math.sin(angle) * (radius + wobble);
                
                this.ctx.save();
                this.ctx.translate(x, y);
                
                // Fade in animation for new passengers
                const fadeInDuration = 300;
                const alpha = Math.min(1, passenger.waitTime / fadeInDuration);
                this.ctx.globalAlpha = alpha;
                
                this.ctx.fillStyle = colors.passenger;
                this.ctx.scale(0.4, 0.4);
                this.drawPassengerShape(passenger.targetShape);
                
                this.ctx.restore();
            }
        }
    }
    
    drawPassengerShape(shape) {
        const size = this.designTokens.sp;
        
        switch(shape) {
            case 'circle':
                this.ctx.beginPath();
                this.ctx.arc(0, 0, size, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case 'triangle':
                this.ctx.beginPath();
                const h = size * Math.sqrt(3);
                this.ctx.moveTo(0, -size);
                this.ctx.lineTo(-size, h/2);
                this.ctx.lineTo(size, h/2);
                this.ctx.closePath();
                this.ctx.fill();
                break;
                
            case 'square':
                this.ctx.fillRect(-size, -size, size * 2, size * 2);
                break;
                
            case 'diamond':
                this.ctx.save();
                this.ctx.rotate(Math.PI / 4);
                this.ctx.fillRect(-size * 0.7, -size * 0.7, size * 1.4, size * 1.4);
                this.ctx.restore();
                break;
                
            case 'cross':
                const arm = size / 3;
                this.ctx.beginPath();
                this.ctx.moveTo(-arm, -size);
                this.ctx.lineTo(arm, -size);
                this.ctx.lineTo(arm, -arm);
                this.ctx.lineTo(size, -arm);
                this.ctx.lineTo(size, arm);
                this.ctx.lineTo(arm, arm);
                this.ctx.lineTo(arm, size);
                this.ctx.lineTo(-arm, size);
                this.ctx.lineTo(-arm, arm);
                this.ctx.lineTo(-size, arm);
                this.ctx.lineTo(-size, -arm);
                this.ctx.lineTo(-arm, -arm);
                this.ctx.closePath();
                this.ctx.fill();
                break;
                
            case 'star':
                this.ctx.beginPath();
                const spikes = 5;
                const outerRadius = size;
                const innerRadius = size * 0.4; // Match station star
                
                for (let i = 0; i < spikes * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = (i * Math.PI) / spikes - Math.PI / 2;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    if (i === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
                this.ctx.closePath();
                this.ctx.fill();
                break;
                
            case 'pentagon':
                this.ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                    const x = Math.cos(angle) * size;
                    const y = Math.sin(angle) * size;
                    
                    if (i === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
                this.ctx.closePath();
                this.ctx.fill();
                break;
                
            case 'teardrop':
                this.ctx.beginPath();
                this.ctx.arc(0, size * 0.3, size * 0.7, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.moveTo(-size * 0.5, 0);
                this.ctx.quadraticCurveTo(0, -size, size * 0.5, 0);
                this.ctx.fill();
                break;
                
            case 'oval':
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, size * 1.3, size * 0.8, 0, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case 'fan':
                // Filled fan shape for passenger
                const fanAngle = Math.PI / 2;
                const fanRadius = size;
                
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.arc(0, 0, fanRadius, -fanAngle/2, fanAngle/2);
                this.ctx.closePath();
                this.ctx.fill();
                break;
        }
    }
    
    updateScore() {
        document.getElementById('score-value').textContent = this.score;
    }
    
    updateWeekDisplay() {
        document.getElementById('week-value').textContent = this.week;
        this.updateClockDisplay();
    }
    
    togglePause() {
        this.paused = !this.paused;
        const btn = document.getElementById('pause-btn');
        if (this.paused) {
            btn.classList.add('paused');
        } else {
            btn.classList.remove('paused');
        }
    }
    
    cycleSpeed() {
        if (this.gameSpeed === 1) {
            this.gameSpeed = 2;
        } else if (this.gameSpeed === 2) {
            this.gameSpeed = 0;
        } else {
            this.gameSpeed = 1;
        }
        
        document.getElementById('speed-display').textContent = 
            this.gameSpeed === 0 ? '||' : `${this.gameSpeed}×`;
            
        // Update pause button if speed is 0
        const pauseBtn = document.getElementById('pause-btn');
        if (this.gameSpeed === 0) {
            pauseBtn.classList.add('paused');
            this.paused = true;
        } else {
            pauseBtn.classList.remove('paused');
            this.paused = false;
        }
    }
    
    toggleNightMode() {
        this.nightMode = !this.nightMode;
        document.body.classList.toggle('night-mode');
    }
    
    endGame() {
        this.gameOver = true;
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over').style.display = 'block';
    }
    
    restart() {
        this.stations = [];
        this.lines = [];
        this.trains = [];
        this.passengers = [];
        
        this.score = 0;
        this.week = 1;
        this.day = 1;
        this.dayProgress = 0;
        this.timeOfDay = 6;
        
        this.availableLines = 3;
        this.availableTrains = 3;
        this.availableCarriages = 0;
        this.availableBridges = 0;
        this.availableInterchanges = 0;
        
        this.gameOver = false;
        this.paused = false;
        this.endlessMode = false;
        this.extremeMode = false;
        this.creativeMode = false;
        
        document.getElementById('game-over').style.display = 'none';
        
        const upgradeModal = document.getElementById('upgrade-modal');
        if (upgradeModal) {
            upgradeModal.style.display = 'none';
            upgradeModal.classList.remove('active');
        }
        
        this.updateScore();
        this.updateWeekDisplay();
        this.updateClockDisplay();
        
        this.generateInitialStations();
        this.createInitialLines();
        this.needsRedraw = true;
    }
    
    initializeCity(city, mode) {
        this.currentCity = city || 'london';
        this.currentMode = mode || 'normal';
        
        // Apply mode rules
        if (mode === 'endless') {
            this.endlessMode = true;
        } else if (mode === 'extreme') {
            this.extremeMode = true;
        } else if (mode === 'creative') {
            this.creativeMode = true;
            this.availableLines = 10;
            this.availableTrains = 20;
            this.availableCarriages = 50;
            this.availableBridges = 20;
            this.availableInterchanges = 10;
        }
        
        this.restart();
    }
    
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        if (!this.paused && !this.gameOver && deltaTime < 100) {
            this.updateGameTime(deltaTime);
            this.updateTrains(deltaTime);
            this.updatePassengers(deltaTime);
        }
        
        // Optimize rendering - only render when not paused or when something changed
        if (!this.paused || this.needsRedraw) {
            this.render();
            this.needsRedraw = false;
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

const game = new MiniMetro();
window.game = game;