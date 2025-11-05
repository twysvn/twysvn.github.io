/**
 * Utility functions for the pizza application
 */

/**
 * Generate SVG layer ID from ingredient name
 * Normalizes ingredient names to match SVG layer IDs
 * @param {string} ingredientName - The ingredient name to normalize
 * @returns {string} The SVG layer ID
 */
export function generateLayerId(ingredientName) {
    return ingredientName.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/ /g, '-') + '-layer';
}

/**
 * Debounce function for search input
 * @param {Function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds
 * @returns {Function} The debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Fuzzy search matching
 * @param {string} needle - The search query
 * @param {string} haystack - The text to search in
 * @returns {boolean} True if matches
 */
export function fuzzyMatch(needle, haystack) {
    if (!needle || !haystack) return false;

    const searchLower = needle.toLowerCase();
    const textLower = haystack.toLowerCase();

    // Exact match or contains
    if (textLower.includes(searchLower)) return true;

    // Fuzzy match - all characters of needle must appear in order in haystack
    let needleIdx = 0;
    for (let i = 0; i < textLower.length && needleIdx < searchLower.length; i++) {
        if (textLower[i] === searchLower[needleIdx]) {
            needleIdx++;
        }
    }
    return needleIdx === searchLower.length;
}

/**
 * Calculate match score for ranking search results
 * @param {string} query - The search query
 * @param {string} text - The text to match against
 * @returns {number} Match score (higher is better)
 */
export function calculateMatchScore(query, text) {
    if (!query || !text) return 0;

    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();

    // Exact match: highest score
    if (textLower === queryLower) return 100;

    // Starts with: high score
    if (textLower.startsWith(queryLower)) return 80;

    // Contains: medium score
    if (textLower.includes(queryLower)) return 60;

    // Fuzzy match: lower score
    if (fuzzyMatch(query, text)) return 30;

    return 0;
}

/**
 * Show error message to user
 * @param {string} message - The error message
 * @param {HTMLElement} container - The container to show error in
 */
export function showError(message, container) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    container.innerHTML = '';
    container.appendChild(errorDiv);
}

/**
 * Show loading state
 * @param {HTMLElement} container - The container to show loading in
 * @param {string} message - Optional loading message
 */
export function showLoading(container, message = 'Loading...') {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.textContent = message;
    container.innerHTML = '';
    container.appendChild(loadingDiv);
}

/**
 * Clear element content
 * @param {HTMLElement} element - The element to clear
 */
export function clearElement(element) {
    if (element) {
        element.innerHTML = '';
    }
}

/**
 * Create HTML element with attributes
 * @param {string} tag - The HTML tag name
 * @param {Object} attributes - Object of attribute key-value pairs
 * @param {string} content - Optional text content
 * @returns {HTMLElement} The created element
 */
export function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);

    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else {
            element.setAttribute(key, value);
        }
    });

    if (content) {
        element.textContent = content;
    }

    return element;
}

/**
 * Safely get nested property from object
 * @param {Object} obj - The object to get property from
 * @param {string} path - Dot notation path (e.g., 'restaurant.name')
 * @param {*} defaultValue - Default value if property doesn't exist
 * @returns {*} The property value or default value
 */
export function getProperty(obj, path, defaultValue = null) {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
            result = result[key];
        } else {
            return defaultValue;
        }
    }

    return result;
}
