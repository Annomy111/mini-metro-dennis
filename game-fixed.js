class MiniMetro {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        
        // Design tokens
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
        
        // Color schemes
        this.colors = {
            day: {
                background: '#F4F4F4',
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
        
        // City configurations with realistic water
        this.cityConfigs = {
            london: {
                name: 'London',
                water: {
                    type: 'river',
                    name: 'Thames',
                    path: [
                        {x: 0, y: 0.6},
                        {x: 0.2, y: 0.58},
                        {x: 0.4, y: 0.62},
                        {x: 0.5, y: 0.65},
                        {x: 0.6, y: 0.62},
                        {x: 0.8, y: 0.58},
                        {x: 1, y: 0.6}
                    ],
                    width: 80
                },
                color: '#DD2515'
            },
            paris: {
                name: 'Paris',
                water: {
                    type: 'river',
                    name: 'Seine',
                    path: [
                        {x: 0, y: 0.5},
                        {x: 0.3, y: 0.48},
                        {x: 0.5, y: 0.52},
                        {x: 0.7, y: 0.5},
                        {x: 1, y: 0.48}
                    ],
                    width: 60,
                    islands: [{x: 0.5, y: 0.5, w: 80, h: 40}]
                },
                color: '#2581C4'
            },
            newyork: {
                name: 'New York',
                water: {
                    type: 'rivers',
                    rivers: [
                        {
                            name: 'Hudson',
                            path: [{x: 0.3, y: 0}, {x: 0.3, y: 1}],
                            width: 50
                        },
                        {
                            name: 'East River',
                            path: [{x: 0.7, y: 0}, {x: 0.7, y: 1}],
                            width: 50
                        }
                    ],
                    islands: [{x: 0.5, y: 0.5, w: 0.35, h: 0.8, name: 'Manhattan'}]
                },
                color: '#F0AB00'
            }
        };
        
        // Game state
        this.nightMode = false;
        this.paused = false;
        this.gameOver = false;
        this.gameSpeed = 1;
        
        this.currentCity = 'london';
        this.currentMode = 'normal';
        
        this.stations = [];
        this.lines = [];
        this.trains = [];
        this.passengers = [];
        
        this.score = 0;
        this.week = 1;
        this.day = 1;
        this.dayProgress = 0;
        this.dayDuration = 20000;
        this.timeOfDay = 6;
        
        // Interaction state
        this.hoveredStation = null;
        this.selectedStation = null;
        this.drawingLine = null;
        this.draggedEndpoint = null;
        
        // Station shapes
        this.stationShapes = ['circle', 'triangle', 'square'];
        this.rareShapes = ['diamond', 'cross', 'star', 'pentagon', 'fan'];
        
        // Resources
        this.availableLines = 3;
        this.availableTrains = 3;
        this.availableCarriages = 0;
        this.availableBridges = 0;
        this.availableInterchanges = 0;
        
        this.lastFrameTime = 0;
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
        this.gameLoop(0);
    }
    
    generateInitialStations() {
        const minDistance = 150;
        const stationCount = 6;
        
        // Clear existing stations
        this.stations = [];
        
        // Generate stations avoiding water
        for (let i = 0; i < stationCount; i++) {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 100) {
                const x = Math.random() * (this.canvas.width - 200) + 100;
                const y = Math.random() * (this.canvas.height - 200) + 100;
                
                // Check if position is valid
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
        
        const water = cityConfig.water;
        
        if (water.type === 'river' && water.path) {
            // Check distance from river path
            for (let i = 0; i < water.path.length - 1; i++) {
                const p1 = water.path[i];
                const p2 = water.path[i + 1];
                const dist = this.distanceToLineSegment(relX, relY, p1.x, p1.y, p2.x, p2.y);
                if (dist * this.canvas.width < water.width / 2) {
                    return true;
                }
            }
        } else if (water.type === 'rivers' && water.rivers) {
            // Check multiple rivers
            for (let river of water.rivers) {
                for (let i = 0; i < river.path.length - 1; i++) {
                    const p1 = river.path[i];
                    const p2 = river.path[i + 1];
                    const dist = this.distanceToLineSegment(relX, relY, p1.x, p1.y, p2.x, p2.y);
                    if (dist * this.canvas.width < river.width / 2) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
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
    
    isValidStationPosition(x, y, minDistance) {
        for (let station of this.stations) {
            const dist = Math.hypot(station.x - x, station.y - y);
            if (dist < minDistance) {
                return false;
            }
        }
        return true;
    }
    
    createInitialLines() {
        this.lines = [];
        for (let i = 0; i < this.availableLines; i++) {
            this.lines.push({
                id: i,
                color: this.lineColors[i],
                stations: [],
                segments: [],
                trains: []
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
        
        if (e.button === 0) { // Left click
            if (station) {
                // Check if we're on a line endpoint
                for (let line of this.lines) {
                    if (line.stations.length > 0) {
                        const firstStation = line.stations[0];
                        const lastStation = line.stations[line.stations.length - 1];
                        
                        if (station === lastStation) {
                            // Start extending from end
                            this.drawingLine = line;
                            this.selectedStation = station;
                            this.draggedEndpoint = 'end';
                            return;
                        } else if (station === firstStation) {
                            // Start extending from beginning
                            this.drawingLine = line;
                            this.selectedStation = station;
                            this.draggedEndpoint = 'start';
                            return;
                        }
                    }
                }
                
                // Start new line
                const emptyLine = this.lines.find(l => l.stations.length === 0);
                if (emptyLine) {
                    this.drawingLine = emptyLine;
                    this.selectedStation = station;
                    emptyLine.stations = [station];
                    this.draggedEndpoint = 'end';
                }
            }
        } else if (e.button === 2) { // Right click
            if (station) {
                // Remove station from line
                for (let line of this.lines) {
                    const index = line.stations.indexOf(station);
                    if (index !== -1) {
                        if (index === 0 || index === line.stations.length - 1) {
                            // Remove from end
                            if (index === 0) {
                                line.stations.shift();
                            } else {
                                line.stations.pop();
                            }
                        } else {
                            // Remove everything after this station
                            line.stations = line.stations.slice(0, index);
                        }
                        this.recalculateLineSegments(line);
                        
                        // Remove trains if line too short
                        if (line.stations.length < 2) {
                            line.trains = [];
                        }
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
        
        if (this.drawingLine && this.selectedStation) {
            // Update temporary endpoint for drawing
            this.tempMouseX = x;
            this.tempMouseY = y;
        }
    }
    
    onMouseUp(e) {
        if (!this.drawingLine) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const station = this.getStationAt(x, y);
        
        if (station && station !== this.selectedStation) {
            // Check if station not already in line
            if (!this.drawingLine.stations.includes(station)) {
                if (this.draggedEndpoint === 'end') {
                    this.drawingLine.stations.push(station);
                } else {
                    this.drawingLine.stations.unshift(station);
                }
                this.recalculateLineSegments(this.drawingLine);
                
                // Add train if line has 2+ stations
                if (this.drawingLine.stations.length >= 2 && this.drawingLine.trains.length === 0) {
                    this.addTrainToLine(this.drawingLine);
                }
            }
        } else {
            // If not connecting to station, remove incomplete line
            if (this.drawingLine.stations.length === 1) {
                this.drawingLine.stations = [];
                this.drawingLine.segments = [];
            }
        }
        
        // Clear drawing state
        this.drawingLine = null;
        this.selectedStation = null;
        this.draggedEndpoint = null;
        this.tempMouseX = null;
        this.tempMouseY = null;
    }
    
    getStationAt(x, y) {
        for (let station of this.stations) {
            const dist = Math.hypot(station.x - x, station.y - y);
            if (dist < this.designTokens.Ro + 5) {
                return station;
            }
        }
        return null;
    }
    
    recalculateLineSegments(line) {
        line.segments = [];
        
        for (let i = 0; i < line.stations.length - 1; i++) {
            const from = line.stations[i];
            const to = line.stations[i + 1];
            
            line.segments.push({
                from: from,
                to: to,
                needsBridge: this.crossesWater(from.x, from.y, to.x, to.y)
            });
        }
    }
    
    crossesWater(x1, y1, x2, y2) {
        // Check if line segment crosses water
        const steps = 10;
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
    
    updateGameTime(deltaTime) {
        if (this.gameOver || this.paused) return;
        
        this.dayProgress += deltaTime * this.gameSpeed;
        
        // Update clock
        const hoursPerDay = 24;
        const hourProgress = (this.dayProgress / this.dayDuration) * hoursPerDay;
        this.timeOfDay = (6 + hourProgress) % 24;
        
        if (this.dayProgress >= this.dayDuration) {
            this.dayProgress = 0;
            this.day++;
            
            if (this.day > 7) {
                this.day = 1;
                this.week++;
                // Show upgrade modal
            }
            
            this.updateWeekDisplay();
            this.updateClockDisplay();
        }
        
        // Spawn passengers
        if (Math.random() < deltaTime / 1000) {
            this.spawnPassenger();
        }
    }
    
    updateClockDisplay() {
        const hours = Math.floor(this.timeOfDay);
        const minutes = Math.floor((this.timeOfDay - hours) * 60);
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        const clockElement = document.getElementById('clock-time');
        if (clockElement) {
            clockElement.textContent = timeString;
        }
        
        const dayElement = document.getElementById('day-name');
        if (dayElement) {
            const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
            dayElement.textContent = dayNames[this.day % 7];
        }
    }
    
    updateWeekDisplay() {
        const weekElement = document.getElementById('week-value');
        if (weekElement) {
            weekElement.textContent = this.week;
        }
    }
    
    updateScore() {
        const scoreElement = document.getElementById('score-value');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }
    
    render() {
        const colors = this.nightMode ? this.colors.night : this.colors.day;
        
        // Clear canvas
        this.ctx.fillStyle = colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render city water
        this.renderWater();
        
        // Render lines
        this.renderLines();
        
        // Render temporary line while drawing
        if (this.drawingLine && this.selectedStation && this.tempMouseX) {
            this.renderTempLine();
        }
        
        // Render stations
        this.renderStations();
        
        // Render trains
        this.renderTrains();
        
        // Render passengers
        this.renderPassengers();
    }
    
    renderWater() {
        const cityConfig = this.cityConfigs[this.currentCity];
        if (!cityConfig || !cityConfig.water) return;
        
        this.ctx.fillStyle = this.colors.day.water;
        this.ctx.strokeStyle = this.colors.day.water;
        
        const water = cityConfig.water;
        
        if (water.type === 'river' && water.path) {
            // Draw single river
            this.ctx.lineWidth = water.width;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.beginPath();
            
            for (let i = 0; i < water.path.length; i++) {
                const p = water.path[i];
                const x = p.x * this.canvas.width;
                const y = p.y * this.canvas.height;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.stroke();
            
            // Draw islands if any
            if (water.islands) {
                this.ctx.fillStyle = this.colors.day.background;
                for (let island of water.islands) {
                    const x = island.x * this.canvas.width - island.w / 2;
                    const y = island.y * this.canvas.height - island.h / 2;
                    this.ctx.fillRect(x, y, island.w, island.h);
                }
                this.ctx.fillStyle = this.colors.day.water;
            }
            
        } else if (water.type === 'rivers' && water.rivers) {
            // Draw multiple rivers
            for (let river of water.rivers) {
                this.ctx.lineWidth = river.width;
                this.ctx.beginPath();
                
                for (let i = 0; i < river.path.length; i++) {
                    const p = river.path[i];
                    const x = p.x * this.canvas.width;
                    const y = p.y * this.canvas.height;
                    
                    if (i === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
                this.ctx.stroke();
            }
        }
    }
    
    renderLines() {
        for (let line of this.lines) {
            if (line.stations.length < 2) continue;
            
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
    
    renderTempLine() {
        if (!this.drawingLine || !this.selectedStation || !this.tempMouseX) return;
        
        this.ctx.strokeStyle = this.drawingLine.color;
        this.ctx.lineWidth = this.designTokens.wl;
        this.ctx.lineCap = 'round';
        this.ctx.setLineDash([10, 5]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.selectedStation.x, this.selectedStation.y);
        
        // Snap to 45 degree angles
        const dx = this.tempMouseX - this.selectedStation.x;
        const dy = this.tempMouseY - this.selectedStation.y;
        const angle = Math.atan2(dy, dx);
        const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
        const distance = Math.hypot(dx, dy);
        
        const endX = this.selectedStation.x + Math.cos(snappedAngle) * distance;
        const endY = this.selectedStation.y + Math.sin(snappedAngle) * distance;
        
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    renderStations() {
        const colors = this.nightMode ? this.colors.night : this.colors.day;
        
        for (let station of this.stations) {
            this.ctx.save();
            this.ctx.translate(station.x, station.y);
            
            // Highlight hovered station
            if (this.hoveredStation === station) {
                this.ctx.shadowColor = '#80C3FF';
                this.ctx.shadowBlur = 15;
            }
            
            // Draw station shape
            this.ctx.fillStyle = colors.stationFill;
            this.ctx.strokeStyle = colors.stationStroke;
            this.ctx.lineWidth = this.designTokens.ws;
            
            this.drawStationShape(station.shape, this.designTokens.Ro);
            
            // Draw overcrowding indicator
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
                this.ctx.rect(-size, -size, size * 2, size * 2);
                break;
            case 'diamond':
                this.ctx.save();
                this.ctx.rotate(Math.PI / 4);
                this.ctx.rect(-size * 0.7, -size * 0.7, size * 1.4, size * 1.4);
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
                for (let i = 0; i < spikes * 2; i++) {
                    const radius = i % 2 === 0 ? size : size * 0.4;
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
            case 'fan':
                const fanAngle = Math.PI / 2;
                this.ctx.moveTo(0, 0);
                this.ctx.arc(0, 0, size, -fanAngle/2, fanAngle/2);
                this.ctx.closePath();
                break;
        }
        
        this.ctx.fill();
        this.ctx.stroke();
    }
    
    renderTrains() {
        const colors = this.nightMode ? this.colors.night : this.colors.day;
        
        for (let train of this.trains) {
            if (!train.line || train.line.stations.length < 2) continue;
            
            // Simple train rendering at current position
            const station1 = train.line.stations[Math.floor(train.position)];
            const station2 = train.line.stations[Math.ceil(train.position)] || station1;
            const t = train.position % 1;
            
            const x = station1.x + (station2.x - station1.x) * t;
            const y = station1.y + (station2.y - station1.y) * t;
            
            this.ctx.save();
            this.ctx.translate(x, y);
            
            // Train body
            this.ctx.fillStyle = colors.stationStroke;
            this.ctx.strokeStyle = train.line.color;
            this.ctx.lineWidth = 2;
            
            this.ctx.beginPath();
            this.ctx.rect(-20, -6, 40, 12);
            this.ctx.fill();
            this.ctx.stroke();
            
            this.ctx.restore();
        }
    }
    
    renderPassengers() {
        const colors = this.nightMode ? this.colors.night : this.colors.day;
        
        for (let station of this.stations) {
            if (station.passengers.length === 0) continue;
            
            // Draw passengers around station
            const angleStep = (Math.PI * 2) / Math.max(6, station.passengers.length);
            
            for (let i = 0; i < station.passengers.length; i++) {
                const passenger = station.passengers[i];
                const angle = i * angleStep - Math.PI / 2;
                const radius = this.designTokens.Ro + 15;
                
                const x = station.x + Math.cos(angle) * radius;
                const y = station.y + Math.sin(angle) * radius;
                
                this.ctx.save();
                this.ctx.translate(x, y);
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
            default:
                // Simplified for other shapes
                this.ctx.beginPath();
                this.ctx.arc(0, 0, size, 0, Math.PI * 2);
                this.ctx.fill();
                break;
        }
    }
    
    updateTrains(deltaTime) {
        for (let train of this.trains) {
            if (!train.line || train.line.stations.length < 2) continue;
            
            // Simple back and forth movement
            train.position += train.direction * train.speed * deltaTime / 1000;
            
            if (train.position >= train.line.stations.length - 1) {
                train.position = train.line.stations.length - 1;
                train.direction = -1;
            } else if (train.position <= 0) {
                train.position = 0;
                train.direction = 1;
            }
        }
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
        }
    }
    
    togglePause() {
        this.paused = !this.paused;
        const btn = document.getElementById('pause-btn');
        if (btn) {
            if (this.paused) {
                btn.classList.add('paused');
            } else {
                btn.classList.remove('paused');
            }
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
        
        const display = document.getElementById('speed-display');
        if (display) {
            display.textContent = this.gameSpeed === 0 ? '||' : `${this.gameSpeed}×`;
        }
    }
    
    toggleNightMode() {
        this.nightMode = !this.nightMode;
        document.body.classList.toggle('night-mode');
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
        
        this.gameOver = false;
        this.paused = false;
        
        this.generateInitialStations();
        this.createInitialLines();
        
        this.updateScore();
        this.updateWeekDisplay();
        this.updateClockDisplay();
        
        const gameOverEl = document.getElementById('game-over');
        if (gameOverEl) gameOverEl.style.display = 'none';
    }
    
    initializeCity(city, mode) {
        this.currentCity = city || 'london';
        this.currentMode = mode || 'normal';
        this.restart();
    }
    
    endGame() {
        this.gameOver = true;
        const gameOverEl = document.getElementById('game-over');
        if (gameOverEl) {
            gameOverEl.style.display = 'block';
            const finalScoreEl = document.getElementById('final-score');
            if (finalScoreEl) {
                finalScoreEl.textContent = this.score;
            }
        }
    }
    
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

// Initialize game
const game = new MiniMetro();
window.game = game;