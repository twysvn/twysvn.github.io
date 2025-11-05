/**
 * SearchEngine - Handles search functionality for restaurants and pizzas
 */

import { fuzzyMatch, calculateMatchScore } from './utils.js';

export class SearchEngine {
    constructor(dataLoader) {
        this.dataLoader = dataLoader;
    }

    /**
     * Search for restaurants
     * @param {string} query - The search query
     * @returns {Array} Array of matching restaurants with scores
     */
    searchRestaurants(query) {
        if (!query || query.trim().length < 2) {
            return [];
        }

        const restaurants = this.dataLoader.getAllRestaurants();
        const results = [];

        restaurants.forEach(restaurant => {
            let maxScore = 0;

            // Search in restaurant name
            const nameScore = calculateMatchScore(query, restaurant.name);
            maxScore = Math.max(maxScore, nameScore);

            // Search in display name
            if (restaurant.displayName) {
                const displayNameScore = calculateMatchScore(query, restaurant.displayName);
                maxScore = Math.max(maxScore, displayNameScore);
            }

            // Search in location
            if (restaurant.location) {
                const locationScore = calculateMatchScore(query, restaurant.location) * 0.8;
                maxScore = Math.max(maxScore, locationScore);
            }

            // Search in tags
            if (restaurant.tags) {
                restaurant.tags.forEach(tag => {
                    const tagScore = calculateMatchScore(query, tag) * 0.6;
                    maxScore = Math.max(maxScore, tagScore);
                });
            }

            if (maxScore > 0) {
                results.push({
                    restaurant,
                    score: maxScore,
                    type: 'restaurant'
                });
            }
        });

        // Sort by score (highest first)
        return results.sort((a, b) => b.score - a.score);
    }

    /**
     * Search for pizzas in current restaurant
     * @param {string} query - The search query
     * @returns {Array} Array of matching pizzas with scores
     */
    searchPizzasInCurrentRestaurant(query) {
        if (!query || query.trim().length < 2) {
            return [];
        }

        const restaurantData = this.dataLoader.getCurrentRestaurantData();
        if (!restaurantData) {
            return [];
        }

        return this.searchPizzasInRestaurantData(query, restaurantData, this.dataLoader.getCurrentRestaurantId());
    }

    /**
     * Search for pizzas across all restaurants
     * @param {string} query - The search query
     * @returns {Promise<Array>} Array of matching pizzas with scores
     */
    async searchPizzasGlobally(query) {
        if (!query || query.trim().length < 2) {
            return [];
        }

        const restaurants = this.dataLoader.getAllRestaurants();
        const allResults = [];

        for (const restaurant of restaurants) {
            try {
                // Load restaurant data if not already loaded
                const restaurantData = await this.dataLoader.loadRestaurantData(restaurant.id);
                const results = this.searchPizzasInRestaurantData(query, restaurantData, restaurant.id);
                allResults.push(...results);
            } catch (error) {
                console.error(`Error searching pizzas in ${restaurant.id}:`, error);
            }
        }

        // Sort by score (highest first)
        return allResults.sort((a, b) => b.score - a.score);
    }

    /**
     * Search pizzas in specific restaurant data
     * @param {string} query - The search query
     * @param {Object} restaurantData - The restaurant data
     * @param {string} restaurantId - The restaurant ID
     * @returns {Array} Array of matching pizzas
     */
    searchPizzasInRestaurantData(query, restaurantData, restaurantId) {
        const results = [];
        const pizzas = restaurantData.pizzas || [];

        pizzas.forEach(pizza => {
            let maxScore = 0;

            // Search in pizza name
            const nameScore = calculateMatchScore(query, pizza.name);
            maxScore = Math.max(maxScore, nameScore);

            // Search in description
            if (pizza.description) {
                const descScore = calculateMatchScore(query, pizza.description) * 0.7;
                maxScore = Math.max(maxScore, descScore);
            }

            // Search in ingredients
            if (pizza.ingredients) {
                pizza.ingredients.forEach(ingredientId => {
                    const ingredient = this.getIngredientById(ingredientId, restaurantData);
                    if (ingredient && ingredient.name) {
                        const ingScore = calculateMatchScore(query, ingredient.name) * 0.5;
                        maxScore = Math.max(maxScore, ingScore);
                    }
                });
            }

            // Search in tags
            if (pizza.tags) {
                pizza.tags.forEach(tag => {
                    const tagScore = calculateMatchScore(query, tag) * 0.6;
                    maxScore = Math.max(maxScore, tagScore);
                });
            }

            if (maxScore > 0) {
                results.push({
                    pizza,
                    restaurantId,
                    restaurantName: restaurantData.restaurant.name,
                    score: maxScore,
                    type: 'pizza'
                });
            }
        });

        return results;
    }

    /**
     * Search by ingredient name
     * @param {string} query - The ingredient name to search for
     * @returns {Array} Array of pizzas containing the ingredient
     */
    searchByIngredient(query) {
        if (!query || query.trim().length < 2) {
            return [];
        }

        const restaurantData = this.dataLoader.getCurrentRestaurantData();
        if (!restaurantData) {
            return [];
        }

        const results = [];
        const pizzas = restaurantData.pizzas || [];

        pizzas.forEach(pizza => {
            if (pizza.ingredients) {
                const hasIngredient = pizza.ingredients.some(ingredientId => {
                    const ingredient = this.getIngredientById(ingredientId, restaurantData);
                    return ingredient && fuzzyMatch(query, ingredient.name);
                });

                if (hasIngredient) {
                    results.push({
                        pizza,
                        restaurantId: this.dataLoader.getCurrentRestaurantId(),
                        restaurantName: restaurantData.restaurant.name,
                        score: 50,
                        type: 'pizza'
                    });
                }
            }
        });

        return results;
    }

    /**
     * Filter results by tags
     * @param {Array} items - Items to filter (restaurants or pizzas)
     * @param {Array<string>} tags - Tags to filter by
     * @returns {Array} Filtered items
     */
    filterByTags(items, tags) {
        if (!tags || tags.length === 0) {
            return items;
        }

        return items.filter(item => {
            const itemTags = item.restaurant?.tags || item.pizza?.tags || [];
            return tags.some(tag => itemTags.includes(tag));
        });
    }

    /**
     * Get ingredient by ID from restaurant data
     * @param {string} ingredientId - The ingredient ID
     * @param {Object} restaurantData - The restaurant data
     * @returns {Object|null} Ingredient object
     */
    getIngredientById(ingredientId, restaurantData) {
        const categories = restaurantData.ingredients?.categories || {};

        for (const category of Object.values(categories)) {
            const found = category.items?.find(item => item.id === ingredientId);
            if (found) {
                return found;
            }
        }

        return null;
    }

    /**
     * Get popular tags from all restaurants
     * @returns {Array<string>} Array of popular tags
     */
    getPopularTags() {
        const tagCounts = {};
        const restaurants = this.dataLoader.getAllRestaurants();

        restaurants.forEach(restaurant => {
            if (restaurant.tags) {
                restaurant.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });

        // Sort tags by frequency
        return Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([tag]) => tag);
    }
}
