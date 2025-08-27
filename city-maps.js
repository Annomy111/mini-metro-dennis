// Realistic city configurations for Mini Metro

/**
 * @typedef {object} Point
 * @property {number} x - The x-coordinate, as a fraction of the canvas width.
 * @property {number} y - The y-coordinate, as a fraction of the canvas height.
 */

/**
 * @typedef {object} River
 * @property {string} name - The name of the river.
 * @property {string} type - The type of river path ('curve', 'straight', 'meander').
 * @property {number} width - The width of the river in pixels.
 * @property {Point[]} points - An array of points that define the river's path.
 */

/**
 * @typedef {object} Island
 * @property {string} name - The name of the island.
 * @property {number} x - The x-coordinate of the island's center.
 * @property {number} y - The y-coordinate of the island's center.
 * @property {number} width - The width of the island.
 * @property {number} height - The height of the island.
 * @property {string} shape - The shape of the island ('ellipse', 'rect').
 * @property {boolean} [isLand=false] - Whether the island is land (true) or a body of water (false).
 */

/**
 * @typedef {object} SpawnZone
 * @property {string} name - The name of the spawn zone.
 * @property {number} x - The x-coordinate of the top-left corner of the zone.
 * @property {number} y - The y-coordinate of the top-left corner of the zone.
 * @property {number} w - The width of the zone.
 * @property {number} h - The height of the zone.
 */

/**
 * @typedef {object} Landmark
 * @property {string} name - The name of the landmark.
 * @property {number} x - The x-coordinate of the landmark.
 * @property {number} y - The y-coordinate of the landmark.
 */

/**
 * @typedef {object} CityConfig
 * @property {string} name - The name of the city.
 * @property {string} subtitle - A subtitle for the city.
 * @property {string} primaryColor - The primary color for the city's UI elements.
 * @property {string} backgroundColor - The background color of the map.
 * @property {string} waterColor - The color of water bodies.
 * @property {River[]} [rivers] - An array of river configurations.
 * @property {Island[]} [islands] - An array of island configurations.
 * @property {SpawnZone[]} spawnZones - An array of zones where stations can spawn.
 * @property {Landmark[]} [landmarks] - An array of decorative landmarks.
 * @property {number} initialBridges - The number of bridges the player starts with.
 * @property {number} bridgesPerWeek - The number of additional bridges awarded each week.
 * @property {object} [water] - Configuration for large water bodies like bays.
 */

/**
 * A collection of city configurations for the game.
 * Each key is a city identifier, and the value is a `CityConfig` object.
 * @type {Object.<string, CityConfig>}
 */
