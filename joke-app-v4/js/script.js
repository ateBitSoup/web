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
        return items.filter((item, index, self) =>
            index === self.findIndex((t) => (t.value === item.value && t.type === item.type))
        );
    }

    // --- THEME AND STYLE LOGIC ---
    function determineAndApplyStyles() {
        const { year, month, day } = getCurrentDateParts();
        const today = new Date(year, month, day);
        let activeThemeClass = "";
        let activeHolidayName = null;
        let holidaySpecificSvgsForFalling = [];
        currentActiveJokeTags = [];

        const safeFederalHolidaysConfig = (typeof federalHolidaysConfig !== 'undefined' && Array.isArray(federalHolidaysConfig)) ? federalHolidaysConfig : [];
        const safeSeasonsConfig = (typeof seasonsConfig !== 'undefined' && Array.isArray(seasonsConfig)) ? seasonsConfig : [];
        const safeCommonHolidaysConfig = (typeof commonHolidaysConfig !== 'undefined' && Array.isArray(commonHolidaysConfig)) ? commonHolidaysConfig : [];
        const safeFunDaysConfig = (typeof funDaysConfig !== 'undefined' && Array.isArray(funDaysConfig)) ? funDaysConfig : [];
        const safeFunnySvgs = (typeof funnySvgs !== 'undefined' && Array.isArray(funnySvgs)) ? funnySvgs : [];

        console.log(`Determining styles for: ${month + 1}/${day}/${year}`); // Log the date being checked

        // 1. Check Federal Holidays
        for (const holiday of safeFederalHolidaysConfig) {
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

        let seasonBaseSvgs = [...safeFunnySvgs];

        if (!activeThemeClass) {
            let currentSeason = null;
            for (const season of safeSeasonsConfig) {
                const seasonStartCurrentYear = new Date(year, season.startMonth, season.startDate);
                const seasonEndCurrentYear = new Date(year, season.endMonth, season.endDate);
                if (season.startMonth > season.endMonth) { 
                    if ((isDateInRange(today, seasonStartCurrentYear, new Date(year, 11, 31))) || 
                        (isDateInRange(today, new Date(year, 0, 1), seasonEndCurrentYear))) {
                        currentSeason = season;
                        break;
                    }
                } else {
                    if (isDateInRange(today, seasonStartCurrentYear, seasonEndCurrentYear)) {
                        currentSeason = season;
                        break;
                    }
                }
            }
            if (!currentSeason && safeSeasonsConfig.length > 0) {
                console.warn("Could not determine current season, defaulting to Winter or first available season.");
                currentSeason = safeSeasonsConfig.find(s => s.name === "Winter") || safeSeasonsConfig[0];
            }
            if (currentSeason) {
                activeThemeClass = currentSeason.cssClass;
                seasonBaseSvgs = currentSeason.svgs && currentSeason.svgs.length > 0 ? currentSeason.svgs : safeFunnySvgs;
                currentActiveJokeTags = [...(currentSeason.tags || [])];
                console.log(`Season Active: ${currentSeason.name}`);
            }

            for (const holiday of safeCommonHolidaysConfig) {
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
        
        currentFallingItemsPool = compileFallingItems(seasonBaseSvgs, holidaySpecificSvgsForFalling);

        if (bodyElement) {
            const classesToRemove = Array.from(bodyElement.classList).filter(cls => cls.endsWith('-theme'));
            classesToRemove.forEach(cls => bodyElement.classList.remove(cls));
            if (activeThemeClass) {
                bodyElement.classList.add(activeThemeClass);
            }
        }

        // 3. Check and Display Fun Days
        console.log("Checking Fun Days...");
        if (funDayNotificationElement) {
            console.log("Fun Day Notification Element FOUND.");
            const funDay = safeFunDaysConfig.find(fd => fd.month === month && fd.day === day);
            if (funDay) {
                console.log(`Fun Day Matched: ${funDay.name}`);
                funDayNotificationElement.innerHTML = `Happy <strong>${funDay.name}</strong>! 🎉`;
                funDayNotificationElement.style.display = 'block';
                console.log("Fun Day Notification display set to 'block'");
            } else {
                funDayNotificationElement.style.display = 'none';
                console.log("No Fun Day today. Notification display set to 'none'");
            }
        } else {
            console.error("Fun Day Notification Element NOT FOUND in DOM.");
        }

        currentActiveJokeTags = [...new Set(currentActiveJokeTags)];
        console.log("Final Applied Body Classes:", bodyElement ? bodyElement.className : 'Error: bodyElement not found', "| Active Holiday:", activeHolidayName || "None", "| Joke Tags:", currentActiveJokeTags);
        console.log("Falling items pool size:", currentFallingItemsPool.length);
    }

    function createFallingItem() {
        if (!currentFallingItemsPool || currentFallingItemsPool.length === 0) {
            let fallbackPool = [];
            const defaultEmojis = (typeof funnyEmojis !== 'undefined' && Array.isArray(funnyEmojis)) ? funnyEmojis : [];
            const defaultSvgs = (typeof funnySvgs !== 'undefined' && Array.isArray(funnySvgs)) ? funnySvgs : [];
            fallbackPool.push(...defaultEmojis.map(emoji => ({ type: 'emoji', value: emoji })));
            fallbackPool.push(...defaultSvgs.map(svgString => ({ type: 'svg', value: svgString })));
            
            if (fallbackPool.length === 0) return;
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
            const size = (Math.random() * 30 + 30);
            itemContainer.style.width = size + 'px';
            itemContainer.style.height = size + 'px';
        }
        itemContainer.style.left = Math.random() * 100 + 'vw';
        const animationDuration = (Math.random() * 3 + 4);
        itemContainer.style.animationDuration = animationDuration + 's, ' + animationDuration + 's';
        
        if (bodyElement) bodyElement.appendChild(itemContainer);
        setTimeout(() => {
            if (itemContainer.parentNode) itemContainer.remove();
        }, animationDuration * 1000 + 500);
    }

    function triggerItemRain(count = 33) {
        for (let i = 0; i < count; i++) {
            setTimeout(createFallingItem, i * 120);
        }
    }

    function loadRandomStaticSvg() {
        const generalSvgs = (typeof funnySvgs !== 'undefined' && Array.isArray(funnySvgs)) ? funnySvgs : [];
        const mainLogo = (typeof schoolLogoSvg !== 'undefined') ? schoolLogoSvg : '';
        
        const decorativeSvgs = generalSvgs.filter(svg => svg !== mainLogo);

        if (staticSvgDisplay) {
            if (decorativeSvgs.length > 0) {
                const randomIndex = Math.floor(Math.random() * decorativeSvgs.length);
                staticSvgDisplay.innerHTML = decorativeSvgs[randomIndex];
            } else if (generalSvgs.length > 0 && generalSvgs[0] !== mainLogo) {
                staticSvgDisplay.innerHTML = generalSvgs[0];
            } else if (generalSvgs.length > 1 && generalSvgs[0] === mainLogo && generalSvgs[1]) {
                staticSvgDisplay.innerHTML = generalSvgs[1];
            } else {
                staticSvgDisplay.innerHTML = '<p style="font-size:0.8em; color:#777;">(Image Spot)</p>';
            }
        }
    }

    function displayNewJokeSetup() {
        let jokePool = allJokesCombined.length > 0 ? [...allJokesCombined] : [];
        let uniqueActiveTags = [...new Set(currentActiveJokeTags)];

        if (uniqueActiveTags.length > 0 && jokePool.length > 0) {
            const themedJokes = jokePool.filter(joke =>
                joke.tags && Array.isArray(joke.tags) && joke.tags.some(tag => uniqueActiveTags.includes(tag))
            );

            if (themedJokes.length > 0) {
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
                if (currentSelectedJoke.hasOwnProperty('setup_en') && currentSelectedJoke.setup_en && currentSelectedJoke.setup_en !== currentSelectedJoke.setup) {
                    setupHTML += `<br><span class="translation">(${currentSelectedJoke.setup_en})</span>`;
                }
                jokeSetupElement.innerHTML = setupHTML;

                jokePunchlineElement.innerHTML = '';
                jokePunchlineElement.style.display = 'none';

                revealPunchlineButton.style.display = 'inline-block';
                revealPunchlineButton.disabled = false;
                newJokeButton.textContent = 'Next Joke';
            } else {
                jokeSetupElement.innerHTML = "Oh no! Coco is out of jokes for now.<br><span class='translation'>Please ask your teacher to add more!</span>";
                jokePunchlineElement.innerHTML = "";
                jokePunchlineElement.style.display = 'none';
                revealPunchlineButton.style.display = 'none';
                newJokeButton.textContent = 'Get Joke';
            }
        } else {
            console.error("One or more joke display DOM elements are missing.");
        }

        if (typeof loadRandomStaticSvg === 'function') {
            loadRandomStaticSvg();
        }
    }

    function revealCurrentPunchline() {
        if (currentSelectedJoke && currentSelectedJoke.punchline && jokePunchlineElement && revealPunchlineButton && newJokeButton) {
            let punchlineHTML = currentSelectedJoke.punchline;
            if (currentSelectedJoke.hasOwnProperty('punchline_en') && currentSelectedJoke.punchline_en && currentSelectedJoke.punchline_en !== currentSelectedJoke.punchline) {
                punchlineHTML += `<br><span class="translation">(${currentSelectedJoke.punchline_en})</span>`;
            }
            jokePunchlineElement.innerHTML = punchlineHTML;
            jokePunchlineElement.style.display = 'block';
            
            triggerItemRain();
            
            revealPunchlineButton.style.display = 'none';
            newJokeButton.textContent = 'Get Joke';
        }
    }

    function initializePage() {
        if (logoContainer && typeof schoolLogoSvg !== 'undefined' && schoolLogoSvg) {
            logoContainer.innerHTML = schoolLogoSvg;
        }
        if (jokePunchlineElement) {
            jokePunchlineElement.innerHTML = '';
            jokePunchlineElement.style.display = 'none';
        }
        if (revealPunchlineButton) {
            revealPunchlineButton.style.display = 'none';
        }
        
        determineAndApplyStyles();

        if (jokeSetupElement) {
            if (allJokesCombined.length === 0) {
                jokeSetupElement.innerHTML = "Press 'Get Joke' for laughs! <br><span class='translation'>(Teacher needs to add jokes)</span>";
            } else {
                jokeSetupElement.textContent = 'Press "Get Joke" for a ROARsome joke from Coco!';
            }
        }
        
        if (typeof loadRandomStaticSvg === 'function') {
            loadRandomStaticSvg();
        }

        console.log(`V4.1 (Modular) Initialized. Total jokes loaded: ${allJokesCombined.length}.`);
        
        const configVars = {
            funnyEmojis, funnySvgs, seasonsConfig, federalHolidaysConfig,
            commonHolidaysConfig, funDaysConfig, dadJokes, catJokes, dailyJokes,
            spanishJokes, schoolJokes, popCultureJokes, seasonalJokes
        };
        let missingConfigs = [];
        for (const varName in configVars) {
            if (typeof configVars[varName] === 'undefined') {
                missingConfigs.push(varName);
            }
        }
        if (missingConfigs.length > 0) {
            console.error(`CRITICAL: The following configuration variables from theme-config.js are MISSING or UNDEFINED: ${missingConfigs.join(', ')}! Ensure theme-config.js is loaded correctly and variables are globally defined (using const at the top level).`);
        }
    }

    if (newJokeButton && revealPunchlineButton) {
        newJokeButton.addEventListener('click', displayNewJokeSetup);
        revealPunchlineButton.addEventListener('click', revealCurrentPunchline);
    } else {
        console.error("CRITICAL: Could not find joke buttons ('new-joke-button' or 'reveal-punchline-button') in the DOM to attach event listeners.");
    }

    initializePage();
});