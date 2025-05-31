// js/config/themes-data.js
// --- STYLING CONFIGURATION ---
const seasonsConfig = [
    { name: "Spring", startMonth: 2, startDate: 20, endMonth: 5, endDate: 20, cssClass: "spring-theme", svgs: [...funnySvgs, ...stPatricksSvgs, ...motherDaySvgs, ...mardiGrasSvgs], tags: ["spring", "stpatricks", "mothersday", "mardigras", "ashwednesday", "goodfriday"] },
    { name: "Summer", startMonth: 5, startDate: 21, endMonth: 8, endDate: 21, cssClass: "summer-theme", svgs: [...funnySvgs, ...fatherDaySvgs, ...flagDaySvgs], tags: ["summer", "fathersday", "flagday"] },
    { name: "Fall", startMonth: 8, startDate: 22, endMonth: 11, endDate: 20, cssClass: "fall-theme", svgs: [...funnySvgs, ...halloweenSvgs], tags: ["fall", "halloween", "thanksgiving"] },
    { name: "Winter", startMonth: 11, startDate: 21, endMonth: 2, endDate: 19, cssClass: "winter-theme", svgs: [...funnySvgs, ...christmasSvgs, ...newYearSvgs, ...valentineSvgs, ...groundhogDaySvgs], tags: ["winter", "christmas", "newyears", "valentines", "groundhogday", "newyearseve"] }
];

const federalHolidaysConfig = [
    { name: "New Year's Day", getDate: (year) => new Date(year, 0, 1), daysBefore: 3, daysAfter: 2, cssClass: "new-years-theme", svgs: newYearSvgs, tags: ["newyears"] },
    { name: "Martin Luther King Jr. Day", getDate: (year) => getNthWeekdayOfMonth(year, 0, 1, 3), daysBefore: 2, daysAfter: 1, cssClass: "mlk-theme", svgs: [], tags: ["mlkday"] },
    { name: "Washington's Birthday", getDate: (year) => getNthWeekdayOfMonth(year, 1, 1, 3), daysBefore: 2, daysAfter: 1, cssClass: "presidents-day-theme", svgs: [], tags: ["presidentsday"] },
    { name: "Memorial Day", getDate: (year) => getLastWeekdayOfMonth(year, 4, 1), daysBefore: 3, daysAfter: 1, cssClass: "memorial-day-theme", svgs: memorialDaySvgs, tags: ["memorialday"] },
    { name: "Juneteenth", getDate: (year) => new Date(year, 5, 19), daysBefore: 1, daysAfter: 1, cssClass: "juneteenth-theme", svgs: [], tags: ["juneteenth"] },
    { name: "Independence Day", getDate: (year) => new Date(year, 6, 4), daysBefore: 3, daysAfter: 3, cssClass: "independence-day-theme", svgs: memorialDaySvgs, tags: ["july4th"] },
    { name: "Labor Day", getDate: (year) => getNthWeekdayOfMonth(year, 8, 1, 1), daysBefore: 2, daysAfter: 1, cssClass: "labor-day-theme", svgs: [], tags: ["laborday"] },
    { name: "Columbus Day", getDate: (year) => getNthWeekdayOfMonth(year, 9, 1, 2), daysBefore: 1, daysAfter: 1, cssClass: "columbus-day-theme", svgs: [], tags: ["columbusday"] },
    { name: "Veterans Day", getDate: (year) => new Date(year, 10, 11), daysBefore: 1, daysAfter: 1, cssClass: "veterans-day-theme", svgs: memorialDaySvgs, tags: ["veteransday"] },
    { name: "Thanksgiving Day", getDate: (year) => getNthWeekdayOfMonth(year, 10, 4, 4), daysBefore: 5, daysAfter: 3, cssClass: "thanksgiving-theme", svgs: [...halloweenSvgs], tags: ["thanksgiving", "fall"] }, // Include fall/Halloween SVGs
    { name: "Christmas Day", getDate: (year) => new Date(year, 11, 25), daysBefore: 20, daysAfter: 7, cssClass: "christmas-theme", svgs: christmasSvgs, tags: ["christmas", "winter"] }
];

