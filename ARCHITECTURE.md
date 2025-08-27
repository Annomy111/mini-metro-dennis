# Project Architecture

This document provides a high-level overview of the Mini Metro game's architecture.

## Overview

The game is a browser-based, vanilla JavaScript application. It is structured into several key components that work together to deliver the gameplay experience:

-   **Game Engine:** The core logic of the game, responsible for managing game state, rendering, and gameplay mechanics.
-   **City Configurations:** Data-driven configurations for each city map, including its geography and specific rules.
-   **Menu System:** Manages the user interface outside of the main game, including the main menu, city selection, and player progress.
-   **Audio System:** Handles all sound effects and procedural music.
-   **HTML & CSS:** The structure and styling for the game and menu screens.

## Key Files

### `mini-metro-ultimate.html`

This is the main HTML file that hosts the game. It contains the `<canvas>` element where the game is rendered and includes the necessary JavaScript files.

### `game-realistic.js`

This file contains the `MiniMetro` class, which is the heart of the game engine. Its responsibilities include:

-   **Game State Management:** Tracking the current city, game mode, score, time, and resources.
-   **Game Object Management:** Creating and managing stations, lines, trains, and passengers.
-   **Rendering:** Drawing all game elements onto the canvas.
-   **User Input:** Handling mouse and touch events for drawing lines and interacting with the game.
-   **Game Loop:** Updating the game state and re-rendering the screen on each frame.

### `city-maps.js`

This file defines the `CityMaps` object, which contains the configuration data for all playable cities. For each city, it specifies:

-   **Geography:** The layout of rivers, islands, and other geographical features.
-   **Appearance:** Colors for the background, water, and UI elements.
-   **Gameplay Rules:** Initial resources (e.g., bridges) and station spawn zones.
-   **Aesthetics:** Landmarks and other decorative elements.

This data-driven approach allows for easy addition or modification of city maps without changing the core game logic.

### `menu.js`

This file contains two main classes:

-   **`MenuSystem`:** Manages the game's UI and state outside of active gameplay. This includes:
    -   The main menu and city selection screen.
    -   Tracking player progress, such as high scores and unlocked achievements.
    -   Saving and loading player data to/from `localStorage`.
-   **`AudioSystem`:** Manages all audio within the game. It uses the Web Audio API to generate procedural sound effects for events like creating a station, a passenger boarding a train, or drawing a line.

### `mini-metro.css` & `menu.css`

These files provide the styling for the game.

-   **`mini-metro.css`:** Styles the main game interface, including the UI elements that overlay the canvas.
-   **`menu.css`:** Styles the main menu, city selection screen, and other non-gameplay screens.

## Data Flow

1.  The user opens the `menu.html` or `index.html` page, which loads the `MenuSystem`.
2.  The `MenuSystem` displays the main menu. If the user has played before, it loads their progress from `localStorage`.
3.  The user navigates to the city selection screen and chooses a city to play.
4.  The `MenuSystem` initiates the game by calling the `initializeCity` method of the `MiniMetro` instance (from `game-realistic.js`), passing the selected city's key.
5.  The `MiniMetro` class uses the city key to look up the corresponding configuration from the `CityMaps` object (from `city-maps.js`).
6.  The game starts, and the `MiniMetro` game loop begins, handling gameplay and rendering.
7.  As the game progresses, events can trigger sounds via the `AudioSystem`.
8.  When the game ends, the final score is passed back to the `MenuSystem`, which updates the player's high scores and achievements.
