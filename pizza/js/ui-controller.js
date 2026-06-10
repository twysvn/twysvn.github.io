/**
 * UIController - Manages all UI interactions and rendering
 */

import { debounce, createElement, clearElement, showSkeleton, showError, showToast } from './utils.js';

export class UIController {
    constructor(dataLoader, visualizer, searchEngine) {
        this.dataLoader = dataLoader;
        this.visualizer = visualizer;
        this.searchEngine = searchEngine;

        // Selected ingredients as objects: { id, name, svgLayer }
        this.currentSelectedIngredients = [];

        // Pizza list card references for live match ranking
        // Map<pizzaId, { element, badge, ingredientIds, originalIndex, pizza }>
        this.pizzaCards = new Map();

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

            // Load default restaurant, falling back to the first enabled one
            const restaurants = this.dataLoader.getAllRestaurants();
            const defaultRestaurant = this.dataLoader.getRestaurantById('issing') || restaurants[0];
            if (defaultRestaurant) {
                await this.switchRestaurant(defaultRestaurant.id);
            }

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

        // Search restaurants and pizzas across all restaurants
        const restaurantResults = this.searchEngine.searchRestaurants(query);
        const pizzaResults = await this.searchEngine.searchPizzasGlobally(query);

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
                    () => {
                        this.switchRestaurant(restaurant.id);
                    }
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
                // Resolve ingredient names from the pizza's own restaurant data
                const restaurantData = this.dataLoader.getCachedRestaurantData(result.restaurantId);
                const ingredientsText = result.pizza.ingredients
                    .map(id => {
                        const ing = restaurantData
                            ? this.searchEngine.getIngredientById(id, restaurantData)
                            : null;
                        return ing ? ing.name : id;
                    })
                    .join(', ');

                const subtitle = `${result.restaurantName} • ${ingredientsText}`;

                const item = this.createSearchResultItem(
                    result.pizza.name,
                    subtitle,
                    result.pizza.tags,
                    async () => {
                        if (result.restaurantId !== this.dataLoader.getCurrentRestaurantId()) {
                            await this.switchRestaurant(result.restaurantId);
                        }
                        this.selectPizza(result.pizza);
                    }
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

        // Also clear search input and hide clear button
        const searchInput = document.getElementById('search-input');
        const searchClear = document.querySelector('.search-clear');
        if (searchInput) {
            searchInput.value = '';
        }
        if (searchClear) {
            searchClear.classList.remove('visible');
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
                });

                dropdown.appendChild(item);
            });
        });

        // Toggle dropdown
        dropdownButton.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('visible');
        });

        // Close dropdown when clicking outside
        // Remove previous document click handler if it exists
        if (this._restaurantDropdownDocumentClickHandler) {
            document.removeEventListener('click', this._restaurantDropdownDocumentClickHandler);
        }
        // Create and store the new handler
        this._restaurantDropdownDocumentClickHandler = (e) => {
            if (!dropdown.contains(e.target) && !dropdownButton.contains(e.target)) {
                dropdown.classList.remove('visible');
            }
        };
        document.addEventListener('click', this._restaurantDropdownDocumentClickHandler);

        menuButtons.appendChild(dropdownButton);
        menuButtons.appendChild(dropdown);
    }

    /**
     * Switch to a different restaurant
     */
    async switchRestaurant(restaurantId) {
        try {
            // Show skeleton placeholders while loading
            const container = document.getElementById('ingredients-container');
            if (container) showSkeleton(container);

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
            this.updateMatchUI();

            // Hide search results
            this.hideSearchResults();

            // Validate ingredients (check for missing SVG definitions)
            this.validateIngredients();

        } catch (error) {
            console.error(`Failed to switch to restaurant ${restaurantId}:`, error);
            showError(`Failed to load restaurant data`, document.getElementById('ingredients-container'));
        }
    }

    /**
     * Validate all ingredients in current restaurant and report missing SVG definitions
     */
    validateIngredients() {
        const restaurantData = this.dataLoader.getCurrentRestaurantData();
        if (!restaurantData || !restaurantData.ingredients || !restaurantData.ingredients.categories) return;

        // Get all unique ingredient SVG layers from the restaurant
        const allIngredientLayers = new Set();

        // Collect from ingredient categories
        Object.values(restaurantData.ingredients.categories).forEach(category => {
            if (category.items) {
                category.items.forEach(ingredient => {
                    allIngredientLayers.add(ingredient.svgLayer);
                });
            }
        });

        // Check for missing definitions
        const missingLayers = this.visualizer.getMissingIngredients(Array.from(allIngredientLayers));

        if (missingLayers.length > 0) {
            console.group(`⚠️ Missing SVG Definitions for ${restaurantData.restaurant.name}`);
            console.warn(`${missingLayers.length} ingredient(s) don't have SVG definitions:`);

            missingLayers.forEach(layerId => {
                // Find the ingredient name
                let ingredientName = layerId;
                Object.values(restaurantData.ingredients.categories).forEach(category => {
                    if (category.items) {
                        const ing = category.items.find(i => i.svgLayer === layerId);
                        if (ing) ingredientName = ing.name;
                    }
                });
                console.warn(`  - ${ingredientName} (${layerId})`);
            });

            console.groupEnd();

            // Return the missing list for programmatic use
            return missingLayers;
        } else {
            console.log(`✅ All ${allIngredientLayers.size} ingredients have SVG definitions`);
            return [];
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
                'seafood': 'fish',
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
                    this.handleIngredientToggle(ingredient, e.target.checked);
                });

                label.appendChild(checkbox);

                // Add mini preview icon
                const previewIcon = this.visualizer.generateMiniPreview(ingredient.svgLayer);
                if (previewIcon) {
                    label.appendChild(previewIcon);
                }

                // Wrap ingredient name in span for better layout
                const nameSpan = createElement('span', { className: 'ingredient-name' }, ingredient.name);
                label.appendChild(nameSpan);

                // Check if ingredient has SVG definition
                if (!this.visualizer.hasIngredientDefinition(ingredient.svgLayer)) {
                    label.classList.add('missing-svg');
                    label.title = `⚠️ No visual representation for "${ingredient.name}"`;

                    // Add warning icon
                    const warningIcon = document.createElement('i');
                    warningIcon.className = 'ph ph-warning';
                    label.appendChild(warningIcon);
                }

                ingredientsDiv.appendChild(label);
            });

            section.appendChild(ingredientsDiv);
            container.appendChild(section);
        });
    }

    /**
     * Handle ingredient toggle
     * @param {Object} ingredient - Ingredient object: { id, name, svgLayer }
     * @param {boolean} isChecked - Whether the ingredient was selected
     */
    handleIngredientToggle(ingredient, isChecked) {
        if (isChecked) {
            if (!this.currentSelectedIngredients.some(i => i.id === ingredient.id)) {
                this.currentSelectedIngredients.push({
                    id: ingredient.id,
                    name: ingredient.name,
                    svgLayer: ingredient.svgLayer
                });
            }
            this.visualizer.showIngredient(ingredient.svgLayer);
        } else {
            this.currentSelectedIngredients = this.currentSelectedIngredients.filter(i => i.id !== ingredient.id);
            this.visualizer.hideIngredient(ingredient.svgLayer);
        }

        // Update display
        this.updateCustomPizzaDisplay();
        this.updateMatchUI();
    }

    /**
     * Remove a selected ingredient by ID (unchecks its checkbox)
     */
    removeIngredient(ingredientId) {
        const checkbox = document.querySelector(`input[data-ingredient-id="${ingredientId}"]`);
        if (checkbox) {
            checkbox.checked = false;
        }

        const ingredient = this.currentSelectedIngredients.find(i => i.id === ingredientId);
        if (ingredient) {
            this.handleIngredientToggle(ingredient, false);
        }
    }

    /**
     * Add an ingredient by ID (checks its checkbox)
     */
    addIngredient(ingredientId) {
        const ingredient = this.dataLoader.getIngredientById(ingredientId);
        if (!ingredient) return;

        const checkbox = document.querySelector(`input[data-ingredient-id="${ingredientId}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }

        this.handleIngredientToggle(ingredient, true);
    }

    /**
     * Clear the whole pizza (all selected ingredients)
     */
    clearPizza() {
        document.querySelectorAll('#ingredients-container input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        this.currentSelectedIngredients = [];
        this.visualizer.clearPizza();
        this.updateCustomPizzaDisplay();
        this.updateMatchUI();
    }

    /**
     * Update custom pizza display (selected ingredient chips + clear button)
     */
    updateCustomPizzaDisplay() {
        const resultContainer = document.getElementById('result');
        if (!resultContainer) return;

        clearElement(resultContainer);

        if (this.currentSelectedIngredients.length === 0) {
            const hint = createElement('div', { className: 'plate-hint' });
            const icon = document.createElement('i');
            icon.className = 'ph ph-cursor-click';
            hint.appendChild(icon);
            hint.appendChild(document.createTextNode(' Pick ingredients to build your pizza'));
            resultContainer.appendChild(hint);
            return;
        }

        const heading = createElement('h2', {}, 'Your Pizza');
        resultContainer.appendChild(heading);

        const chips = createElement('div', { className: 'selected-chips' });
        this.currentSelectedIngredients.forEach(ingredient => {
            const chip = createElement('span', { className: 'chip chip-selected' });
            chip.appendChild(document.createTextNode(ingredient.name));

            const removeBtn = createElement('button', {
                className: 'chip-remove',
                type: 'button',
                'aria-label': `Remove ${ingredient.name}`
            }, '×');
            removeBtn.addEventListener('click', () => this.removeIngredient(ingredient.id));
            chip.appendChild(removeBtn);

            chips.appendChild(chip);
        });
        resultContainer.appendChild(chips);

        const clearBtn = createElement('button', { className: 'btn-ghost clear-pizza-btn', type: 'button' });
        const trashIcon = document.createElement('i');
        trashIcon.className = 'ph ph-trash';
        clearBtn.appendChild(trashIcon);
        clearBtn.appendChild(document.createTextNode(' Clear pizza'));
        clearBtn.addEventListener('click', () => this.clearPizza());
        resultContainer.appendChild(clearBtn);
    }

    /**
     * Compute match between the current selection and a set of pizza ingredient IDs
     * @returns {{ shared: number, score: number }} Jaccard similarity and shared count
     */
    computeMatch(pizzaIngredientIds) {
        const selectedIds = new Set(this.currentSelectedIngredients.map(i => i.id));
        if (selectedIds.size === 0) {
            return { shared: 0, score: 0 };
        }

        let shared = 0;
        pizzaIngredientIds.forEach(id => {
            if (selectedIds.has(id)) shared++;
        });

        const unionSize = selectedIds.size + pizzaIngredientIds.size - shared;
        return { shared, score: unionSize > 0 ? shared / unionSize : 0 };
    }

    /**
     * Update all match-driven UI: pizza list ranking, badges, and the closest-match box
     */
    updateMatchUI() {
        this.updatePizzaRanking();
        this.updateClosestMatch();
    }

    /**
     * Re-rank the pizza list by match score and update badges
     */
    updatePizzaRanking() {
        const container = document.getElementById('all-pizzas');
        if (!container || this.pizzaCards.size === 0) return;

        const hasSelection = this.currentSelectedIngredients.length > 0;

        const ranked = Array.from(this.pizzaCards.values()).map(card => {
            const { shared, score } = this.computeMatch(card.ingredientIds);
            return { card, shared, score };
        });

        ranked.forEach(({ card, shared }) => {
            if (hasSelection && shared > 0) {
                card.badge.hidden = false;
                card.badge.textContent = `${shared}/${card.ingredientIds.size}`;
            } else {
                card.badge.hidden = true;
            }
        });

        // Sort: by score descending when something is selected, original order otherwise
        ranked.sort((a, b) => {
            if (hasSelection && b.score !== a.score) {
                return b.score - a.score;
            }
            return a.card.originalIndex - b.card.originalIndex;
        });

        const list = container.querySelector('.pizza-list');
        if (list) {
            ranked.forEach(({ card }) => list.appendChild(card.element));
        }
    }

    /**
     * Update the closest pizza match box with interactive suggestions
     */
    updateClosestMatch() {
        const closestMatchContainer = document.getElementById('closest-match');
        if (!closestMatchContainer) return;

        clearElement(closestMatchContainer);

        if (this.currentSelectedIngredients.length === 0) {
            closestMatchContainer.style.display = 'none';
            this.removeClosestPizzaHighlight();
            return;
        }

        // Find the best match by Jaccard similarity
        let best = null;
        this.pizzaCards.forEach(card => {
            const { shared, score } = this.computeMatch(card.ingredientIds);
            if (shared > 0 && (!best || score > best.score)) {
                best = { pizza: card.pizza, ingredientIds: card.ingredientIds, shared, score };
            }
        });

        if (!best) {
            closestMatchContainer.style.display = 'none';
            this.removeClosestPizzaHighlight();
            return;
        }

        const selectedIds = new Set(this.currentSelectedIngredients.map(i => i.id));
        const toAdd = Array.from(best.ingredientIds).filter(id => !selectedIds.has(id));
        const toRemove = this.currentSelectedIngredients.filter(i => !best.ingredientIds.has(i.id));

        // Header
        const heading = createElement('h2', {});
        const targetIcon = document.createElement('i');
        targetIcon.className = 'ph ph-target';
        heading.appendChild(targetIcon);
        heading.appendChild(document.createTextNode(` Closest: ${best.pizza.name}`));
        const pct = createElement('span', { className: 'match-pct' }, `${Math.round(best.score * 100)}%`);
        heading.appendChild(pct);
        closestMatchContainer.appendChild(heading);

        // Exact match: celebrate instead of suggesting changes
        if (toAdd.length === 0 && toRemove.length === 0) {
            const exact = createElement('p', { className: 'match-exact' });
            const check = document.createElement('i');
            check.className = 'ph ph-check-circle';
            exact.appendChild(check);
            exact.appendChild(document.createTextNode(` You built the ${best.pizza.name}!`));
            closestMatchContainer.appendChild(exact);
            closestMatchContainer.style.display = 'block';
            this.highlightClosestPizza(best.pizza.id);
            return;
        }

        // Suggestion chips: click to apply
        if (toAdd.length > 0) {
            const row = createElement('div', { className: 'match-row' });
            row.appendChild(createElement('span', { className: 'match-row-label match-add' }, 'Add'));
            toAdd.forEach(id => {
                const ingredient = this.dataLoader.getIngredientById(id);
                const chip = createElement('button', {
                    className: 'chip chip-add',
                    type: 'button',
                    title: 'Add to your pizza'
                }, ingredient ? ingredient.name : id);
                chip.addEventListener('click', () => this.addIngredient(id));
                row.appendChild(chip);
            });
            closestMatchContainer.appendChild(row);
        }

        if (toRemove.length > 0) {
            const row = createElement('div', { className: 'match-row' });
            row.appendChild(createElement('span', { className: 'match-row-label match-remove' }, 'Remove'));
            toRemove.forEach(ingredient => {
                const chip = createElement('button', {
                    className: 'chip chip-remove-suggest',
                    type: 'button',
                    title: 'Remove from your pizza'
                }, ingredient.name);
                chip.addEventListener('click', () => this.removeIngredient(ingredient.id));
                row.appendChild(chip);
            });
            closestMatchContainer.appendChild(row);
        }

        // One-click apply
        const makeBtn = createElement('button', { className: 'btn-primary make-pizza-btn', type: 'button' });
        const wand = document.createElement('i');
        wand.className = 'ph ph-magic-wand';
        makeBtn.appendChild(wand);
        makeBtn.appendChild(document.createTextNode(` Make this pizza`));
        makeBtn.addEventListener('click', () => this.selectPizza(best.pizza));
        closestMatchContainer.appendChild(makeBtn);

        closestMatchContainer.style.display = 'block';
        this.highlightClosestPizza(best.pizza.id);
    }

    /**
     * Highlight closest pizza in list
     */
    highlightClosestPizza(pizzaId) {
        this.pizzaCards.forEach((card, id) => {
            card.element.classList.toggle('highlight', id === pizzaId);
        });
    }

    /**
     * Remove pizza highlight
     */
    removeClosestPizzaHighlight() {
        this.pizzaCards.forEach(card => {
            card.element.classList.remove('highlight');
        });
    }

    /**
     * Render pizza list
     */
    renderPizzaList() {
        const container = document.getElementById('all-pizzas');
        if (!container) return;

        clearElement(container);
        this.pizzaCards.clear();

        const heading = createElement('h2', {});
        const icon = document.createElement('i');
        icon.className = 'ph ph-list-bullets';
        heading.appendChild(icon);
        heading.appendChild(document.createTextNode(' All Pizzas'));
        container.appendChild(heading);

        const list = createElement('div', { className: 'pizza-list' });
        const pizzas = this.dataLoader.getAllPizzas();

        pizzas.forEach((pizza, index) => {
            const ingredientNames = pizza.ingredients
                .map(id => {
                    const ing = this.dataLoader.getIngredientById(id);
                    return ing ? ing.name : id;
                })
                .join(', ');

            const pizzaDiv = createElement('div', { className: 'pizza-item' });

            const header = createElement('div', { className: 'pizza-item-header' });
            header.appendChild(createElement('h3', {}, pizza.name));
            const badge = createElement('span', { className: 'match-badge' });
            badge.hidden = true;
            header.appendChild(badge);
            pizzaDiv.appendChild(header);

            if (pizza.description) {
                pizzaDiv.appendChild(createElement('p', { className: 'pizza-desc' }, pizza.description));
            }

            pizzaDiv.appendChild(createElement('p', { className: 'pizza-ingredients' }, ingredientNames));

            if (pizza.tags && pizza.tags.length > 0) {
                const tags = createElement('div', { className: 'pizza-tags' });
                pizza.tags.forEach(tag => {
                    tags.appendChild(createElement('span', { className: 'pizza-tag' }, tag));
                });
                pizzaDiv.appendChild(tags);
            }

            pizzaDiv.addEventListener('click', () => {
                this.selectPizza(pizza);
            });

            list.appendChild(pizzaDiv);

            this.pizzaCards.set(pizza.id, {
                element: pizzaDiv,
                badge,
                ingredientIds: new Set(pizza.ingredients),
                originalIndex: index,
                pizza
            });
        });

        container.appendChild(list);
    }

    /**
     * Select a pizza and display its ingredients with sequential animation
     */
    async selectPizza(pizza) {
        // Get ingredient details
        const ingredientDetails = pizza.ingredients
            .map(id => this.dataLoader.getIngredientById(id))
            .filter(ing => ing !== null);

        // Check if all ingredients are available
        const missingIngredients = ingredientDetails.filter(ing =>
            !document.querySelector(`input[data-ingredient-id="${ing.id}"]`)
        );

        if (missingIngredients.length > 0) {
            showToast(`Missing ingredients: ${missingIngredients.map(i => i.name).join(', ')}`, 'warning');
            return;
        }

        // Clear all checkboxes first
        document.querySelectorAll('#ingredients-container input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Clear current selection and pizza visualization
        this.currentSelectedIngredients = [];
        this.visualizer.clearPizza();

        // Scroll to pizza visualizer first
        document.getElementById('pizza-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Wait for clear animation to complete
        await new Promise(resolve => setTimeout(resolve, 650));

        // Add ingredients one by one with delay
        for (let i = 0; i < ingredientDetails.length; i++) {
            const ingredient = ingredientDetails[i];
            const checkbox = document.querySelector(`input[data-ingredient-id="${ingredient.id}"]`);

            if (checkbox) {
                checkbox.checked = true;
                this.currentSelectedIngredients.push({
                    id: ingredient.id,
                    name: ingredient.name,
                    svgLayer: ingredient.svgLayer
                });
                this.visualizer.showIngredient(ingredient.svgLayer);

                // Update display after each ingredient
                this.updateCustomPizzaDisplay();

                // Delay before adding next ingredient (shorter for sauce/cheese, longer for toppings)
                const delay = i === 0 ? 200 : 150; // First ingredient (sauce) appears faster
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        // Final display update
        this.updateMatchUI();
    }
}
