// Mobile touch support extension for Mini Metro game

function addMobileSupport(game) {
    // Store original event setup
    const originalSetup = game.setupEventListeners.bind(game);
    
    // Enhanced event listeners with touch support
    game.setupEventListeners = function() {
        // Call original mouse events
        originalSetup();
        
        // Add touch events
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), {passive: false});
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), {passive: false});
        this.canvas.addEventListener('touchend', (e) => this.onTouchEnd(e), {passive: false});
        
        // Prevent default touch behaviors
        this.canvas.style.touchAction = 'none';
        this.canvas.style.webkitUserSelect = 'none';
        this.canvas.style.userSelect = 'none';
        
        // Track touch state
        this.touchStartTime = 0;
        this.touchStartPos = null;
        this.isTouchDevice = 'ontouchstart' in window;
    };
    
    // Touch start handler
    game.onTouchStart = function(e) {
        e.preventDefault();
        if (this.paused || this.gameOver) return;
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Store for long press detection (delete line)
        this.touchStartTime = Date.now();
        this.touchStartPos = {x, y};
        
        const station = this.getStationAt(x, y);
        
        if (station) {
            // Check if extending existing line
            const existingLine = this.lines.find(l => 
                l.stations.length > 0 && 
                l.stations[l.stations.length - 1] === station
            );
            
            if (existingLine) {
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
        }
    };
    
    // Touch move handler
    game.onTouchMove = function(e) {
        e.preventDefault();
        if (this.paused || this.gameOver) return;
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Cancel long press if moved too much
        if (this.touchStartPos) {
            const dx = Math.abs(x - this.touchStartPos.x);
            const dy = Math.abs(y - this.touchStartPos.y);
            if (dx > 10 || dy > 10) {
                this.touchStartTime = 0;
            }
        }
        
        // Update temporary line end
        if (this.drawingLine && this.selectedStation) {
            this.tempLineEnd = {x, y};
        }
    };
    
    // Touch end handler  
    game.onTouchEnd = function(e) {
        e.preventDefault();
        
        // Check for long press (delete line)
        const isLongPress = this.touchStartTime && 
                          Date.now() - this.touchStartTime > 500 && 
                          this.touchStartPos;
        
        if (isLongPress) {
            // Delete line at touch position
            this.handleRightClick(this.touchStartPos.x, this.touchStartPos.y);
        } else if (this.drawingLine && this.selectedStation && e.changedTouches.length > 0) {
            // Complete line drawing
            const touch = e.changedTouches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            const station = this.getStationAt(x, y);
            
            if (station && station !== this.selectedStation && !this.drawingLine.stations.includes(station)) {
                // Check for bridge requirement
                const lastStation = this.drawingLine.stations[this.drawingLine.stations.length - 1];
                const needsBridge = this.crossesWater && this.crossesWater(lastStation.x, lastStation.y, station.x, station.y);
                
                if (needsBridge && this.availableBridges <= 0) {
                    this.showNoBridgeWarning && this.showNoBridgeWarning();
                } else {
                    if (needsBridge && this.availableBridges > 0) {
                        this.availableBridges--;
                        this.drawingLine.bridges = this.drawingLine.bridges || [];
                        this.drawingLine.bridges.push({
                            from: lastStation,
                            to: station
                        });
                    }
                    
                    this.drawingLine.stations.push(station);
                    
                    // Recalculate line segments if method exists
                    if (this.recalculateLineSegments) {
                        this.recalculateLineSegments(this.drawingLine);
                    }
                    
                    // Add train if needed
                    if (this.drawingLine.stations.length >= 2 && this.drawingLine.trains && this.drawingLine.trains.length === 0) {
                        if (this.addTrainToLine) {
                            this.addTrainToLine(this.drawingLine);
                        }
                    }
                }
            }
        }
        
        // Reset state
        this.drawingLine = null;
        this.selectedStation = null;
        this.tempLineEnd = null;
        this.touchStartTime = 0;
        this.touchStartPos = null;
    };
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = addMobileSupport;
}