const CityMaps = {
    london: {
        name: 'LONDON',
        subtitle: 'Thames River',
        primaryColor: '#DD2515',
        backgroundColor: '#F5F5F5',
        waterColor: '#D4E6F1',
        
        // Realistic Thames shape - famous S-curve through London
        rivers: [
            {
                name: 'Thames',
                type: 'curve',
                width: 90,
                points: [
                    {x: 0, y: 0.55},
                    {x: 0.08, y: 0.54},
                    {x: 0.15, y: 0.56},
                    {x: 0.22, y: 0.60},  // First bend south
                    {x: 0.30, y: 0.64},  // Isle of Dogs area
                    {x: 0.38, y: 0.66},
                    {x: 0.45, y: 0.64},  // Greenwich bend
                    {x: 0.52, y: 0.60},  // Back north
                    {x: 0.60, y: 0.56},  // Central London
                    {x: 0.68, y: 0.54},  // Westminster
                    {x: 0.75, y: 0.55},  // Chelsea bend
                    {x: 0.82, y: 0.58},  // Putney
                    {x: 0.88, y: 0.60},  // Richmond curve
                    {x: 0.95, y: 0.58},
                    {x: 1, y: 0.57}
                ]
            }
        ],
        
        spawnZones: [
            {name: 'North London', x: 0.1, y: 0.05, w: 0.8, h: 0.4},
            {name: 'South London', x: 0.1, y: 0.7, w: 0.8, h: 0.25}
        ],
        
        landmarks: [
            {name: 'City', x: 0.6, y: 0.45},
            {name: 'Westminster', x: 0.68, y: 0.48},
            {name: 'Canary Wharf', x: 0.38, y: 0.72}
        ],
        
        initialBridges: 3,
        bridgesPerWeek: 1
    },
    
    paris: {
        name: 'PARIS',
        subtitle: 'La Seine',
        primaryColor: '#2581C4',
        backgroundColor: '#F5F5F5',
        waterColor: '#D6EAF8',
        
        // Seine with its famous islands
        rivers: [
            {
                name: 'Seine',
                type: 'curve',
                width: 70,
                points: [
                    {x: 0, y: 0.52},
                    {x: 0.1, y: 0.51},
                    {x: 0.2, y: 0.49},
                    {x: 0.3, y: 0.48},
                    {x: 0.4, y: 0.49},
                    {x: 0.45, y: 0.51},  // Île de la Cité area
                    {x: 0.5, y: 0.52},
                    {x: 0.55, y: 0.51},  // Île Saint-Louis area
                    {x: 0.6, y: 0.49},
                    {x: 0.7, y: 0.48},
                    {x: 0.8, y: 0.50},
                    {x: 0.9, y: 0.52},
                    {x: 1, y: 0.51}
                ]
            }
        ],
        
        islands: [
            {
                name: 'Île de la Cité',
                x: 0.45,
                y: 0.51,
                width: 60,
                height: 30,
                shape: 'ellipse'
            },
            {
                name: 'Île Saint-Louis',
                x: 0.55,
                y: 0.51,
                width: 40,
                height: 25,
                shape: 'ellipse'
            }
        ],
        
        spawnZones: [
            {name: 'Rive Droite', x: 0.1, y: 0.05, w: 0.8, h: 0.38},
            {name: 'Rive Gauche', x: 0.1, y: 0.6, w: 0.8, h: 0.35},
            {name: 'Île de la Cité', x: 0.42, y: 0.48, w: 0.08, h: 0.06},
            {name: 'Île Saint-Louis', x: 0.53, y: 0.49, w: 0.05, h: 0.04}
        ],
        
        landmarks: [
            {name: 'Tour Eiffel', x: 0.3, y: 0.6},
            {name: 'Notre-Dame', x: 0.45, y: 0.51},
            {name: 'Louvre', x: 0.5, y: 0.4},
            {name: 'Arc de Triomphe', x: 0.35, y: 0.35}
        ],
        
        initialBridges: 3,
        bridgesPerWeek: 1
    },
    
    newyork: {
        name: 'NEW YORK',
        subtitle: 'Manhattan Island',
        primaryColor: '#F0AB00',
        backgroundColor: '#F5F5F5',
        waterColor: '#D0E8F2',
        
        // Straight vertical rivers
        rivers: [
            {
                name: 'Hudson River',
                type: 'straight',
                width: 80,
                points: [
                    {x: 0.32, y: 0},
                    {x: 0.32, y: 0.2},
                    {x: 0.31, y: 0.4},
                    {x: 0.32, y: 0.6},
                    {x: 0.33, y: 0.8},
                    {x: 0.32, y: 1}
                ]
            },
            {
                name: 'East River',
                type: 'straight',
                width: 60,
                points: [
                    {x: 0.68, y: 0},
                    {x: 0.68, y: 0.2},
                    {x: 0.67, y: 0.4},
                    {x: 0.68, y: 0.6},
                    {x: 0.69, y: 0.8},
                    {x: 0.68, y: 1}
                ]
            },
            {
                name: 'Harlem River',
                type: 'straight',
                width: 40,
                points: [
                    {x: 0.32, y: 0.15},
                    {x: 0.4, y: 0.12},
                    {x: 0.5, y: 0.1},
                    {x: 0.6, y: 0.08},
                    {x: 0.68, y: 0.1}
                ]
            }
        ],
        
        islands: [
            {
                name: 'Manhattan',
                x: 0.5,
                y: 0.5,
                width: 0.32,
                height: 0.85,
                shape: 'rect',
                isLand: true
            },
            {
                name: 'Roosevelt Island',
                x: 0.72,
                y: 0.4,
                width: 0.02,
                height: 0.15,
                shape: 'rect',
                isLand: true
            }
        ],
        
        spawnZones: [
            {name: 'New Jersey', x: 0.02, y: 0.15, w: 0.25, h: 0.7},
            {name: 'Manhattan', x: 0.36, y: 0.15, w: 0.28, h: 0.7},
            {name: 'Brooklyn/Queens', x: 0.72, y: 0.15, w: 0.25, h: 0.7},
            {name: 'Bronx', x: 0.36, y: 0.02, w: 0.28, h: 0.08}
        ],
        
        landmarks: [
            {name: 'Central Park', x: 0.5, y: 0.3},
            {name: 'Wall Street', x: 0.5, y: 0.85},
            {name: 'Times Square', x: 0.5, y: 0.5},
            {name: 'Brooklyn', x: 0.85, y: 0.6}
        ],
        
        initialBridges: 4,
        bridgesPerWeek: 1
    },
    
    berlin: {
        name: 'BERLIN',
        subtitle: 'Die Spree',
        primaryColor: '#35AB52',
        backgroundColor: '#F5F5F5',
        waterColor: '#D5E8E4',
        
        // Meandering Spree river
        rivers: [
            {
                name: 'Spree',
                type: 'meander',
                width: 55,
                points: [
                    {x: 0, y: 0.4},
                    {x: 0.1, y: 0.38},
                    {x: 0.18, y: 0.40},
                    {x: 0.25, y: 0.44},  // First meander
                    {x: 0.32, y: 0.46},
                    {x: 0.38, y: 0.44},
                    {x: 0.45, y: 0.40},  // Museum Island area
                    {x: 0.52, y: 0.38},
                    {x: 0.58, y: 0.40},
                    {x: 0.65, y: 0.44},  // Friedrichshain bend
                    {x: 0.72, y: 0.48},
                    {x: 0.78, y: 0.50},
                    {x: 0.85, y: 0.48},  // Treptow curve
                    {x: 0.92, y: 0.45},
                    {x: 1, y: 0.43}
                ]
            },
            {
                name: 'Landwehrkanal',
                type: 'curve',
                width: 35,
                points: [
                    {x: 0.35, y: 0.55},
                    {x: 0.42, y: 0.58},
                    {x: 0.5, y: 0.60},
                    {x: 0.58, y: 0.58},
                    {x: 0.65, y: 0.54}
                ]
            }
        ],
        
        spawnZones: [
            {name: 'Mitte/Prenzlauer Berg', x: 0.35, y: 0.05, w: 0.3, h: 0.3},
            {name: 'Charlottenburg', x: 0.05, y: 0.2, w: 0.25, h: 0.25},
            {name: 'Kreuzberg/Neukölln', x: 0.4, y: 0.65, w: 0.3, h: 0.3},
            {name: 'Friedrichshain', x: 0.7, y: 0.25, w: 0.25, h: 0.2}
        ],
        
        landmarks: [
            {name: 'Brandenburger Tor', x: 0.45, y: 0.35},
            {name: 'Alexanderplatz', x: 0.52, y: 0.32},
            {name: 'Potsdamer Platz', x: 0.48, y: 0.5}
        ],
        
        initialBridges: 2,  // Berlin famously starts with fewer bridges!
        bridgesPerWeek: 0.5  // Gets bridges less frequently
    },
    
    osaka: {
        name: 'OSAKA',
        subtitle: 'Osaka Bay',
        primaryColor: '#FF6B9D',
        backgroundColor: '#F5F5F5',
        waterColor: '#E1F0FA',
        
        rivers: [
            {
                name: 'Yodo River',
                type: 'curve',
                width: 85,
                points: [
                    {x: 0.7, y: 0},
                    {x: 0.68, y: 0.15},
                    {x: 0.65, y: 0.3},
                    {x: 0.6, y: 0.45},
                    {x: 0.55, y: 0.6},
                    {x: 0.5, y: 0.75},
                    {x: 0.45, y: 0.9},
                    {x: 0.4, y: 1}
                ]
            }
        ],
        
        // Osaka Bay on the left
        water: {
            type: 'bay',
            x: 0,
            y: 0.5,
            width: 0.35,
            height: 1
        },
        
        spawnZones: [
            {name: 'Central Osaka', x: 0.4, y: 0.2, w: 0.25, h: 0.6},
            {name: 'Eastern Districts', x: 0.72, y: 0.2, w: 0.25, h: 0.6},
            {name: 'Bay Area', x: 0.1, y: 0.3, w: 0.2, h: 0.4}
        ],
        
        initialBridges: 3,
        bridgesPerWeek: 1
    }
};

// Export for use in game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CityMaps;
} else {
    window.CityMaps = CityMaps;
}