const commonHolidaysConfig = [
    {
        name: "Groundhog Day",
        month: 1, // February
        day: 2,
        svgs: groundhogDaySvgs,
        tags: ["groundhogday", "winter"]
    },
    {
        name: "Valentine's Day",
        month: 1, // February
        day: 14,
        svgs: valentineSvgs,
        tags: ["valentines", "winter"]
    },
    {
        name: "Mardi Gras",
        calculated: true,
        getDate: (year) => {
            const easterDate = getEasterSunday(year);
            if (!easterDate) return null;
            return addDays(easterDate, -47);
        },
        svgs: mardiGrasSvgs,
        tags: ["mardigras", "spring"]
    },
    {
        name: "Ash Wednesday",
        calculated: true,
        getDate: (year) => {
            const easterDate = getEasterSunday(year);
            if (!easterDate) return null;
            return addDays(easterDate, -46);
        },
        svgs: [], // No specific SVGs, will use seasonal
        tags: ["ashwednesday", "spring"]
    },
    {
        name: "St. Patrick's Day",
        month: 2, // March
        day: 17,
        svgs: stPatricksSvgs,
        tags: ["stpatricks", "spring"]
    },
    {
        name: "Good Friday",
        calculated: true,
        getDate: (year) => {
            const easterDate = getEasterSunday(year);
            if (!easterDate) return null;
            return addDays(easterDate, -2);
        },
        svgs: [], // Using spring/general SVGs
        tags: ["goodfriday", "spring"]
    },
    {
        name: "Cinco de Mayo",
        month: 4, // May
        day: 5,
        svgs: cincoDeMayoSvgs,
        tags: ["cincodemayo", "spring"]
    },
    {
        name: "Mother's Day",
        calculated: true,
        getDate: (year) => getNthWeekdayOfMonth(year, 4, 0, 2), // 2nd Sunday in May
        svgs: motherDaySvgs,
        tags: ["mothersday", "spring"]
    },
    {
        name: "Flag Day",
        month: 5, // June
        day: 14,
        svgs: flagDaySvgs,
        tags: ["flagday", "summer"]
    },
    {
        name: "Father's Day",
        calculated: true,
        getDate: (year) => getNthWeekdayOfMonth(year, 5, 0, 3), // 3rd Sunday in June
        svgs: fatherDaySvgs,
        tags: ["fathersday", "summer"]
    },
    {
        name: "Halloween",
        month: 9, // October
        day: 31,
        svgs: halloweenSvgs,
        tags: ["halloween", "fall"]
    },
    {
        name: "New Year's Eve",
        month: 11, // December
        day: 31,
        svgs: newYearsEveSvgs, // Reuses New Year's Day SVGs
        tags: ["newyearseve", "winter", "newyears"]
    }
];

