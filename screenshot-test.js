const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 50,
        args: ['--window-size=1600,900'],
        defaultViewport: { width: 1600, height: 900 }
    });
    
    const page = await browser.newPage();
    
    // Load the page
    const filePath = `file://${path.resolve(__dirname, 'mini-metro-ultimate.html')}`;
    console.log('Loading:', filePath);
    
    await page.goto(filePath, { waitUntil: 'networkidle0', timeout: 10000 });
    
    // Wait for loading to disappear
    await page.waitForSelector('#loading.hidden', { timeout: 3000 }).catch(() => {});
    
    // Take screenshot of main menu
    await page.screenshot({ 
        path: 'screenshot-menu.png',
        fullPage: true 
    });
    console.log('✅ Menu screenshot saved: screenshot-menu.png');
    
    // Click Play button
    await page.click('.menu-button');
    await new Promise(r => setTimeout(r, 1000));
    
    // Take screenshot of map
    await page.screenshot({ 
        path: 'screenshot-map.png',
        fullPage: true 
    });
    console.log('✅ Map screenshot saved: screenshot-map.png');
    
    // Check what's visible
    const mapVisible = await page.$eval('#map-container', el => {
        return {
            display: window.getComputedStyle(el).display,
            visibility: window.getComputedStyle(el).visibility,
            width: el.offsetWidth,
            height: el.offsetHeight,
            innerHTML: el.innerHTML.substring(0, 200)
        };
    });
    console.log('Map container state:', mapVisible);
    
    // Check SVG
    const svgExists = await page.$('#world-map');
    if (svgExists) {
        const svgState = await page.$eval('#world-map', el => {
            return {
                width: el.getAttribute('width'),
                height: el.getAttribute('height'),
                viewBox: el.getAttribute('viewBox'),
                childrenCount: el.children.length
            };
        });
        console.log('SVG state:', svgState);
    }
    
    // Check cities
    const cities = await page.$$eval('.city-station', elements => elements.length);
    console.log('Cities found:', cities);
    
    // Check tube lines
    const lines = await page.$$eval('#tube-lines line', elements => elements.length);
    console.log('Tube lines found:', lines);
    
    // Try clicking a city
    const unlockedCity = await page.$('.city-marker.unlocked');
    if (unlockedCity) {
        await unlockedCity.click();
        await new Promise(r => setTimeout(r, 500));
        
        await page.screenshot({ 
            path: 'screenshot-city-selected.png',
            fullPage: true 
        });
        console.log('✅ City selection screenshot saved: screenshot-city-selected.png');
    }
    
    console.log('\n📸 Screenshots saved! Check the following files:');
    console.log('  - screenshot-menu.png');
    console.log('  - screenshot-map.png');
    console.log('  - screenshot-city-selected.png');
    
    await new Promise(r => setTimeout(r, 2000));
    await browser.close();
})();