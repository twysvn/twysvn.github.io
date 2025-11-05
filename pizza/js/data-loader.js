/**
 * DataLoader - Handles loading and caching of restaurant data
 */

import { getProperty } from './utils.js';

export class DataLoader {
    constructor() {
        this.cache = new Map();
        this.restaurantsList = null;
        this.currentRestaurant = null;
        this.currentRestaurantData = null;
    }

    /**
     * Initialize the data loader by loading the restaurants list
     * @returns {Promise<Array>} List of restaurants
     */
    async initialize() {
        try {
            this.restaurantsList = await this.loadRestaurantsList();
            return this.restaurantsList;
        } catch (error) {
            console.error('Failed to initialize DataLoader:', error);
            throw new Error('Failed to load restaurants list');
        }
    }

    /**
     * Load the list of available restaurants
     * @returns {Promise<Array>} List of restaurants
     */
    async loadRestaurantsList() {
        if (this.restaurantsList) {
            return this.restaurantsList;
        }

        try {
            const response = await fetch('data/restaurants.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.restaurantsList = data.restaurants.filter(r => r.enabled);
            return this.restaurantsList;
        } catch (error) {
            console.error('Error loading restaurants list:', error);
            throw error;
        }
    }

    /**
     * Load data for a specific restaurant
     * @param {string} restaurantId - The restaurant ID
     * @returns {Promise<Object>} Restaurant data
     */
    async loadRestaurantData(restaurantId) {
        // Check cache first
        if (this.cache.has(restaurantId)) {
            const cached = this.cache.get(restaurantId);
            this.currentRestaurant = restaurantId;
            this.currentRestaurantData = cached;
            return cached;
        }

        try {
            // Find restaurant in list
            const restaurant = this.getRestaurantById(restaurantId);
            if (!restaurant) {
                throw new Error(`Restaurant ${restaurantId} not found`);
            }

            // Load restaurant data
            const response = await fetch(`data/${restaurant.dataFile}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Validate data structure
            if (!data.restaurant || !data.ingredients || !data.pizzas) {
                throw new Error('Invalid restaurant data structure');
            }

            // Cache the data
            this.cache.set(restaurantId, data);
            this.currentRestaurant = restaurantId;
            this.currentRestaurantData = data;

            return data;
        } catch (error) {
            console.error(`Error loading restaurant data for ${restaurantId}:`, error);
            throw error;
        }
    }

    /**
     * Get restaurant metadata by ID
     * @param {string} restaurantId - The restaurant ID
     * @returns {Object|null} Restaurant metadata
     */
    getRestaurantById(restaurantId) {
        if (!this.restaurantsList) {
            return null;
        }
        return this.restaurantsList.find(r => r.id === restaurantId) || null;
    }

    /**
     * Get current restaurant ID
     * @returns {string|null} Current restaurant ID
     */
    getCurrentRestaurantId() {
        return this.currentRestaurant;
    }

    /**
     * Get current restaurant data
     * @returns {Object|null} Current restaurant data
     */
    getCurrentRestaurantData() {
        return this.currentRestaurantData;
    }

    /**
     * Get all restaurants metadata
     * @returns {Array} List of restaurants
     */
    getAllRestaurants() {
        return this.restaurantsList || [];
    }

    /**
     * Get ingredient by ID from current restaurant
     * @param {string} ingredientId - The ingredient ID
     * @returns {Object|null} Ingredient data
     */
    getIngredientById(ingredientId) {
        if (!this.currentRestaurantData) {
            return null;
        }

        const categories = getProperty(this.currentRestaurantData, 'ingredients.categories', {});

        for (const category of Object.values(categories)) {
            const found = category.items?.find(item => item.id === ingredientId);
            if (found) {
                return found;
            }
        }

        return null;
    }

    /**
     * Get all ingredients from current restaurant
     * @returns {Array} List of all ingredients
     */
    getAllIngredients() {
        if (!this.currentRestaurantData) {
            return [];
        }

        const categories = getProperty(this.currentRestaurantData, 'ingredients.categories', {});
        const allIngredients = [];

        for (const category of Object.values(categories)) {
            if (category.items) {
                allIngredients.push(...category.items);
            }
        }

        return allIngredients;
    }

    /**
     * Get pizza by ID from current restaurant
     * @param {string} pizzaId - The pizza ID
     * @returns {Object|null} Pizza data
     */
    getPizzaById(pizzaId) {
        if (!this.currentRestaurantData) {
            return null;
        }

        return this.currentRestaurantData.pizzas.find(p => p.id === pizzaId) || null;
    }

    /**
     * Get all pizzas from current restaurant
     * @returns {Array} List of pizzas
     */
    getAllPizzas() {
        if (!this.currentRestaurantData) {
            return [];
        }

        return this.currentRestaurantData.pizzas || [];
    }

    /**
     * Clear cache for a specific restaurant or all restaurants
     * @param {string} [restaurantId] - Optional restaurant ID to clear
     */
    clearCache(restaurantId = null) {
        if (restaurantId) {
            this.cache.delete(restaurantId);
        } else {
            this.cache.clear();
        }
    }

    /**
     * Preload multiple restaurants for better performance
     * @param {Array<string>} restaurantIds - Array of restaurant IDs to preload
     * @returns {Promise<void>}
     */
    async preloadRestaurants(restaurantIds) {
        const promises = restaurantIds.map(id =>
            this.loadRestaurantData(id).catch(err =>
                console.warn(`Failed to preload ${id}:`, err)
            )
        );
        await Promise.all(promises);
    }
}
