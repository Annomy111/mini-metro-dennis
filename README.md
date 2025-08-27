# Mini Metro für Dennis 🚇

Ein browserbasiertes U-Bahn-Strategie-Spiel inspiriert von Mini Metro.

## Live Demo
🎮 **Spielen:** https://mini-metro-dennis.netlify.app

## Features

### Gameplay
- **Städte weltweit:** London, Paris, Berlin, New York, Tokyo und mehr
- **Linien zeichnen:** Verbinde Stationen mit U-Bahn-Linien
- **Passagiere transportieren:** Bringe Passagiere zu ihren Ziel-Stationen
- **Ressourcen-Management:** Verwalte Linien, Züge und Brücken

### Mobile First Design
- Touch-optimiert für Smartphones und Tablets
- Responsive UI mit angepassten Kontrollen
- Kleinere Stationen mit größeren Touch-Bereichen
- Kompakte Zeitanzeige und Score

### Visuals
- 60er Jahre Modernist Design
- Animierte Tube-Map im Hauptmenü
- Subtile Weltkarte im Hintergrund
- Tag/Nacht-Zyklus mit Flip-Clock

## Technologie

- **Frontend:** Vanilla JavaScript, HTML5 Canvas
- **Maps:** D3.js v7 mit TopoJSON
- **Audio:** Web Audio API
- **Deployment:** Netlify mit automatischen Deployments

## Lokale Entwicklung

```bash
# Repository klonen
git clone https://github.com/[username]/mini-metro-dennis.git
cd mini-metro-dennis

# Dependencies installieren
npm install

# Lokal starten
npm start

# Tests ausführen
npm test
```

## Steuerung

### Desktop
- **Linksklick + Ziehen:** Linie zeichnen
- **Rechtsklick:** Linie löschen

### Mobile
- **Tap + Drag:** Linie zeichnen
- **Doppel-Tap:** Linie löschen
- **Long Press:** Alternative zum Löschen

## Projektstruktur

```
mini-metro-dennis/
├── index.html                 # Hauptseite (Weiterleitung)
├── mini-metro-ultimate.html   # Hauptspiel
├── game-realistic.js          # Spiel-Engine
├── city-maps.js              # Stadt-Konfigurationen
├── menu-music.m4a            # Hintergrundmusik
└── README.md                 # Diese Datei
```

## Deployment

Das Projekt ist mit Netlify verbunden. Jeder Push zum `main` Branch wird automatisch deployed.

## Credits

Entwickelt mit ❤️ für Dennis

---

© 2024 Mini Metro für Dennis