const funDaysConfig = [
    // January
    { name: "National Science Fiction Day", month: 0, day: 2 },
    { name: "Festival of Sleep Day", month: 0, day: 3 },
    { name: "National Spaghetti Day", month: 0, day: 4 },
    { name: "National Bird Day", month: 0, day: 5 },
    { name: "National Cuddle Up Day", month: 0, day: 6 },
    { name: "Old Rock Day", month: 0, day: 7 },
    { name: "National Static Electricity Day", month: 0, day: 9 },
    { name: "Peculiar People Day", month: 0, day: 10 },
    { name: "National Milk Day", month: 0, day: 11 },
    { name: "National Rubber Ducky Day", month: 0, day: 13 },
    { name: "Dress Up Your Pet Day", month: 0, day: 14 },
    { name: "National Hat Day", month: 0, day: 15 },
    { name: "National Popcorn Day", month: 0, day: 19 },
    { name: "Penguin Awareness Day", month: 0, day: 20 },
    { name: "National Hugging Day", month: 0, day: 21 },
    { name: "National Pie Day", month: 0, day: 23 },
    { name: "Library Shelfie Day", month: 0, day: 24 },
    { name: "Opposite Day", month: 0, day: 25 },
    { name: "National Puzzle Day", month: 0, day: 29 },
    { name: "National Backward Day", month: 0, day: 31 },

    // February
    { name: "National Bubble Gum Day", month: 1, day: 2 },
    { name: "Ice Cream for Breakfast Day", month: 1, day: 3 },
    { name: "National Weatherperson's Day", month: 1, day: 5 },
    { name: "National Chopsticks Day", month: 1, day: 6 },
    { name: "National Kite Flying Day", month: 1, day: 8 },
    { name: "National Pizza Day", month: 1, day: 9 },
    { name: "National Make a Friend Day", month: 1, day: 11 },
    { name: "National Clean Out Your Computer Day", month: 1, day: 12 },
    { name: "World Radio Day", month: 1, day: 13 },
    { name: "National Random Acts of Kindness Day", month: 1, day: 17 },
    { name: "National Grape Juice Day", month: 1, day: 18 },
    { name: "Love Your Pet Day", month: 1, day: 20 },
    { name: "National Muffin Day", month: 1, day: 20 },
    { name: "National Sticky Bun Day", month: 1, day: 21 },
    { name: "Play More Cards Day", month: 1, day: 22 },
    { name: "National Banana Bread Day", month: 1, day: 23 },
    { name: "National Tortilla Chip Day", month: 1, day: 24 },
    { name: "Tell a Fairy Tale Day", month: 1, day: 26 },
    { name: "National Strawberry Day", month: 1, day: 27 },
    { name: "National Tooth Fairy Day", month: 1, day: 28 },

    // March
    { name: "National Peanut Butter Lover's Day", month: 2, day: 1 },
    { name: "World Book Day", month: 2, day: 2 },
    { name: "National Grammar Day", month: 2, day: 4 },
    { name: "National Cereal Day", month: 2, day: 7 },
    { name: "International Women's Day", month: 2, day: 8 },
    { name: "National Napping Day", month: 2, day: 13 },
    { name: "National Pi Day", month: 2, day: 14 },
    { name: "World Sleep Day", month: 2, day: 15 },
    { name: "Absolutely Incredible Kid Day", month: 2, day: 21 },
    { name: "National Goof Off Day", month: 2, day: 22 },
    { name: "National Puppy Day", month: 2, day: 23 },
    { name: "Waffle Day", month: 2, day: 25 },
    { name: "Make Up Your Own Holiday Day", month: 2, day: 26 },
    { name: "National Pencil Day", month: 2, day: 30 },
    { name: "World Backup Day", month: 2, day: 31 },

    // April
    { name: "April Fool's Day", month: 3, day: 1 },
    { name: "International Children's Book Day", month: 3, day: 2 },
    { name: "National Walking Day", month: 3, day: 3 },
    { name: "National Deep Dish Pizza Day", month: 3, day: 5 },
    { name: "National Library Workers Day", month: 3, day: 9 },
    { name: "National Siblings Day", month: 3, day: 10 },
    { name: "National Grilled Cheese Day", month: 3, day: 12 },
    { name: "National Scrabble Day", month: 3, day: 13 },
    { name: "National Look-Alike Day", month: 3, day: 20 },
    { name: "National Kindergarten Day", month: 3, day: 21 },
    { name: "Earth Day", month: 3, day: 22 },
    { name: "National Take a Chance Day", month: 3, day: 23 },
    { name: "National Pretzel Day", month: 3, day: 26 },
    { name: "International Dance Day", month: 3, day: 29 },
    { name: "National Honesty Day", month: 3, day: 30 },

    // May
    { name: "May Day", month: 4, day: 1 },
    { name: "Star Wars Day", month: 4, day: 4 },
    { name: "Cinco de Mayo", month: 4, day: 5 },
    { name: "National No Homework Day", month: 4, day: 6 },
    { name: "Lost Sock Memorial Day", month: 4, day: 9 },
    { name: "Eat What You Want Day", month: 4, day: 11 },
    { name: "National Limerick Day", month: 4, day: 12 },
    { name: "International Hummus Day", month: 4, day: 13 },
    { name: "Dance Like a Chicken Day", month: 4, day: 14 },
    { name: "National Chocolate Chip Day", month: 4, day: 15 },
    { name: "National Pizza Party Day", month: 4, day: 17 },
    { name: "National Talk Like Yoda Day", month: 4, day: 21 },
    { name: "World Turtle Day", month: 4, day: 23 },
    { name: "National Scavenger Hunt Day", month: 4, day: 24 },
    { name: "National Brown-Bag-It Day", month: 4, day: 25 },
    { name: "National Paper Airplane Day", month: 4, day: 26 },

    // June
    { name: "National Doughnut Day", month: 5, day: 2 },
    { name: "National Yo-Yo Day", month: 5, day: 6 },
    { name: "World Oceans Day", month: 5, day: 8 },
    { name: "International Children's Day", month: 5, day: 9 },
    { name: "National Corn on the Cob Day", month: 5, day: 11 },
    { name: "World Juggling Day", month: 5, day: 15 },
    { name: "Eat Your Vegetables Day", month: 5, day: 17 },
    { name: "International Sushi Day", month: 5, day: 18 },
    { name: "International Picnic Day", month: 5, day: 18 },
    { name: "National Flip Flop Day", month: 5, day: 21 },
    { name: "World Music Day", month: 5, day: 21 },
    { name: "National Take Your Dog to Work Day", month: 5, day: 21 },
    { name: "International Fairy Day", month: 5, day: 24 },
    { name: "National Sunglasses Day", month: 5, day: 27 },
    { name: "International Mud Day", month: 5, day: 29 },

    // July
    { name: "International Joke Day", month: 6, day: 1 },
    { name: "World UFO Day", month: 6, day: 2 },
    { name: "National Macaroni Day", month: 6, day: 7 },
    { name: "World Chocolate Day", month: 6, day: 7 },
    { name: "National Video Game Day", month: 6, day: 8 },
    { name: "National Kitten Day", month: 6, day: 10 },
    { name: "World Population Day", month: 6, day: 11 },
    { name: "National French Fry Day", month: 6, day: 13 },
    { name: "Shark Awareness Day", month: 6, day: 14 },
    { name: "National Ice Cream Day", month: 6, day: 21 },
    { name: "World Emoji Day", month: 6, day: 17 },
    { name: "National Moon Day", month: 6, day: 20 },
    { name: "National Cousins Day", month: 6, day: 24 },
    { name: "International Day of Friendship", month: 6, day: 30 },

    // August
    { name: "National Root Beer Float Day", month: 7, day: 6 },
    { name: "International Cat Day", month: 7, day: 8 },
    { name: "Book Lovers Day", month: 7, day: 9 },
    { name: "National S'mores Day", month: 7, day: 10 },
    { name: "National Bowling Day", month: 7, day: 10 },
    { name: "National Relaxation Day", month: 7, day: 15 },
    { name: "National Tell a Joke Day", month: 7, day: 16 },
    { name: "World Photo Day", month: 7, day: 19 },
    { name: "National Radio Day", month: 7, day: 20 },
    { name: "National Banana Split Day", month: 7, day: 25 },
    { name: "National Dog Day", month: 7, day: 26 },
    { name: "International Bat Night", month: 7, day: 28 },

    // September
    { name: "World Beard Day", month: 8, day: 4 },
    { name: "National Read a Book Day", month: 8, day: 6 },
    { name: "National Grandparents Day", month: 8, day: 8 },
    { name: "National Video Games Day", month: 8, day: 12 },
    { name: "International Chocolate Day", month: 8, day: 13 },
    { name: "National Day of Encouragement", month: 8, day: 12 },
    { name: "Positive Thinking Day", month: 8, day: 13 }, // Now correctly September 13th
    { name: "National Talk Like a Pirate Day", month: 8, day: 19 },
    { name: "International Day of Peace", month: 8, day: 21 },
    { name: "World Gratitude Day", month: 8, day: 21 },
    { name: "Elephant Appreciation Day", month: 8, day: 22 },
    { name: "National Punctuation Day", month: 8, day: 24 },
    { name: "National Comic Book Day", month: 8, day: 25 },
    { name: "World Tourism Day", month: 8, day: 27 },

    // October
    { name: "International Coffee Day", month: 9, day: 1 },
    { name: "World Smile Day", month: 9, day: 4 },
    { name: "World Animal Day", month: 9, day: 4 },
    { name: "World Teachers' Day", month: 9, day: 5 },
    { name: "Mad Hatter Day", month: 9, day: 6 },
    { name: "World Octopus Day", month: 9, day: 8 },
    { name: "International Skeptics Day", month: 9, day: 13 },
    { name: "National Dessert Day", month: 9, day: 14 },
    { name: "World Food Day", month: 9, day: 16 },
    { name: "National Reptile Awareness Day", month: 9, day: 21 },
    { name: "International Snow Leopard Day", month: 9, day: 23 },
    { name: "National Cat Day", month: 9, day: 29 },
    { name: "National Candy Corn Day", month: 9, day: 30 },

    // November
    { name: "World Vegan Day", month: 10, day: 1 },
    { name: "National Sandwich Day", month: 10, day: 3 },
    { name: "National Candy Day", month: 10, day: 4 },
    { name: "World Science Day for Peace and Development", month: 10, day: 10 },
    { name: "World Kindness Day", month: 10, day: 13 },
    { name: "National Fast Food Day", month: 10, day: 16 },
    { name: "International Students' Day", month: 10, day: 17 },
    { name: "Mickey Mouse Birthday", month: 10, day: 18 },
    { name: "World Toilet Day", month: 10, day: 19 },
    { name: "Universal Children's Day", month: 10, day: 20 },
    { name: "National Cake Day", month: 10, day: 26 },
    { name: "National Day of Listening", month: 10, day: 29 },
    { name: "Computer Security Day", month: 10, day: 30 },

    // December
    { name: "Rosa Parks Day", month: 11, day: 1 },
    { name: "National Cookie Day", month: 11, day: 4 },
    { name: "International Volunteer Day", month: 11, day: 5 },
    { name: "Pretend To Be A Time Traveler Day", month: 11, day: 8 },
    { name: "National Brownie Day", month: 11, day: 8 },
    { name: "International Human Rights Day", month: 11, day: 10 },
    { name: "National Cocoa Day", month: 11, day: 13 },
    { name: "Monkey Day", month: 11, day: 14 },
    { name: "National Ugly Christmas Sweater Day", month: 11, day: 15 },
    { name: "International Tea Day", month: 11, day: 15 },
    { name: "Wright Brothers Day", month: 11, day: 17 },
    { name: "Crossword Puzzle Day", month: 11, day: 21 },
    { name: "Festivus", month: 11, day: 23 },
    { name: "National Eggnog Day", month: 11, day: 24 },
    { name: "No Interruptions Day", month: 11, day: 31 }
];