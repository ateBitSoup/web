// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const bodyElement = document.body;
    const jokeSetupElement = document.getElementById('joke-setup-text');
    const jokePunchlineElement = document.getElementById('joke-punchline-text');
    const newJokeButton = document.getElementById('new-joke-button');
    const revealPunchlineButton = document.getElementById('reveal-punchline-button');
    const staticSvgDisplay = document.getElementById('static-svg-display');
    const logoContainer = document.getElementById('logo-container');
    const funDayNotificationElement = document.getElementById('fun-day-notification');

    // --- STATE VARIABLES ---
    let currentSelectedJoke = null;
    let currentFallingItemsPool = [];
    let currentActiveJokeTags = [];

    // --- DATA INITIALIZATION (from theme-config.js) ---
    // Ensure these arrays are defined in theme-config.js and loaded before this script
    const allJokesCombined = [
        ...(typeof dadJokes !== 'undefined' ? dadJokes : []),
        ...(typeof catJokes !== 'undefined' ? catJokes : []),
        ...(typeof dailyJokes !== 'undefined' ? dailyJokes : []),
        ...(typeof spanishJokes !== 'undefined' ? spanishJokes : []),
        ...(typeof schoolJokes !== 'undefined' ? schoolJokes : []),
        ...(typeof popCultureJokes !== 'undefined' ? popCultureJokes : []),
        ...(typeof seasonalJokes !== 'undefined' ? seasonalJokes : [])
    ];

    // --- HELPER FUNCTIONS ---
    function compileFallingItems(baseSvgs = [], holidaySpecificSvgs = []) {
        let items = [];
        const defaultEmojis = (typeof funnyEmojis !== 'undefined' && Array.isArray(funnyEmojis)) ? funnyEmojis : [];
        const defaultSvgs = (typeof funnySvgs !== 'undefined' && Array.isArray(funnySvgs)) ? funnySvgs : [];

        items.push(...defaultEmojis.map(emoji => ({ type: 'emoji', value: emoji })));
        
        const effectiveBaseSvgs = (baseSvgs && baseSvgs.length > 0) ? baseSvgs : defaultSvgs;
        items.push(...effectiveBaseSvgs.map(svgString => ({ type: 'svg', value: svgString })));

        if (holidaySpecificSvgs && holidaySpecificSvgs.length > 0) {
            items.push(...holidaySpecificSvgs.map(svgString => ({ type: 'svg', value: svgString })));
        }
        // Ensure uniqueness
        return items.filter((item, index, self) =>
            index === self.findIndex((t) => (t.value === item.value && t.type === item.type))
        );
    }

    // --- THEME AND STYLE LOGIC ---
    function determineAndApplyStyles() {
        const { year, month, day } = getCurrentDateParts(); // From date-utils.js
        const today = new Date(year, month, day);
        let activeThemeClass = "";
        let activeHolidayName = null;
        let holidaySpecificSvgsForFalling = [];
        currentActiveJokeTags = []; // Reset for fresh determination

        // 1. Check Federal Holidays (highest priority)
        if (typeof federalHolidaysConfig !== 'undefined' && Array.isArray(federalHolidaysConfig)) {
            for (const holiday of federalHolidaysConfig) {
                const holidayDate = holiday.getDate(year);
                if (!holidayDate || isNaN(holidayDate.getTime())) continue;

                const startDate = addDays(holidayDate, -holiday.daysBefore);
                const endDate = addDays(holidayDate, holiday.daysAfter);

                if (isDateInRange(today, startDate, endDate)) {
                    activeThemeClass = holiday.cssClass;
                    activeHolidayName = holiday.name;
                    holidaySpecificSvgsForFalling = holiday.svgs || [];
                    currentActiveJokeTags = holiday.tags || [];
                    console.log(`Federal Holiday Active: ${activeHolidayName}`);
                    break;
                }
            }
        }

        let seasonBaseSvgs = (typeof funnySvgs !== 'undefined' && Array.isArray(funnySvgs)) ? [...funnySvgs] : [];

        // 2. If no Federal Holiday, determine Season
        if (!activeThemeClass && typeof seasonsConfig !== 'undefined' && Array.isArray(seasonsConfig)) {
            let currentSeason = null;
            for (const season of seasonsConfig) {
                const seasonStartCurrentYear = new Date(year, season.startMonth, season.startDate);
                const seasonEndCurrentYear = new Date(year, season.endMonth, season.endDate);

                if (season.startMonth > season.endMonth) { // Season wraps around New Year (e.g., Winter)
                    // Check if 'today' is in the current year's end part OR current year's start part for this wrapping season
                    if ((isDateInRange(today, seasonStartCurrentYear, new Date(year, 11, 31))) || // e.g., Dec 21-31 of current year
                        (isDateInRange(today, new Date(year, 0, 1), seasonEndCurrentYear))) {    // e.g., Jan 1 - Mar 19 of current year
                        currentSeason = season;
                        break;
                    }
                } else { // Season is within a single calendar year
                    if (isDateInRange(today, seasonStartCurrentYear, seasonEndCurrentYear)) {
                        currentSeason = season;
                        break;
                    }
                }
            }
            
            if (!currentSeason && seasonsConfig.length > 0) { // Fallback to first season if no match (e.g. winter if not caught by above)
                console.warn("Could not precisely determine current season, checking Winter as default or first in config.");
                currentSeason = seasonsConfig.find(s => s.name === "Winter") || seasonsConfig[0];
            }


            if (currentSeason) {
                activeThemeClass = currentSeason.cssClass;
                seasonBaseSvgs = currentSeason.svgs || funnySvgs;
                currentActiveJokeTags = [...(currentSeason.tags || [])]; // Start with season tags
                console.log(`Season Active: ${currentSeason.name}`);
            }

            // Check Common Non-Federal Holidays (applies on top of season)
            if (typeof commonHolidaysConfig !== 'undefined' && Array.isArray(commonHolidaysConfig)) {
                for (const holiday of commonHolidaysConfig) {
                    let holidayDate;
                    if (holiday.calculated && typeof holiday.getDate === 'function') {
                        holidayDate = holiday.getDate(year);
                    } else {
                        holidayDate = new Date(year, holiday.month, holiday.day);
                    }

                    if (holidayDate && !isNaN(holidayDate.getTime()) && holidayDate.getMonth() === month && holidayDate.getDate() === day) {
                        activeHolidayName = holiday.name;
                        const commonHolidayClass = holiday.name.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '') + '-active';
                        if (bodyElement) bodyElement.classList.add(commonHolidayClass);
                        holidaySpecificSvgsForFalling = holiday.svgs || [];
                        currentActiveJokeTags.push(...(holiday.tags || []));
                        console.log(`Common Holiday Active: ${activeHolidayName}`);
                        break; 
                    }
                }
            }
        }
        
        currentFallingItemsPool = compileFallingItems(seasonBaseSvgs, holidaySpecificSvgsForFalling);

        // Apply main theme class (remove old theme classes, add new one)
        if (bodyElement) {
            const classesToRemove = Array.from(bodyElement.classList).filter(cls => cls.endsWith('-theme'));
            classesToRemove.forEach(cls => bodyElement.classList.remove(cls));
            if (activeThemeClass) {
                bodyElement.classList.add(activeThemeClass);
            }
        }

        // 3. Check and Display Fun Days
        if (funDayNotificationElement && typeof funDaysConfig !== 'undefined' && Array.isArray(funDaysConfig)) {
            const funDay = funDaysConfig.find(fd => fd.month === month && fd.day === day);
            if (funDay) {
                funDayNotificationElement.innerHTML = `Happy <strong>${funDay.name}</strong>! 🎉`;
                funDayNotificationElement.style.display = 'block';
            } else {
                funDayNotificationElement.style.display = 'none';
            }
        }
        currentActiveJokeTags = [...new Set(currentActiveJokeTags)]; // Ensure unique tags
        console.log("Final Applied Body Classes:", bodyElement ? bodyElement.className : 'Error: bodyElement not found', "| Active Holiday:", activeHolidayName || "None", "| Joke Tags:", currentActiveJokeTags);
        console.log("Falling items pool size:", currentFallingItemsPool.length);
    }

    // --- FALLING ITEM ANIMATION ---
    function createFallingItem() {
        if (!currentFallingItemsPool || currentFallingItemsPool.length === 0) {
            // Attempt to recompile a default pool if current is empty
            let fallbackPool = [];
            const defaultEmojis = (typeof funnyEmojis !== 'undefined' && Array.isArray(funnyEmojis)) ? funnyEmojis : [];
            const defaultSvgs = (typeof funnySvgs !== 'undefined' && Array.isArray(funnySvgs)) ? funnySvgs : [];
            fallbackPool.push(...defaultEmojis.map(emoji => ({ type: 'emoji', value: emoji })));
            fallbackPool.push(...defaultSvgs.map(svgString => ({ type: 'svg', value: svgString })));
            
            if (fallbackPool.length === 0) return; // Still no items, do nothing
            currentFallingItemsPool = fallbackPool;
        }

        const itemContainer = document.createElement('div');
        itemContainer.classList.add('falling-item');
        
        const randomItem = currentFallingItemsPool[Math.floor(Math.random() * currentFallingItemsPool.length)];

        if (!randomItem) {
            console.error("Could not select a random item for falling from the pool.");
            return;
        }

        if (randomItem.type === 'emoji') {
            itemContainer.textContent = randomItem.value;
            itemContainer.style.fontSize = (Math.random() * 1.5 + 1.2) + 'rem';
        } else if (randomItem.type === 'svg') {
            itemContainer.innerHTML = randomItem.value;
            const size = (Math.random() * 30 + 30); // 30px to 60px for falling SVGs
            itemContainer.style.width = size + 'px';
            itemContainer.style.height = size + 'px';
        }
        
        itemContainer.style.left = Math.random() * 100 + 'vw';
        const animationDuration = (Math.random() * 3 + 4); // 4 to 7 seconds
        itemContainer.style.animationDuration = animationDuration + 's, ' + animationDuration + 's'; // For fall and fadeOut
        
        if (bodyElement) {
            bodyElement.appendChild(itemContainer);
        }
        
        setTimeout(() => {
            if (itemContainer.parentNode) {
                itemContainer.remove();
            }
        }, animationDuration * 1000 + 500); // Add a little buffer
    }

    function triggerItemRain(count = 7) {
        for (let i = 0; i < count; i++) {
            setTimeout(createFallingItem, i * 120); // Stagger item creation
        }
    }

    // --- STATIC DECORATIVE SVG ---
    function loadRandomStaticSvg() {
        const generalSvgs = (typeof funnySvgs !== 'undefined' && Array.isArray(funnySvgs)) ? funnySvgs : [];
        const mainLogo = (typeof schoolLogoSvg !== 'undefined') ? schoolLogoSvg : '';
        
        const decorativeSvgs = generalSvgs.filter(svg => svg !== mainLogo); // Exclude main logo

        if (staticSvgDisplay) {
            if (decorativeSvgs.length > 0) {
                const randomIndex = Math.floor(Math.random() * decorativeSvgs.length);
                staticSvgDisplay.innerHTML = decorativeSvgs[randomIndex];
            } else if (generalSvgs.length > 0 && generalSvgs[0] !== mainLogo) {
                // If no decorative (excluding logo), use the first general SVG if it's not the logo
                staticSvgDisplay.innerHTML = generalSvgs[0];
            } else if (generalSvgs.length > 1 && generalSvgs[0] === mainLogo && generalSvgs[1]) {
                 // If first is logo, and there's a second one, use the second
                staticSvgDisplay.innerHTML = generalSvgs[1];
            } else {
                staticSvgDisplay.innerHTML = '<p style="font-size:0.8em; color:#777;">(Fun image here!)</p>';
            }
        }
    }

    // --- JOKE DISPLAY LOGIC ---
    function displayNewJokeSetup() {
        let jokePool = allJokesCombined.length > 0 ? [...allJokesCombined] : []; // Use a copy
        let uniqueActiveTags = [...new Set(currentActiveJokeTags)]; // Ensure tags are unique for filtering

        if (uniqueActiveTags.length > 0 && jokePool.length > 0) {
            const themedJokes = jokePool.filter(joke =>
                joke.tags && Array.isArray(joke.tags) && joke.tags.some(tag => uniqueActiveTags.includes(tag))
            );

            if (themedJokes.length > 0) {
                // 75% chance for themed joke if available AND if not all jokes are themed (to allow some general ones)
                if (Math.random() < 0.75 || themedJokes.length === jokePool.length) { 
                    jokePool = themedJokes;
                    console.log("Using themed joke pool. Matched Tags:", uniqueActiveTags);
                } else {
                    console.log("Using general joke pool (25% chance or fallback).");
                }
            } else {
                 console.log("No specific themed jokes found for tags:", uniqueActiveTags, ". Using general pool.");
            }
        }
        
        if (jokeSetupElement && jokePunchlineElement && revealPunchlineButton && newJokeButton) {
            if (jokePool.length > 0) {
                const randomIndex = Math.floor(Math.random() * jokePool.length);
                currentSelectedJoke = jokePool[randomIndex];

                let setupHTML = currentSelectedJoke.setup;
                // Add translation if it's a Spanish joke and translation exists and is different
                if (currentSelectedJoke.hasOwnProperty('setup_en') && currentSelectedJoke.setup_en && currentSelectedJoke.setup_en !== currentSelectedJoke.setup) {
                    setupHTML += `<br><span class="translation">(${currentSelectedJoke.setup_en})</span>`;
                }
                jokeSetupElement.innerHTML = setupHTML;

                jokePunchlineElement.innerHTML = '';
                jokePunchlineElement.style.display = 'none';

                revealPunchlineButton.style.display = 'inline-block';
                revealPunchlineButton.disabled = false;
                newJokeButton.textContent = 'Next Joke';
            } else { // This case means allJokesCombined was empty or became empty after filtering
                jokeSetupElement.innerHTML = "Oh no! Coco is out of jokes for now.<br><span class='translation'>Please ask your teacher to add more!</span>";
                jokePunchlineElement.innerHTML = "";
                jokePunchlineElement.style.display = 'none';
                revealPunchlineButton.style.display = 'none';
                newJokeButton.textContent = 'Get Joke';
            }
        }
        if (typeof loadRandomStaticSvg === 'function') {
            loadRandomStaticSvg();
        }
    }

    function revealCurrentPunchline() {
        if (currentSelectedJoke && currentSelectedJoke.punchline && jokePunchlineElement && revealPunchlineButton && newJokeButton) {
            let punchlineHTML = currentSelectedJoke.punchline;
            // Add translation if it's a Spanish joke and translation exists and is different
            if (currentSelectedJoke.hasOwnProperty('punchline_en') && currentSelectedJoke.punchline_en && currentSelectedJoke.punchline_en !== currentSelectedJoke.punchline) {
                punchlineHTML += `<br><span class="translation">(${currentSelectedJoke.punchline_en})</span>`;
            }
            jokePunchlineElement.innerHTML = punchlineHTML;
            jokePunchlineElement.style.display = 'block';
            
            triggerItemRain(); // Celebration!
            
            revealPunchlineButton.style.display = 'none';
            newJokeButton.textContent = 'Get Joke';
        }
    }

    // --- INITIAL PAGE SETUP ---
    function initializePage() {
        // Load the main school logo
        if (logoContainer && typeof schoolLogoSvg !== 'undefined' && schoolLogoSvg) {
            logoContainer.innerHTML = schoolLogoSvg;
        }

        // Set initial display states for joke elements
        if (jokePunchlineElement) {
            jokePunchlineElement.innerHTML = '';
            jokePunchlineElement.style.display = 'none';
        }
        if (revealPunchlineButton) {
            revealPunchlineButton.style.display = 'none';
        }
        
        // Determine and apply current theme based on date
        determineAndApplyStyles(); 

        // Set initial joke setup message
        if (jokeSetupElement) {
            if (allJokesCombined.length === 0) {
                jokeSetupElement.innerHTML = "Press 'Get Joke' for laughs! <br><span class='translation'>(Teacher needs to add jokes)</span>";
            } else {
                // Display the default placeholder, user clicks "Get Joke" for the first joke
                jokeSetupElement.textContent = 'Press "Get Joke" for a ROARsome joke from Coco!';
            }
        }
        
        // Load an initial decorative static SVG
        if (typeof loadRandomStaticSvg === 'function') {
            loadRandomStaticSvg();
        }

        console.log(`V4.1 (Modular) Initialized. Total jokes loaded: ${allJokesCombined.length}.`);
        // Sanity check for configuration variables
        if (typeof funnyEmojis === 'undefined' || typeof funnySvgs === 'undefined' || 
            typeof seasonsConfig === 'undefined' || typeof federalHolidaysConfig === 'undefined' || 
            typeof commonHolidaysConfig === 'undefined' || typeof funDaysConfig === 'undefined') {
            console.error("CRITICAL: One or more configuration arrays from theme-config.js are MISSING or UNDEFINED! Ensure theme-config.js is loaded and variables are correctly defined.");
        }
    }

    // --- EVENT LISTENERS ---
    if (newJokeButton && revealPunchlineButton) {
        newJokeButton.addEventListener('click', displayNewJokeSetup);
        revealPunchlineButton.addEventListener('click', revealCurrentPunchline);
    } else {
        console.error("CRITICAL: Could not find joke buttons ('new-joke-button' or 'reveal-punchline-button') in the DOM to attach event listeners.");
    }

    initializePage();
});