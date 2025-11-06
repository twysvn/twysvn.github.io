/**
 * UIController - Manages all UI interactions and rendering
 */

import { generateLayerId, debounce, createElement, clearElement, showLoading, showError } from './utils.js';

export class UIController {
    constructor(dataLoader, visualizer, searchEngine) {
        this.dataLoader = dataLoader;
        this.visualizer = visualizer;
        this.searchEngine = searchEngine;
        this.currentSelectedIngredients = [];

        // Debounced search function
        this.handleSearchDebounced = debounce(this.handleSearch.bind(this), 300);
    }

    /**
     * Initialize the UI
     */
    async initialize() {
        try {
            // Initialize data loader
            await this.dataLoader.initialize();

            // Initialize visualizer
            this.visualizer.initialize();

            // Setup UI elements
            this.setupSearch();
            this.setupRestaurantSelector();

            // Load default restaurant
            const defaultRestaurant = 'issing';
            await this.switchRestaurant(defaultRestaurant);

        } catch (error) {
            console.error('Failed to initialize UI:', error);
            showError('Failed to load application. Please refresh the page.', document.body);
        }
    }

    /**
     * Setup search functionality
     */
    setupSearch() {
        const searchInput = document.getElementById('search-input');
        const searchClear = document.querySelector('.search-clear');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value;

                // Show/hide clear button
                if (searchClear) {
                    searchClear.classList.toggle('visible', query.length > 0);
                }

                // Perform search
                this.handleSearchDebounced(query);
            });
        }

        if (searchClear) {
            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                searchClear.classList.remove('visible');
                this.hideSearchResults();
            });
        }
    }

    /**
     * Handle search input
     */
    async handleSearch(query) {
        if (!query || query.trim().length < 2) {
            this.hideSearchResults();
            return;
        }

        const resultsContainer = document.querySelector('.search-results');
        if (!resultsContainer) return;

        // Search restaurants and pizzas
        const restaurantResults = this.searchEngine.searchRestaurants(query);
        const pizzaResults = this.searchEngine.searchPizzasInCurrentRestaurant(query);

        // Render results
        this.renderSearchResults(restaurantResults, pizzaResults);
        resultsContainer.classList.add('visible');
    }

    /**
     * Render search results
     */
    renderSearchResults(restaurantResults, pizzaResults) {
        const resultsContainer = document.querySelector('.search-results');
        if (!resultsContainer) return;

        clearElement(resultsContainer);

        // Show restaurants prominently
        if (restaurantResults.length > 0) {
            const section = createElement('div', { className: 'search-results-section restaurant-section' });
            const header = createElement('div', { className: 'search-results-header' });
            const icon = document.createElement('i');
            icon.className = 'ph ph-storefront';
            header.appendChild(icon);
            header.appendChild(document.createTextNode(' Switch Restaurant'));
            section.appendChild(header);

            restaurantResults.slice(0, 5).forEach(result => {
                const restaurant = result.restaurant;
                const subtitle = `${restaurant.location} • ${restaurant.pizzaCount || 0} pizzas`;

                const item = this.createSearchResultItem(
                    restaurant.displayName || restaurant.name,
                    subtitle,
                    restaurant.tags,
                    () => this.switchRestaurant(restaurant.id)
                );
                item.classList.add('restaurant-result-item');
                section.appendChild(item);
            });

            resultsContainer.appendChild(section);
        }

        // Show pizzas
        if (pizzaResults.length > 0) {
            const section = createElement('div', { className: 'search-results-section' });
            const header = createElement('div', { className: 'search-results-header' });
            const icon = document.createElement('i');
            icon.className = 'ph ph-pizza';
            header.appendChild(icon);
            header.appendChild(document.createTextNode(' Pizzas'));
            section.appendChild(header);

            pizzaResults.slice(0, 10).forEach(result => {
                const ingredientsText = result.pizza.ingredients
                    .map(id => {
                        const ing = this.dataLoader.getIngredientById(id);
                        return ing ? ing.name : id;
                    })
                    .join(', ');

                const item = this.createSearchResultItem(
                    result.pizza.name,
                    ingredientsText,
                    result.pizza.tags,
                    () => this.selectPizza(result.pizza)
                );
                section.appendChild(item);
            });

            resultsContainer.appendChild(section);
        }

        // Show no results message
        if (restaurantResults.length === 0 && pizzaResults.length === 0) {
            resultsContainer.appendChild(
                createElement('div', { className: 'search-no-results' }, 'No results found')
            );
        }
    }

    /**
     * Create a search result item
     */
    createSearchResultItem(title, subtitle, tags, onClick) {
        const item = createElement('div', { className: 'search-result-item' });
        item.addEventListener('click', () => {
            onClick();
            this.hideSearchResults();
        });

        const titleEl = createElement('div', { className: 'search-result-item-title' }, title);
        item.appendChild(titleEl);

        if (subtitle) {
            const subtitleEl = createElement('div', { className: 'search-result-item-subtitle' }, subtitle);
            item.appendChild(subtitleEl);
        }

        if (tags && tags.length > 0) {
            const tagsContainer = createElement('div', { className: 'search-result-item-tags' });
            tags.slice(0, 3).forEach(tag => {
                tagsContainer.appendChild(createElement('span', { className: 'search-result-tag' }, tag));
            });
            item.appendChild(tagsContainer);
        }

        return item;
    }

    /**
     * Hide search results
     */
    hideSearchResults() {
        const resultsContainer = document.querySelector('.search-results');
        if (resultsContainer) {
            resultsContainer.classList.remove('visible');
        }
    }

    /**
     * Setup restaurant selector
     */
    setupRestaurantSelector() {
        const menuButtons = document.getElementById('menu-buttons');
        if (!menuButtons) return;

        clearElement(menuButtons);

        // Create dropdown button
        const dropdownButton = createElement('button', {
            className: 'restaurant-selector-btn',
            id: 'restaurant-selector-btn'
        });

        const icon = document.createElement('i');
        icon.className = 'ph ph-storefront';
        dropdownButton.appendChild(icon);

        const label = createElement('span', { id: 'current-restaurant-label' }, 'Select Restaurant');
        dropdownButton.appendChild(label);

        const chevron = document.createElement('i');
        chevron.className = 'ph ph-caret-down';
        dropdownButton.appendChild(chevron);

        // Create backdrop for mobile
        const backdrop = createElement('div', {
            className: 'dropdown-backdrop',
            id: 'dropdown-backdrop'
        });

        // Create dropdown menu
        const dropdown = createElement('div', {
            className: 'restaurant-dropdown',
            id: 'restaurant-dropdown'
        });

        // Group restaurants by region
        const restaurants = this.dataLoader.getAllRestaurants();
        const grouped = {};
        restaurants.forEach(r => {
            const key = r.country;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(r);
        });

        // Render grouped restaurants
        Object.keys(grouped).sort().forEach(country => {
            const regionHeader = createElement('div', { className: 'dropdown-region-header' }, country);
            dropdown.appendChild(regionHeader);

            grouped[country].forEach(restaurant => {
                const item = createElement('div', { className: 'dropdown-item' });
                item.dataset.restaurantId = restaurant.id;

                const nameDiv = createElement('div', { className: 'dropdown-item-name' });
                nameDiv.textContent = restaurant.displayName || restaurant.name;
                item.appendChild(nameDiv);

                const metaDiv = createElement('div', { className: 'dropdown-item-meta' });
                metaDiv.textContent = `${restaurant.region} • ${restaurant.pizzaCount || 0} pizzas`;
                item.appendChild(metaDiv);

                item.addEventListener('click', () => {
                    this.switchRestaurant(restaurant.id);
                    dropdown.classList.remove('visible');
                    backdrop.classList.remove('visible');
                });

                dropdown.appendChild(item);
            });
        });

        // Toggle dropdown
        dropdownButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = dropdown.classList.toggle('visible');
            backdrop.classList.toggle('visible', isVisible);
        });

        // Close dropdown when clicking backdrop
        backdrop.addEventListener('click', () => {
            dropdown.classList.remove('visible');
            backdrop.classList.remove('visible');
        });

        // Close dropdown when clicking outside (desktop)
        // Remove previous document click handler if it exists
        if (this._restaurantDropdownDocumentClickHandler) {
            document.removeEventListener('click', this._restaurantDropdownDocumentClickHandler);
        }
        // Create and store the new handler
        this._restaurantDropdownDocumentClickHandler = (e) => {
            if (!dropdown.contains(e.target) && !dropdownButton.contains(e.target) && !backdrop.contains(e.target)) {
                dropdown.classList.remove('visible');
                backdrop.classList.remove('visible');
            }
        };
        document.addEventListener('click', this._restaurantDropdownDocumentClickHandler);

        menuButtons.appendChild(dropdownButton);
        menuButtons.appendChild(backdrop);
        menuButtons.appendChild(dropdown);
    }

    /**
     * Switch to a different restaurant
     */
    async switchRestaurant(restaurantId) {
        try {
            // Show loading
            const container = document.getElementById('ingredients-container');
            if (container) showLoading(container);

            // Load restaurant data
            await this.dataLoader.loadRestaurantData(restaurantId);

            // Update dropdown button label
            const restaurant = this.dataLoader.getRestaurantById(restaurantId);
            const label = document.getElementById('current-restaurant-label');
            if (label && restaurant) {
                label.textContent = restaurant.name;
            }

            // Update active dropdown item
            document.querySelectorAll('.dropdown-item').forEach(item => {
                item.classList.toggle('active', item.dataset.restaurantId === restaurantId);
            });

            // Clear current selection
            this.currentSelectedIngredients = [];
            this.visualizer.clearPizza();

            // Render UI
            this.renderIngredientSelector();
            this.renderPizzaList();
            this.updateCustomPizzaDisplay();

            // Hide search results
            this.hideSearchResults();

        } catch (error) {
            console.error(`Failed to switch to restaurant ${restaurantId}:`, error);
            showError(`Failed to load restaurant data`, document.getElementById('ingredients-container'));
        }
    }

    /**
     * Render ingredient selector
     */
    renderIngredientSelector() {
        const container = document.getElementById('ingredients-container');
        if (!container) return;

        clearElement(container);

        const restaurantData = this.dataLoader.getCurrentRestaurantData();
        if (!restaurantData) return;

        const categories = restaurantData.ingredients.categories;

        // Sort categories by order
        const sortedCategories = Object.entries(categories)
            .sort((a, b) => (a[1].order || 0) - (b[1].order || 0));

        sortedCategories.forEach(([categoryId, category]) => {
            const section = createElement('div', { className: 'section' });

            // Map category IDs to Phosphor icons
            const categoryIcons = {
                'sauce': 'bowl-food',
                'cheese': 'cheese',
                'meat': 'hamburger',
                'vegetable': 'leaf',
                'topping': 'sparkle',
                'extras': 'plus-circle'
            };

            const heading = createElement('h2', {});
            const icon = document.createElement('i');
            icon.className = `ph ph-${categoryIcons[categoryId] || 'circle'}`;
            heading.appendChild(icon);
            heading.appendChild(document.createTextNode(' ' + category.name));
            section.appendChild(heading);

            const ingredientsDiv = createElement('div', { className: 'ingredients' });

            category.items.forEach(ingredient => {
                const label = createElement('label', { className: 'ingredient' });

                const checkbox = createElement('input', {
                    type: 'checkbox',
                    value: ingredient.name,
                    dataset: { ingredientId: ingredient.id, svgLayer: ingredient.svgLayer }
                });

                checkbox.addEventListener('change', (e) => {
                    this.handleIngredientToggle(
                        ingredient.id,
                        ingredient.name,
                        ingredient.svgLayer,
                        e.target.checked
                    );
                });

                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(ingredient.name));
                ingredientsDiv.appendChild(label);
            });

            section.appendChild(ingredientsDiv);
            container.appendChild(section);
        });
    }

    /**
     * Handle ingredient toggle
     */
    handleIngredientToggle(ingredientId, ingredientName, svgLayer, isChecked) {
        // Update selected ingredients list
        if (isChecked) {
            if (!this.currentSelectedIngredients.includes(ingredientName)) {
                this.currentSelectedIngredients.push(ingredientName);
            }
        } else {
            this.currentSelectedIngredients = this.currentSelectedIngredients.filter(i => i !== ingredientName);
        }

        // Update visualization
        if (isChecked) {
            this.visualizer.showIngredient(svgLayer);
        } else {
            this.visualizer.hideIngredient(svgLayer);
        }

        // Update display
        this.updateCustomPizzaDisplay();
        this.findAndDisplayClosestPizza();
    }

    /**
     * Update custom pizza display
     */
    updateCustomPizzaDisplay() {
        const resultContainer = document.getElementById('result');
        if (!resultContainer) return;

        if (this.currentSelectedIngredients.length === 0) {
            resultContainer.innerHTML = '<h2>Select ingredients to create your pizza</h2>';
            return;
        }

        const pizzaName = `Custom ${this.currentSelectedIngredients.length}-Ingredient Pizza`;
        resultContainer.innerHTML = `
            <h2>${pizzaName}</h2>
            <p>${this.currentSelectedIngredients.join(', ')}</p>
        `;
    }

    /**
     * Find and display closest pizza match
     */
    findAndDisplayClosestPizza() {
        const closestMatchContainer = document.getElementById('closest-match');
        if (!closestMatchContainer) return;

        if (this.currentSelectedIngredients.length === 0) {
            closestMatchContainer.style.display = 'none';
            this.removeClosestPizzaHighlight();
            return;
        }

        const pizzas = this.dataLoader.getAllPizzas();
        let closestPizza = null;
        let maxMatches = 0;
        let additionalIngredients = [];
        let missingIngredients = [];

        pizzas.forEach(pizza => {
            // Get ingredient names for this pizza
            const pizzaIngredientNames = pizza.ingredients
                .map(id => {
                    const ing = this.dataLoader.getIngredientById(id);
                    return ing ? ing.name : null;
                })
                .filter(name => name !== null);

            const matches = this.currentSelectedIngredients.filter(ing =>
                pizzaIngredientNames.includes(ing)
            ).length;

            if (matches > maxMatches) {
                maxMatches = matches;
                closestPizza = pizza;
                additionalIngredients = pizzaIngredientNames.filter(ing =>
                    !this.currentSelectedIngredients.includes(ing)
                );
                missingIngredients = this.currentSelectedIngredients.filter(ing =>
                    !pizzaIngredientNames.includes(ing)
                );
            }
        });

        if (closestPizza && maxMatches > 0) {
            closestMatchContainer.innerHTML = `
                <h2><i class="ph ph-target"></i> Closest Pizza: ${closestPizza.name}</h2>
                <p><i class="ph ph-plus-circle"></i> Add: ${missingIngredients.join(', ') || 'None'}</p>
                <p><i class="ph ph-minus-circle"></i> Remove: ${additionalIngredients.join(', ') || 'None'}</p>
            `;
            closestMatchContainer.style.display = 'block';
            this.highlightClosestPizza(closestPizza.name);
        } else {
            closestMatchContainer.innerHTML = '<p><i class="ph ph-info"></i> No close matches found.</p>';
            closestMatchContainer.style.display = 'none';
            this.removeClosestPizzaHighlight();
        }
    }

    /**
     * Highlight closest pizza in list
     */
    highlightClosestPizza(pizzaName) {
        document.querySelectorAll('.pizza-item').forEach(pizzaDiv => {
            if (pizzaDiv.getAttribute('data-pizza-name') === pizzaName) {
                pizzaDiv.classList.add('highlight');
            } else {
                pizzaDiv.classList.remove('highlight');
            }
        });
    }

    /**
     * Remove pizza highlight
     */
    removeClosestPizzaHighlight() {
        document.querySelectorAll('.pizza-item').forEach(pizzaDiv => {
            pizzaDiv.classList.remove('highlight');
        });
    }

    /**
     * Render pizza list
     */
    renderPizzaList() {
        const container = document.getElementById('all-pizzas');
        if (!container) return;

        clearElement(container);

        const heading = createElement('h2', {});
        const icon = document.createElement('i');
        icon.className = 'ph ph-list-bullets';
        heading.appendChild(icon);
        heading.appendChild(document.createTextNode(' All Pizza Combinations'));
        container.appendChild(heading);

        const pizzas = this.dataLoader.getAllPizzas();

        pizzas.forEach(pizza => {
            const ingredientNames = pizza.ingredients
                .map(id => {
                    const ing = this.dataLoader.getIngredientById(id);
                    return ing ? ing.name : id;
                })
                .join(', ');

            const pizzaDiv = createElement('div', {
                className: 'pizza-item',
                dataset: { pizzaName: pizza.name }
            });

            pizzaDiv.innerHTML = `<h3>${pizza.name}</h3><p>${ingredientNames}</p>`;

            pizzaDiv.addEventListener('click', () => {
                this.selectPizza(pizza);
            });

            container.appendChild(pizzaDiv);
        });
    }

    /**
     * Select a pizza and display its ingredients
     */
    selectPizza(pizza) {
        // Get ingredient details
        const ingredientDetails = pizza.ingredients
            .map(id => this.dataLoader.getIngredientById(id))
            .filter(ing => ing !== null);

        // Check if all ingredients are available
        const missingIngredients = ingredientDetails.filter(ing =>
            !document.querySelector(`input[data-ingredient-id="${ing.id}"]`)
        );

        if (missingIngredients.length > 0) {
            alert(`Missing ingredients: ${missingIngredients.map(i => i.name).join(', ')}`);
            return;
        }

        // Clear all checkboxes first
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Clear current selection
        this.currentSelectedIngredients = [];
        this.visualizer.clearPizza();

        // Select ingredients for this pizza
        ingredientDetails.forEach(ingredient => {
            const checkbox = document.querySelector(`input[data-ingredient-id="${ingredient.id}"]`);
            if (checkbox) {
                checkbox.checked = true;
                this.currentSelectedIngredients.push(ingredient.name);
                this.visualizer.showIngredient(ingredient.svgLayer);
            }
        });

        // Update display
        this.updateCustomPizzaDisplay();
        this.findAndDisplayClosestPizza();

        // Scroll to pizza visualizer
        document.getElementById('pizza-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}
