// js/date-utils.js

// --- TEST DATE OVERRIDE ---
// Set to a string like "YYYY-MM-DD" (e.g., "2024-12-25") to test a specific date.
// Set to null to use the actual current date.
const TEST_DATE_OVERRIDE = null; // <--- MODIFY THIS LINE FOR TESTING

// --- DATE UTILITIES ---

function getCurrentDateParts() {
    let now;
    if (TEST_DATE_OVERRIDE) {
        // Ensure the date string is parsed correctly, ideally at the start of the day in local time.
        // Appending 'T00:00:00' helps ensure it's treated as local midnight.
        now = new Date(TEST_DATE_OVERRIDE + "T00:00:00");
        if (isNaN(now.getTime())) { // Check if the date string was invalid
            console.error(`Invalid TEST_DATE_OVERRIDE format: "${TEST_DATE_OVERRIDE}". Using current date.`);
            now = new Date();
        }
    } else {
        now = new Date();
    }

    return {
        year: now.getFullYear(),
        month: now.getMonth(), // 0-11 (Jan-Dec)
        day: now.getDate(),    // 1-31
        dayOfWeek: now.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
    };
}

/**
 * Calculates the date for the Nth specific weekday of a given month and year.
 * @param {number} year - The full year (e.g., 2024).
 * @param {number} month - The month (0 for January, 11 for December).
 * @param {number} dayOfWeek - The day of the week (0 for Sunday, 1 for Monday, ..., 6 for Saturday).
 * @param {number} n - The occurrence of the weekday (e.g., 1 for 1st, 2 for 2nd).
 * @returns {Date|null} The date object or null if not found.
 */
function getNthWeekdayOfMonth(year, month, dayOfWeek, n) {
    const date = new Date(year, month, 1);
    let occurrences = 0;

    while (date.getMonth() === month) {
        if (date.getDay() === dayOfWeek) {
            occurrences++;
            if (occurrences === n) {
                return new Date(date); // Return a new Date object to avoid modifying the original
            }
        }
        date.setDate(date.getDate() + 1);
    }
    return null; // Nth weekday not found in the month
}

/**
 * Calculates the date for the last specific weekday of a given month and year.
 * @param {number} year - The full year.
 * @param {number} month - The month (0-11).
 * @param {number} dayOfWeek - The day of the week (0-6).
 * @returns {Date|null} The date object or null if not found.
 */
function getLastWeekdayOfMonth(year, month, dayOfWeek) {
    const date = new Date(year, month + 1, 0); // Last day of the given month
    while (date.getDay() !== dayOfWeek) {
        date.setDate(date.getDate() - 1);
        if (date.getMonth() !== month) return null; // Should not happen if logic is correct
    }
    return new Date(date); // Return a new Date object
}


function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Checks if a date falls within a given range (inclusive).
 * Compares only the date part, ignoring time.
 * @param {Date} checkDate - The date to check.
 * @param {Date} startDate - The start of the range.
 * @param {Date} endDate - The end of the range.
 * @returns {boolean}
 */
function isDateInRange(checkDate, startDate, endDate) {
    // Ensure all dates are valid before comparison
    if (!checkDate || !startDate || !endDate || 
        isNaN(checkDate.getTime()) || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error("Invalid date provided to isDateInRange:", { checkDate, startDate, endDate });
        return false;
    }

    const c = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
    const s = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const e = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    return c >= s && c <= e;
}

/**
 * Calculates the date of Easter Sunday for a given year using the Meeus/Jones/Butcher algorithm.
 * @param {number} year - The full year (e.g., 2024).
 * @returns {Date|null} The Date object for Easter Sunday or null if calculation fails.
 */
function getEasterSunday(year) {
    if (year < 1583) {
        console.warn("Easter calculation is for Gregorian calendar (1583 onwards). May not be accurate for earlier years.");
        // For simplicity, we'll allow it to proceed but with a warning.
        // If strictness is needed, return null here for years < 1583.
    }
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // Month is 0-indexed
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    return new Date(year, month, day);
}