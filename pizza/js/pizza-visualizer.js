/**
 * PizzaVisualizer - Enhanced SVG rendering with realistic effects
 * Features: Advanced filters, gradients, physics-based placement, realistic textures
 */

const pizzaCenter = { x: 150, y: 150 };
const defaultPizzaRadius = 120;
const MIN_INGREDIENT_DISTANCE = 8; // Minimum distance between ingredients

export class PizzaVisualizer {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = null;
        this.initialized = false;
        this.usedPositions = [];
        this.layerCache = {}; // Cache for pre-rendered layers
        this.activeLayerIds = new Set(); // Track currently visible layers
    }

    /**
     * Initialize the pizza visualizer with enhanced graphics
     */
    initialize() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            throw new Error(`Container with ID ${this.containerId} not found`);
        }

        this.container.innerHTML = '';
        this.generateEnhancedBase();
        // Don't pre-generate all layers - use lazy rendering instead
        this.initialized = true;
    }

    /**
     * Generate enhanced pizza base with realistic crust
     */
    generateEnhancedBase() {
        const baseSvg = this.createSvgElement('svg', {
            viewBox: '0 0 300 300',
            class: 'ingredient-layer pizza-base',
            id: 'pizza-base-layer',
            style: 'display: block; position: absolute; top: 0; left: 0; opacity: 1; z-index: 0;'
        });

        // Create filters and gradients
        const defs = this.createSvgElement('defs', {});
        this.addFilters(defs);
        this.addGradients(defs);
        baseSvg.appendChild(defs);

        // Enhanced crust with irregular edge
        const crustPath = this.generateIrregularCrustPath();
        const crust = this.createSvgElement('path', {
            d: crustPath,
            fill: 'url(#crustGradient)',
            stroke: '#d2691e',
            'stroke-width': '3',
            filter: 'url(#crustShadow)'
        });
        baseSvg.appendChild(crust);

        // Add crust bubbles
        this.addCrustBubbles(baseSvg);

        // Add char marks
        this.addCharMarks(baseSvg);

        // Add flour dusting
        this.addFlourDusting(baseSvg);

        this.container.appendChild(baseSvg);
    }

    /**
     * Add SVG filters for realistic effects
     */
    addFilters(defs) {
        // Drop shadow for ingredients
        const ingredientShadow = this.createSvgElement('filter', { id: 'ingredientShadow' });
        ingredientShadow.innerHTML = `
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
                <feFuncA type="linear" slope="0.4"/>
            </feComponentTransfer>
            <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        `;
        defs.appendChild(ingredientShadow);

        // Soft shadow for cheese
        const cheeseShadow = this.createSvgElement('filter', { id: 'cheeseShadow' });
        cheeseShadow.innerHTML = `
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
            <feOffset dx="0" dy="1" result="offsetblur"/>
            <feComponentTransfer>
                <feFuncA type="linear" slope="0.2"/>
            </feComponentTransfer>
            <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        `;
        defs.appendChild(cheeseShadow);

        // Crust shadow
        const crustShadow = this.createSvgElement('filter', { id: 'crustShadow' });
        crustShadow.innerHTML = `
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="0" dy="3" result="offsetblur"/>
            <feComponentTransfer>
                <feFuncA type="linear" slope="0.5"/>
            </feComponentTransfer>
            <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        `;
        defs.appendChild(crustShadow);

        // Texture for cheese
        const cheeseTexture = this.createSvgElement('filter', { id: 'cheeseTexture' });
        cheeseTexture.innerHTML = `
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="2"/>
            <feColorMatrix type="saturate" values="0"/>
            <feComponentTransfer>
                <feFuncA type="linear" slope="0.15"/>
            </feComponentTransfer>
            <feBlend in="SourceGraphic" mode="overlay"/>
        `;
        defs.appendChild(cheeseTexture);

        // Mushroom texture
        const mushroomTexture = this.createSvgElement('filter', { id: 'mushroomTexture' });
        mushroomTexture.innerHTML = `
            <feTurbulence type="fractalNoise" baseFrequency="2" numOctaves="3" seed="5"/>
            <feColorMatrix type="saturate" values="0"/>
            <feComponentTransfer>
                <feFuncA type="linear" slope="0.1"/>
            </feComponentTransfer>
            <feBlend in="SourceGraphic" mode="multiply"/>
        `;
        defs.appendChild(mushroomTexture);

        // Meat texture
        const meatTexture = this.createSvgElement('filter', { id: 'meatTexture' });
        meatTexture.innerHTML = `
            <feTurbulence type="turbulence" baseFrequency="1.5" numOctaves="2" seed="8"/>
            <feColorMatrix type="saturate" values="0"/>
            <feComponentTransfer>
                <feFuncA type="linear" slope="0.12"/>
            </feComponentTransfer>
            <feBlend in="SourceGraphic" mode="multiply"/>
        `;
        defs.appendChild(meatTexture);
    }

    /**
     * Add gradient definitions for realistic colors
     */
    addGradients(defs) {
        // Crust gradient
        const crustGradient = this.createSvgElement('radialGradient', { id: 'crustGradient' });
        crustGradient.innerHTML = `
            <stop offset="0%" stop-color="#f4d03f"/>
            <stop offset="50%" stop-color="#f4a460"/>
            <stop offset="85%" stop-color="#d2691e"/>
            <stop offset="100%" stop-color="#8b4513"/>
        `;
        defs.appendChild(crustGradient);

        // Mozzarella gradient
        const mozzarellaGradient = this.createSvgElement('radialGradient', { id: 'mozzarellaGradient' });
        mozzarellaGradient.innerHTML = `
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="60%" stop-color="#fefefe"/>
            <stop offset="100%" stop-color="#f8f8f0"/>
        `;
        defs.appendChild(mozzarellaGradient);

        // Salami gradient
        const salamiGradient = this.createSvgElement('radialGradient', { id: 'salamiGradient' });
        salamiGradient.innerHTML = `
            <stop offset="0%" stop-color="#d45454"/>
            <stop offset="50%" stop-color="#c94c4c"/>
            <stop offset="100%" stop-color="#a83838"/>
        `;
        defs.appendChild(salamiGradient);

        // Mushroom cap gradient
        const mushroomGradient = this.createSvgElement('radialGradient', { id: 'mushroomGradient' });
        mushroomGradient.innerHTML = `
            <stop offset="0%" stop-color="#e0c9a6"/>
            <stop offset="60%" stop-color="#deb887"/>
            <stop offset="100%" stop-color="#c2a268"/>
        `;
        defs.appendChild(mushroomGradient);

        // Pepperoni gradient with fat marbling
        const pepperoniGradient = this.createSvgElement('radialGradient', { id: 'pepperoniGradient' });
        pepperoniGradient.innerHTML = `
            <stop offset="0%" stop-color="#c94c4c"/>
            <stop offset="40%" stop-color="#b84444"/>
            <stop offset="80%" stop-color="#a83838"/>
            <stop offset="100%" stop-color="#8b2f2f"/>
        `;
        defs.appendChild(pepperoniGradient);

        // Tomato sauce gradient
        const sauceGradient = this.createSvgElement('radialGradient', { id: 'sauceGradient' });
        sauceGradient.innerHTML = `
            <stop offset="0%" stop-color="#e85d4e"/>
            <stop offset="50%" stop-color="#e34234"/>
            <stop offset="100%" stop-color="#c93529"/>
        `;
        defs.appendChild(sauceGradient);

        // Spinach gradient
        const spinachGradient = this.createSvgElement('linearGradient', { id: 'spinachGradient', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
        spinachGradient.innerHTML = `
            <stop offset="0%" stop-color="#3ba05f"/>
            <stop offset="50%" stop-color="#2E8B57"/>
            <stop offset="100%" stop-color="#256f44"/>
        `;
        defs.appendChild(spinachGradient);

        // Olive gradient
        const oliveGradient = this.createSvgElement('radialGradient', { id: 'oliveGradient' });
        oliveGradient.innerHTML = `
            <stop offset="0%" stop-color="#6b7c3f"/>
            <stop offset="50%" stop-color="#556b2f"/>
            <stop offset="100%" stop-color="#3d4f1f"/>
        `;
        defs.appendChild(oliveGradient);
    }

    /**
     * Generate irregular crust path with natural variation
     */
    generateIrregularCrustPath() {
        const radius = 140;
        const points = 48;
        let path = 'M';

        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const variation = (Math.sin(i * 0.8) * 3) + (Math.random() * 4 - 2);
            const r = radius + variation;
            const x = pizzaCenter.x + r * Math.cos(angle);
            const y = pizzaCenter.y + r * Math.sin(angle);

            if (i === 0) {
                path += `${x},${y}`;
            } else {
                path += ` L${x},${y}`;
            }
        }

        path += ' Z';
        return path;
    }

    /**
     * Add crust bubbles for realism
     */
    addCrustBubbles(svg) {
        const bubbleCount = 8 + Math.floor(Math.random() * 5);

        for (let i = 0; i < bubbleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 125 + Math.random() * 10;
            const x = pizzaCenter.x + distance * Math.cos(angle);
            const y = pizzaCenter.y + distance * Math.sin(angle);
            const size = 4 + Math.random() * 6;

            const bubble = this.createSvgElement('ellipse', {
                cx: x,
                cy: y,
                rx: size,
                ry: size * 0.8,
                fill: '#e8c090',
                opacity: '0.6',
                transform: `rotate(${Math.random() * 360} ${x} ${y})`
            });

            svg.appendChild(bubble);
        }
    }

    /**
     * Add char marks to crust
     */
    addCharMarks(svg) {
        const charCount = 12 + Math.floor(Math.random() * 6);

        for (let i = 0; i < charCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 110 + Math.random() * 25;
            const x = pizzaCenter.x + distance * Math.cos(angle);
            const y = pizzaCenter.y + distance * Math.sin(angle);
            const size = 3 + Math.random() * 5;

            const char = this.createSvgElement('ellipse', {
                cx: x,
                cy: y,
                rx: size,
                ry: size * 0.7,
                fill: '#5d3a1a',
                opacity: 0.3 + Math.random() * 0.3,
                transform: `rotate(${Math.random() * 360} ${x} ${y})`
            });

            svg.appendChild(char);
        }
    }

    /**
     * Add flour dusting effect
     */
    addFlourDusting(svg) {
        const flourCount = 25;

        for (let i = 0; i < flourCount; i++) {
            const pos = this.getRandomPositionInCircle(135);
            const size = 1 + Math.random() * 2;

            const flour = this.createSvgElement('circle', {
                cx: pos.x,
                cy: pos.y,
                r: size,
                fill: '#ffffff',
                opacity: 0.15 + Math.random() * 0.2
            });

            svg.appendChild(flour);
        }
    }

    /**
     * Generate a specific ingredient layer on-demand (lazy rendering)
     */
    generateIngredientLayer(ingredientId) {
        // Check cache first
        if (this.layerCache[ingredientId]) {
            return this.layerCache[ingredientId];
        }

        const ingredients = this.getIngredientsDefinition();
        const ingredient = ingredients.find(ing => ing.id === ingredientId);

        if (!ingredient) {
            console.warn(`Ingredient definition not found for ID: ${ingredientId}`);
            return null;
        }

        this.usedPositions = []; // Reset for this ingredient type

        // Determine z-index based on ingredient type for proper layering
        const zIndex = this.getIngredientZIndex(ingredient.id);

        const svg = this.createSvgElement('svg', {
            viewBox: '0 0 300 300',
            class: 'ingredient-layer',
            id: ingredient.id,
            style: `position:absolute;top:0;left:0;opacity:0;z-index:${zIndex};`
        });

        const count = ingredient.count || 1;
        for (let i = 0; i < count; i++) {
            let position;
            let attempts = 0;
            const maxAttempts = 50;

            // Get non-overlapping position
            do {
                // Respect explicit positions, then apply smart defaults
                if (ingredient.position) {
                    // Use explicit position if provided (e.g., tomato sauce at center)
                    position = ingredient.position;
                } else if (ingredient.count < 2) {
                    // Single items without explicit position go near center
                    position = this.getPositionNearCenter();
                } else {
                    // Multiple items get random positions
                    position = this.getRandomPositionInCircle(ingredient.placementRadius || defaultPizzaRadius);
                }
                attempts++;
            } while (this.hasCollision(position, ingredient.minDistance || MIN_INGREDIENT_DISTANCE) && attempts < maxAttempts);

            if (attempts < maxAttempts) {
                this.usedPositions.push(position);
            }

            let element;
            if (ingredient.customGenerator) {
                element = ingredient.customGenerator(ingredient.attributes, position, i);
            } else {
                element = this.createIngredientElement(ingredient, position);
            }

            svg.appendChild(element);
        }

        // Cache the generated layer
        this.layerCache[ingredientId] = svg;
        return svg;
    }

    /**
     * Check for position collision
     */
    hasCollision(position, minDistance) {
        return this.usedPositions.some(used => {
            const dx = position.x - used.x;
            const dy = position.y - used.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < minDistance;
        });
    }

    /**
     * Get ingredients definition with enhanced visual properties
     */
    getIngredientsDefinition() {
        return [
            // Base Layer - Enhanced tomato sauce
            {
                id: 'tomatensauce-layer',
                elementType: 'circle',
                attributes: { r: defaultPizzaRadius, fill: 'url(#sauceGradient)', opacity: 0.85 },
                count: 1,
                position: pizzaCenter
            },

            // Cheeses - Enhanced with gradients and textures
            { id: 'mozzarella-fior-di-latte-layer', customGenerator: this.generateMozzarella.bind(this), attributes: { fill: 'url(#mozzarellaGradient)' }, count: 12 },
            { id: 'mozzarella-layer', customGenerator: this.generateMozzarella.bind(this), attributes: { fill: 'url(#mozzarellaGradient)' }, count: 12 },
            { id: 'buffelmozzarella-layer', customGenerator: this.generateMozzarella.bind(this), attributes: { fill: '#f8f8f2' }, count: 10 },
            { id: 'gorgonzola-layer', customGenerator: this.generateGorgonzola.bind(this), attributes: { fill: '#7f8c8d' }, count: 8 },
            { id: 'parmesan-layer', customGenerator: this.generateParmesan.bind(this), attributes: { fill: '#f1c40f' }, count: 30 },
            { id: 'brie-layer', customGenerator: this.generateBrie.bind(this), attributes: { fill: '#f5f5dc' }, count: 10 },
            { id: 'ricotta-layer', customGenerator: this.generateRicotta.bind(this), attributes: { fill: '#fefefe' }, count: 10 },
            { id: 'feta-layer', customGenerator: this.generateFeta.bind(this), attributes: { fill: '#fdf5e6' }, count: 12 },
            { id: 'philadelphia-layer', customGenerator: this.generateMozzarella.bind(this), attributes: { fill: '#fff' }, count: 10 },
            { id: 'kase-layer', customGenerator: this.generateMozzarella.bind(this), attributes: { fill: 'url(#mozzarellaGradient)' }, count: 12 },
            { id: 'schafskase-layer', customGenerator: this.generateFeta.bind(this), attributes: { fill: '#fffacd' }, count: 10 },
            { id: 'krauterkase-layer', customGenerator: this.generateKrauterkase.bind(this), attributes: { fill: '#f4a460' }, count: 10 },
            { id: 'krautertopfen-layer', customGenerator: this.generateKrautertopfenkase.bind(this), attributes: { fill: '#f5deb3' }, count: 10 },

            // Meats - Enhanced with textures and gradients
            { id: 'schinken-layer', customGenerator: this.generateSchinken.bind(this), attributes: { fill: '#e9967a' }, count: 8 },
            { id: 'speck-layer', customGenerator: this.generateSpeck.bind(this), attributes: { fill: '#cd853f' }, count: 8 },
            { id: 'rohschinken-layer', customGenerator: this.generateSchinken.bind(this), attributes: { fill: '#e9967a' }, count: 8 },
            { id: 'salami-layer', customGenerator: this.generateSalami.bind(this), attributes: { fill: 'url(#salamiGradient)' }, count: 10 },
            { id: 'scharfe-salami-layer', customGenerator: this.generateSalami.bind(this), attributes: { fill: '#a52a2a' }, count: 10 },
            { id: 'kaminwurze-layer', customGenerator: this.generateKaminwurz.bind(this), attributes: { fill: '#8b4513' }, count: 8 },
            { id: 'kaminwurz-layer', customGenerator: this.generateKaminwurz.bind(this), attributes: { fill: '#8b4513' }, count: 8 },
            { id: 'wurstel-layer', customGenerator: this.generateWurstel.bind(this), attributes: { fill: '#f5a623' }, count: 15 },
            { id: 'bresaola-layer', customGenerator: this.generateBresaola.bind(this), attributes: { fill: '#8b0000' }, count: 8 },

            // Seafood - Enhanced
            { id: 'tonno-layer', customGenerator: this.generateTonno.bind(this), attributes: { fill: '#b0c4de' }, count: 12 },
            { id: 'thunfisch-layer', customGenerator: this.generateTonno.bind(this), attributes: { fill: '#b0c4de' }, count: 12 },
            { id: 'sardellen-layer', customGenerator: this.generateSardellen.bind(this), attributes: { fill: '#708090' }, count: 8 },
            { id: 'shrimps-layer', customGenerator: this.generateShrimps.bind(this), attributes: { fill: '#ffa07a' }, count: 10 },
            { id: 'meeresfruchte-layer', customGenerator: this.generateMeeresfruchte.bind(this), attributes: { fill: '#ff7f50' }, count: 15 },

            // Vegetables - Enhanced with realistic shapes
            { id: 'pilze-layer', customGenerator: this.generatePilze.bind(this), attributes: { fill: 'url(#mushroomGradient)' }, count: 12 },
            { id: 'steinpilze-layer', customGenerator: this.generatePilze.bind(this), attributes: { fill: '#c2a383' }, count: 8 },
            { id: 'pfifferlinge-layer', customGenerator: this.generatePilze.bind(this), attributes: { fill: '#ffd700' }, count: 12 },
            { id: 'champignon-layer', customGenerator: this.generatePilze.bind(this), attributes: { fill: 'url(#mushroomGradient)' }, count: 12 },
            { id: 'artischocken-layer', customGenerator: this.generateArtischocken.bind(this), attributes: { fill: '#a2c523' }, count: 8 },
            { id: 'spinat-layer', customGenerator: this.generateSpinach.bind(this), attributes: { fill: 'url(#spinachGradient)' }, count: 15 },
            { id: 'spinach-layer', customGenerator: this.generateSpinach.bind(this), attributes: { fill: 'url(#spinachGradient)' }, count: 15 },
            { id: 'paprika-layer', customGenerator: this.generatePaprika.bind(this), attributes: { fill: '#ff4500' }, count: 10 },
            { id: 'zucchini-layer', customGenerator: this.generateZucchini.bind(this), attributes: { fill: '#9acd32' }, count: 10 },
            { id: 'melanzane-layer', customGenerator: this.generateMelanzane.bind(this), attributes: { fill: '#800080' }, count: 10 },
            { id: 'zwiebel-layer', customGenerator: this.generateZwiebel.bind(this), attributes: { stroke: '#d2b48c', fill: 'none' }, count: 8 },
            { id: 'lombardi-layer', customGenerator: this.generateLombardi.bind(this), attributes: { fill: '#ff0000' }, count: 8 },
            { id: 'peperonata-layer', customGenerator: this.generatePeperonata.bind(this), attributes: { fill: '#ffcc00' }, count: 8 },
            { id: 'rucola-layer', customGenerator: this.generateRucola.bind(this), attributes: { fill: '#228b22' }, count: 12 },
            { id: 'cocktail-tomaten-layer', customGenerator: this.generateTomato.bind(this), attributes: { fill: '#ff6347' }, count: 15 },
            { id: 'marinierte-tomaten-layer', customGenerator: this.generateTomato.bind(this), attributes: { fill: '#ff6347' }, count: 15 },
            { id: 'tomaten-layer', customGenerator: this.generateTomato.bind(this), attributes: { fill: '#ff6347' }, count: 10 },

            // Miscellaneous - Enhanced
            { id: 'oliven-layer', customGenerator: this.generateOlive.bind(this), attributes: { fill: 'url(#oliveGradient)' }, count: 10 },
            { id: 'taggiasca-oliven-layer', customGenerator: this.generateOlive.bind(this), attributes: { fill: 'url(#oliveGradient)' }, count: 10 },
            { id: 'kapern-layer', customGenerator: this.generateKapern.bind(this), attributes: { fill: '#6b8e23' }, count: 15 },
            { id: 'riesen-kapern-layer', customGenerator: this.generateKapern.bind(this), attributes: { fill: '#6b8e23' }, count: 15 },
            { id: 'mais-layer', customGenerator: this.generateMais.bind(this), attributes: { fill: '#ffd700' }, count: 70, minDistance: 4 },
            { id: 'paprikapulver-layer', customGenerator: this.generatePaprikapulver.bind(this), attributes: { fill: '#ff6347' }, count: 100, minDistance: 2 },
            { id: 'balsamico-glaze-layer', customGenerator: this.generateBalsamicoGlaze.bind(this), attributes: { stroke: '#5c3317', 'stroke-width': 3, fill: 'none' }, count: 1 },
            { id: 'cocktail-sosse-layer', customGenerator: this.generateCocktailSosse.bind(this), attributes: { stroke: '#ff69b4', 'stroke-width': 3, fill: 'none' }, count: 1 },
            { id: 'knoblauch-layer', customGenerator: this.generateKnoblauch.bind(this), attributes: { fill: '#fffacd' }, count: 12 },
            { id: 'basilikum-layer', customGenerator: this.generateBasilikum.bind(this), attributes: { fill: '#008000' }, count: 12 },
            { id: 'spiegelei-layer', customGenerator: this.generateSpiegelei.bind(this), attributes: {}, count: 2, placementRadius: 50 },
            { id: 'gekochtes-ei-layer', customGenerator: this.generateGekochtesEi.bind(this), attributes: {}, count: 2, placementRadius: 50 },
            { id: 'ei-layer', customGenerator: this.generateGekochtesEi.bind(this), attributes: {}, count: 2, placementRadius: 50 },
            { id: 'oregano-layer', customGenerator: this.generateOregano.bind(this), attributes: { fill: '#556b2f' }, count: 150, minDistance: 2 },
            { id: 'origano-layer', customGenerator: this.generateOregano.bind(this), attributes: { fill: '#556b2f' }, count: 150, minDistance: 2 },
            { id: 'krauter-layer', customGenerator: this.generateOregano.bind(this), attributes: { fill: '#556b2f' }, count: 150, minDistance: 2 },
            { id: 'vier-gemuse-sorten-layer', customGenerator: this.generateVierGemuse.bind(this), attributes: {}, count: 1 },
            { id: 'ananas-layer', customGenerator: this.generateAnanas.bind(this), attributes: { fill: '#ffdb58' }, count: 15 },
            { id: 'parmesansplitter-layer', customGenerator: this.generateParmesansplitter.bind(this), attributes: { fill: '#fffacd' }, count: 12 },
            { id: 'cocktailsauce-layer', customGenerator: this.generateCocktailsauce.bind(this), attributes: { fill: '#ff6347' }, count: 10 },

            // Missing Rienzbräu ingredients - Sauces
            { id: 'truffelcreme-layer', elementType: 'circle', attributes: { r: defaultPizzaRadius, fill: '#8b7355', opacity: 0.85 }, count: 1, position: pizzaCenter },
            { id: 'basilikum-pesto-layer', elementType: 'circle', attributes: { r: defaultPizzaRadius, fill: '#228b22', opacity: 0.8 }, count: 1, position: pizzaCenter },

            // Missing Rienzbräu ingredients - Cheeses
            { id: 'alpenkaese-layer', customGenerator: this.generateFeta.bind(this), attributes: { fill: '#f4e4c1' }, count: 12 },
            { id: 'scamorza-layer', customGenerator: this.generateMozzarella.bind(this), attributes: { fill: '#ffe4b5' }, count: 12 },
            { id: 'frischkaese-layer', customGenerator: this.generateRicotta.bind(this), attributes: { fill: '#fffef0' }, count: 10 },
            { id: 'burrata-layer', customGenerator: this.generateMozzarella.bind(this), attributes: { fill: '#fffffe' }, count: 8 },

            // Missing Rienzbräu ingredients - Meats
            { id: 'salami-mild-layer', customGenerator: this.generateSalami.bind(this), attributes: { fill: '#e57373' }, count: 10 },
            { id: 'salami-scharf-layer', customGenerator: this.generateSalami.bind(this), attributes: { fill: '#a52a2a' }, count: 10 },
            { id: 'salsiccia-layer', customGenerator: this.generateSalami.bind(this), attributes: { fill: '#c94c4c' }, count: 12 },
            { id: 'wuerstel-layer', customGenerator: this.generateWurstel.bind(this), attributes: { fill: '#f5a623' }, count: 15 },

            // Missing Rienzbräu ingredients - Vegetables & Herbs
            { id: 'radicchio-layer', customGenerator: this.generateRucola.bind(this), attributes: { fill: '#8b1a4a' }, count: 12 },
            { id: 'cocktailtomaten-layer', customGenerator: this.generateTomato.bind(this), attributes: { fill: '#ff6347' }, count: 15 },
            { id: 'getrocknete-tomaten-layer', customGenerator: this.generateTomato.bind(this), attributes: { fill: '#c93529', opacity: 0.9 }, count: 12 },
            { id: 'grillgemuese-layer', customGenerator: this.generateVierGemuse.bind(this), attributes: {}, count: 1 },
            { id: 'birnen-layer', customGenerator: this.generateAnanas.bind(this), attributes: { fill: '#dac79e' }, count: 10 },
            { id: 'kresse-layer', customGenerator: this.generateOregano.bind(this), attributes: { fill: '#4a7c2e' }, count: 120, minDistance: 2 },
            { id: 'rosmarin-layer', customGenerator: this.generateOregano.bind(this), attributes: { fill: '#5d7052' }, count: 100, minDistance: 2 },

            // Missing Rienzbräu ingredients - Toppings
            { id: 'pinienkerne-layer', customGenerator: this.generateMais.bind(this), attributes: { fill: '#f5deb3' }, count: 50, minDistance: 3 },
            { id: 'gamberoni-layer', customGenerator: this.generateShrimps.bind(this), attributes: { fill: '#ff6b6b' }, count: 8 },

            // Missing Mühle ingredients - Sauces
            { id: 'vierkasesauce-layer', elementType: 'circle', attributes: { r: defaultPizzaRadius, fill: '#ffd89b', opacity: 0.85 }, count: 1, position: pizzaCenter },
            { id: 'mayonnaise-layer', customGenerator: this.generateMayonnaise.bind(this), attributes: { stroke: '#f5f5dc', 'stroke-width': 3, fill: 'none' }, count: 1 },

            // Missing Mühle ingredients - Cheeses
            { id: 'mascarpone-layer', customGenerator: this.generateRicotta.bind(this), attributes: { fill: '#fffef8' }, count: 10 },

            // Missing Mühle ingredients - Meats & Seafood
            { id: 'hirschschinken-layer', customGenerator: this.generateSchinken.bind(this), attributes: { fill: '#8b4513' }, count: 8 },
            { id: 'garnelen-layer', customGenerator: this.generateShrimps.bind(this), attributes: { fill: '#ffa07a' }, count: 10 },
            { id: 'meeresfruechte-layer', customGenerator: this.generateMeeresfruchte.bind(this), attributes: { fill: '#ff7f50' }, count: 15 },

            // Missing Mühle ingredients - Vegetables
            { id: 'kirschtomaten-layer', customGenerator: this.generateTomato.bind(this), attributes: { fill: '#ff6347' }, count: 15 },
            { id: 'auberginen-layer', customGenerator: this.generateMelanzane.bind(this), attributes: { fill: '#800080' }, count: 10 },
            { id: 'gegrillte-zucchini-layer', customGenerator: this.generateZucchini.bind(this), attributes: { fill: '#6b8e23' }, count: 10 },
            { id: 'gegrillte-paprikastreifen-layer', customGenerator: this.generatePaprika.bind(this), attributes: { fill: '#cd5c5c' }, count: 10 },
            { id: 'peperoncino-layer', customGenerator: this.generateLombardi.bind(this), attributes: { fill: '#ff0000' }, count: 8 },
            { id: 'gegrilltes-gemuse-layer', customGenerator: this.generateVierGemuse.bind(this), attributes: {}, count: 1 },

            // Missing Mühle ingredients - Toppings
            { id: 'schwarze-oliven-layer', customGenerator: this.generateOlive.bind(this), attributes: { fill: '#2c2c2c' }, count: 10 },
            { id: 'nusse-layer', customGenerator: this.generateMais.bind(this), attributes: { fill: '#d2691e' }, count: 40, minDistance: 5 },
            { id: 'parmesanspane-layer', customGenerator: this.generateParmesansplitter.bind(this), attributes: { fill: '#fffacd' }, count: 12 },
            { id: 'cocktailsauce-layer', customGenerator: this.generateCocktailsauce.bind(this), attributes: { fill: '#ff69b4' }, count: 10 },

            // Missing Mühlbacher Klause ingredients - Sauces
            { id: 'basilikumpesto-layer', elementType: 'circle', attributes: { r: defaultPizzaRadius, fill: '#228b22', opacity: 0.8 }, count: 1, position: pizzaCenter },
            { id: 'sriracha-chili-mayo-layer', customGenerator: this.generateSrirachaMayo.bind(this), attributes: { stroke: '#ff4500', 'stroke-width': 3, fill: 'none' }, count: 1 },

            // Missing Mühlbacher Klause ingredients - Cheeses
            { id: 'vierkase-layer', customGenerator: this.generateMozzarella.bind(this), attributes: { fill: '#ffd89b' }, count: 12 },
            { id: 'kasescheiben-layer', customGenerator: this.generateKasescheiben.bind(this), attributes: { fill: '#ffeb9c' }, count: 8 },

            // Missing Mühlbacher Klause ingredients - Meats
            { id: 'sudtiroler-wurst-layer', customGenerator: this.generateKaminwurz.bind(this), attributes: { fill: '#8b4513' }, count: 8 },

            // Missing Mühlbacher Klause ingredients - Vegetables
            { id: 'spargel-layer', customGenerator: this.generateSpargel.bind(this), attributes: { fill: '#90ee90' }, count: 8 },
            { id: 'grune-paprika-layer', customGenerator: this.generatePaprika.bind(this), attributes: { fill: '#32cd32' }, count: 10 },
            { id: 'scharfe-peperoni-layer', customGenerator: this.generateLombardi.bind(this), attributes: { fill: '#ff0000' }, count: 8 },

            // Missing Mühlbacher Klause ingredients - Toppings
            { id: 'salz-layer', customGenerator: this.generateSalz.bind(this), attributes: { fill: '#ffffff' }, count: 80, minDistance: 2 },
            { id: 'chili-flocken-layer', customGenerator: this.generateOregano.bind(this), attributes: { fill: '#dc143c' }, count: 100, minDistance: 2 },
        ];
    }

    /**
     * Get z-index for proper ingredient layering
     * Sauce -> Cheese -> Toppings
     */
    getIngredientZIndex(ingredientId) {
        // All sauces should always be at the bottom (z-index 1)
        if (ingredientId.includes('tomatensauce') ||
            ingredientId.includes('sauce') ||
            ingredientId.includes('creme') ||
            ingredientId.includes('pesto')) {
            return 1;
        }
        // Cheese layers above sauce (z-index 2)
        if (ingredientId.includes('mozzarella') ||
            ingredientId.includes('kase') ||
            ingredientId.includes('cheese') ||
            ingredientId.includes('parmesan') ||
            ingredientId.includes('gorgonzola') ||
            ingredientId.includes('brie') ||
            ingredientId.includes('ricotta') ||
            ingredientId.includes('feta') ||
            ingredientId.includes('philadelphia') ||
            ingredientId.includes('schafskase') ||
            ingredientId.includes('krauterkase') ||
            ingredientId.includes('krautertopfen')) {
            return 2;
        }
        // All other toppings above cheese (z-index 3)
        return 3;
    }

    /**
     * Generate a mini preview icon for ingredient checkbox
     * @param {string} svgLayerId - The ingredient layer ID
     * @returns {SVGElement|null} - Mini SVG icon (24×24px) or null if not found
     */
    generateMiniPreview(svgLayerId) {
        const ingredients = this.getIngredientsDefinition();
        const ingredient = ingredients.find(ing => ing.id === svgLayerId);

        if (!ingredient) return null;

        // Create mini SVG with smaller viewBox
        const miniSvg = this.createSvgElement('svg', {
            viewBox: '0 0 50 50',
            width: '32',
            height: '32',
            class: 'ingredient-preview-icon'
        });

        // Copy filters and gradients from main base (needed for references)
        const defs = this.createSvgElement('defs', {});
        this.addFilters(defs);
        this.addGradients(defs);
        miniSvg.appendChild(defs);

        // Center position for mini preview
        const centerPos = { x: 25, y: 25 };

        // Generate single instance at center
        this.usedPositions = []; // Reset collision detection
        let element;

        try {
            if (ingredient.customGenerator) {
                element = ingredient.customGenerator(ingredient.attributes, centerPos, 0);
            } else {
                element = this.createIngredientElement(ingredient, centerPos);
            }

            // Scale down for better fit
            const scale = 0.8;
            const translateX = 25 * (1 - scale);
            const translateY = 25 * (1 - scale);
            element.setAttribute('transform', `translate(${translateX}, ${translateY}) scale(${scale})`);

            miniSvg.appendChild(element);
        } catch (error) {
            console.warn(`Failed to generate mini preview for ${svgLayerId}:`, error);
            return null;
        }

        return miniSvg;
    }

    /**
     * Validate if an ingredient has an SVG definition
     * @param {string} svgLayerId - The ingredient layer ID to check
     * @returns {boolean} - True if definition exists, false otherwise
     */
    hasIngredientDefinition(svgLayerId) {
        const ingredients = this.getIngredientsDefinition();
        return ingredients.some(ing => ing.id === svgLayerId);
    }

    /**
     * Get all missing ingredient definitions
     * @param {Array<string>} svgLayerIds - Array of layer IDs to validate
     * @returns {Array<string>} - Array of missing layer IDs
     */
    getMissingIngredients(svgLayerIds) {
        return svgLayerIds.filter(layerId => !this.hasIngredientDefinition(layerId));
    }

    /**
     * Show an ingredient layer (lazy render and append to DOM)
     */
    showIngredient(svgLayerId) {
        // Skip if already visible
        if (this.activeLayerIds.has(svgLayerId)) {
            return;
        }

        // Generate layer if needed (lazy rendering)
        let layer = this.layerCache[svgLayerId];
        if (!layer) {
            layer = this.generateIngredientLayer(svgLayerId);
            if (!layer) return; // Failed to generate
        }

        // Append to DOM if not already present
        if (!layer.parentNode) {
            this.container.appendChild(layer);
            // Force reflow to ensure initial state is rendered
            layer.offsetHeight;
            // Then animate
            layer.style.opacity = '1';
        } else {
            // Layer already in DOM, just show it
            layer.style.opacity = '1';
        }

        this.activeLayerIds.add(svgLayerId);
    }

    /**
     * Hide an ingredient layer (remove from DOM and clear cache for fresh randomization)
     */
    hideIngredient(svgLayerId) {
        const layer = this.layerCache[svgLayerId];

        if (layer && layer.parentNode) {
            // Fade out, then remove from DOM
            layer.style.opacity = '0';

            // Remove from DOM after transition completes
            setTimeout(() => {
                if (layer.parentNode && !this.activeLayerIds.has(svgLayerId)) {
                    layer.parentNode.removeChild(layer);
                }
            }, 600); // Match CSS transition duration
        }

        // Clear cache to force fresh randomization when ingredient is added again
        delete this.layerCache[svgLayerId];

        this.activeLayerIds.delete(svgLayerId);
    }

    /**
     * Clear all ingredient layers (remove from DOM but keep in cache)
     */
    clearPizza() {
        // Remove all layers except the base (first child)
        const layersToRemove = Array.from(this.activeLayerIds);
        layersToRemove.forEach(layerId => {
            this.hideIngredient(layerId);
        });

        this.activeLayerIds.clear();
    }

    /**
     * Render pizza with given ingredient layer IDs
     */
    renderPizza(ingredientSvgLayers) {
        this.clearPizza();
        ingredientSvgLayers.forEach(layerId => {
            this.showIngredient(layerId);
        });
    }

    // === SVG Creation Helper Methods ===

    createSvgElement(type, attributes) {
        const svgNS = 'http://www.w3.org/2000/svg';
        const element = document.createElementNS(svgNS, type);
        for (const attr in attributes) {
            element.setAttribute(attr, attributes[attr]);
        }
        return element;
    }

    createIngredientElement(ingredient, position) {
        const element = this.createSvgElement(ingredient.elementType, {});
        this.setElementAttributes(element, ingredient.attributes, position);
        if (ingredient.rotation) {
            const rotation = Math.random() * 360;
            element.setAttribute('transform', `rotate(${rotation} ${position.x} ${position.y})`);
        }
        return element;
    }

    setElementAttributes(element, attributes, position) {
        for (const attr in attributes) {
            element.setAttribute(attr, attributes[attr]);
        }
        if (position) {
            if (['circle', 'ellipse'].includes(element.tagName)) {
                element.setAttribute('cx', position.x);
                element.setAttribute('cy', position.y);
            } else if (element.tagName === 'rect') {
                element.setAttribute('x', position.x - (attributes.width || 0) / 2);
                element.setAttribute('y', position.y - (attributes.height || 0) / 2);
            }
        }
    }

    getRandomPositionInCircle(radius = defaultPizzaRadius) {
        const angle = Math.random() * 2 * Math.PI;
        const r = radius * Math.sqrt(Math.random());
        return { x: pizzaCenter.x + r * Math.cos(angle), y: pizzaCenter.y + r * Math.sin(angle) };
    }

    getPositionNearCenter() {
        return this.getRandomPositionInCircle(defaultPizzaRadius / 4);
    }

    // === Enhanced Custom Ingredient Generators ===

    /**
     * Generate enhanced mozzarella with melted cheese effect
     */
    generateMozzarella(attributes, position) {
        const group = this.createSvgElement('g', {
            filter: 'url(#cheeseShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        const size = 12 + Math.random() * 6;

        // Main cheese blob with irregular shape
        const cheeseBlob = this.createSvgElement('ellipse', {
            cx: position.x,
            cy: position.y,
            rx: size,
            ry: size * (0.8 + Math.random() * 0.3),
            fill: attributes.fill || 'url(#mozzarellaGradient)',
            opacity: 0.85 + Math.random() * 0.1,
            filter: 'url(#cheeseTexture)'
        });

        group.appendChild(cheeseBlob);

        // Add grease spot occasionally
        if (Math.random() > 0.7) {
            const greaseSpot = this.createSvgElement('circle', {
                cx: position.x + (Math.random() * 4 - 2),
                cy: position.y + (Math.random() * 4 - 2),
                r: size * 0.3,
                fill: '#f5f5e8',
                opacity: '0.4'
            });
            group.appendChild(greaseSpot);
        }

        return group;
    }

    /**
     * Generate gorgonzola with blue veins
     */
    generateGorgonzola(attributes, position) {
        const group = this.createSvgElement('g', {
            filter: 'url(#cheeseShadow)'
        });

        const size = 10 + Math.random() * 4;

        const base = this.createSvgElement('circle', {
            cx: position.x,
            cy: position.y,
            r: size,
            fill: '#a8b8c0',
            opacity: '0.8'
        });
        group.appendChild(base);

        // Add blue-green veins
        for (let i = 0; i < 3; i++) {
            const veinPath = `M${position.x - size * 0.6},${position.y + Math.random() * 4 - 2}
                             Q${position.x},${position.y + Math.random() * 4 - 2}
                             ${position.x + size * 0.6},${position.y + Math.random() * 4 - 2}`;
            const vein = this.createSvgElement('path', {
                d: veinPath,
                stroke: '#4a6278',
                'stroke-width': '1',
                fill: 'none',
                opacity: '0.6'
            });
            group.appendChild(vein);
        }

        return group;
    }

    /**
     * Enhanced parmesan shavings
     */
    generateParmesan(attributes, position) {
        const size = 4 + Math.random() * 4;
        const points = [
            `${position.x},${position.y - size / 2}`,
            `${position.x + size / 2 + Math.random() * 2},${position.y + size / 2}`,
            `${position.x - size / 2 - Math.random() * 2},${position.y + size / 2}`
        ].join(' ');

        const parmesan = this.createSvgElement('polygon', {
            points,
            fill: attributes.fill,
            opacity: 0.7 + Math.random() * 0.2,
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        return parmesan;
    }

    /**
     * Enhanced brie cheese
     */
    generateBrie(attributes, position) {
        const size = 10 + Math.random() * 4;
        const d = `M${position.x - size},${position.y}
                   A${size},${size} 0 0,1 ${position.x + size},${position.y}
                   L${position.x},${position.y + size} Z`;

        return this.createSvgElement('path', {
            d,
            fill: attributes.fill,
            opacity: '0.85',
            filter: 'url(#cheeseShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });
    }

    /**
     * Enhanced ricotta
     */
    generateRicotta(attributes, position) {
        const group = this.createSvgElement('g', {});
        const size = 8 + Math.random() * 4;

        const ricotta = this.createSvgElement('circle', {
            cx: position.x,
            cy: position.y,
            r: size,
            fill: attributes.fill,
            opacity: '0.9',
            filter: 'url(#cheeseTexture)'
        });

        group.appendChild(ricotta);
        return group;
    }

    /**
     * Enhanced feta chunks
     */
    generateFeta(attributes, position) {
        const size = 12 + Math.random() * 6;
        const feta = this.createSvgElement('rect', {
            x: position.x - size / 2,
            y: position.y - size / 2,
            width: size,
            height: size * (0.8 + Math.random() * 0.4),
            fill: attributes.fill,
            opacity: '0.85',
            rx: '2',
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        return feta;
    }

    /**
     * Enhanced Krauterkase (herb cheese)
     */
    generateKrauterkase(attributes, position) {
        const group = this.createSvgElement('g', {
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        const size = 18;
        const rect = this.createSvgElement('rect', {
            x: position.x - size / 2,
            y: position.y - size / 2,
            width: size,
            height: size,
            fill: attributes.fill,
            rx: 4,
            ry: 4,
            opacity: '0.85'
        });
        group.appendChild(rect);

        // Add herb specks
        for (let i = 0; i < 5; i++) {
            const herb = this.createSvgElement('circle', {
                cx: position.x + (Math.random() * size - size / 2),
                cy: position.y + (Math.random() * size - size / 2),
                r: 0.5 + Math.random() * 0.5,
                fill: '#2d5016',
                opacity: '0.6'
            });
            group.appendChild(herb);
        }

        return group;
    }

    /**
     * Enhanced Krautertopfen
     */
    generateKrautertopfenkase(attributes, position) {
        const circle = this.createSvgElement('circle', {
            cx: position.x,
            cy: position.y,
            r: 10 + Math.random() * 4,
            fill: attributes.fill,
            opacity: '0.9',
            filter: 'url(#cheeseTexture)'
        });

        return circle;
    }

    /**
     * Enhanced ham slices
     */
    generateSchinken(attributes, position) {
        const group = this.createSvgElement('g', {
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        const width = 35 + Math.random() * 10;
        const height = 18 + Math.random() * 6;

        const ham = this.createSvgElement('ellipse', {
            cx: position.x,
            cy: position.y,
            rx: width / 2,
            ry: height / 2,
            fill: attributes.fill,
            opacity: '0.85',
            filter: 'url(#meatTexture)'
        });
        group.appendChild(ham);

        // Add fat marbling
        const marbling = this.createSvgElement('ellipse', {
            cx: position.x + 5,
            cy: position.y,
            rx: 6,
            ry: 4,
            fill: '#f5deb3',
            opacity: '0.4'
        });
        group.appendChild(marbling);

        return group;
    }

    /**
     * Enhanced speck (bacon)
     */
    generateSpeck(attributes, position) {
        const group = this.createSvgElement('g', {
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        const width = 45 + Math.random() * 10;
        const height = 8 + Math.random() * 4;

        // Meat part
        const meat = this.createSvgElement('rect', {
            x: position.x - width / 2,
            y: position.y - height / 2,
            width: width,
            height: height,
            fill: '#8b4513',
            opacity: '0.85',
            rx: 2
        });
        group.appendChild(meat);

        // Fat stripe
        const fat = this.createSvgElement('rect', {
            x: position.x - width / 2,
            y: position.y - height / 2,
            width: width,
            height: height / 3,
            fill: '#f5deb3',
            opacity: '0.7',
            rx: 1
        });
        group.appendChild(fat);

        return group;
    }

    /**
     * Enhanced salami with pepperoni details
     */
    generateSalami(attributes, position) {
        const group = this.createSvgElement('g', {
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        const size = 11 + Math.random() * 3;

        // Main salami circle
        const salami = this.createSvgElement('circle', {
            cx: position.x,
            cy: position.y,
            r: size,
            fill: attributes.fill || 'url(#salamiGradient)',
            filter: 'url(#meatTexture)'
        });
        group.appendChild(salami);

        // Edge casing
        const casing = this.createSvgElement('circle', {
            cx: position.x,
            cy: position.y,
            r: size,
            fill: 'none',
            stroke: '#8b2f2f',
            'stroke-width': '1',
            opacity: '0.6'
        });
        group.appendChild(casing);

        // Fat spots
        const fatCount = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < fatCount; i++) {
            const angle = (i / fatCount) * Math.PI * 2;
            const distance = size * 0.4 * Math.random();
            const fatX = position.x + distance * Math.cos(angle);
            const fatY = position.y + distance * Math.sin(angle);

            const fat = this.createSvgElement('circle', {
                cx: fatX,
                cy: fatY,
                r: 1 + Math.random() * 1.5,
                fill: '#f5deb3',
                opacity: '0.7'
            });
            group.appendChild(fat);
        }

        return group;
    }

    /**
     * Enhanced wurstel (sausage slices)
     */
    generateWurstel(attributes, position) {
        const size = 9 + Math.random() * 3;

        const wurstel = this.createSvgElement('circle', {
            cx: position.x,
            cy: position.y,
            r: size,
            fill: attributes.fill,
            filter: 'url(#ingredientShadow)',
            opacity: '0.9'
        });

        return wurstel;
    }

    /**
     * Enhanced bresaola
     */
    generateBresaola(attributes, position) {
        const group = this.createSvgElement('g', {
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        const ellipse = this.createSvgElement('ellipse', {
            cx: position.x,
            cy: position.y,
            rx: 18 + Math.random() * 6,
            ry: 9 + Math.random() * 3,
            fill: attributes.fill,
            opacity: '0.85',
            filter: 'url(#meatTexture)'
        });

        group.appendChild(ellipse);
        return group;
    }

    /**
     * Enhanced Kaminwurz
     */
    generateKaminwurz(attributes, position) {
        const ellipse = this.createSvgElement('ellipse', {
            cx: position.x,
            cy: position.y,
            rx: 5,
            ry: 18 + Math.random() * 6,
            fill: attributes.fill,
            filter: 'url(#ingredientShadow)',
            opacity: '0.85',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        return ellipse;
    }

    /**
     * Enhanced tuna chunks
     */
    generateTonno(attributes, position) {
        const group = this.createSvgElement('g', {
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        const size = 9 + Math.random() * 4;
        const points = [
            `${position.x},${position.y - size}`,
            `${position.x - size},${position.y + size}`,
            `${position.x + size},${position.y + size}`
        ].join(' ');

        const tuna = this.createSvgElement('polygon', {
            points,
            fill: attributes.fill,
            opacity: '0.8'
        });
        group.appendChild(tuna);

        return group;
    }

    /**
     * Enhanced mushrooms with cap details
     */
    generatePilze(attributes, position) {
        const group = this.createSvgElement('g', {
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        const capWidth = 18 + Math.random() * 6;
        const capHeight = 9 + Math.random() * 3;
        const stemWidth = 5 + Math.random() * 2;
        const stemHeight = 11 + Math.random() * 3;

        const x = position.x;
        const y = position.y;

        // Mushroom cap with bezier curves for organic shape
        const capPath = `M${x - capWidth / 2},${y}
                        Q${x - capWidth / 3},${y - capHeight}
                        ${x},${y - capHeight - 2}
                        Q${x + capWidth / 3},${y - capHeight}
                        ${x + capWidth / 2},${y} Z`;

        const cap = this.createSvgElement('path', {
            d: capPath,
            fill: attributes.fill || 'url(#mushroomGradient)',
            filter: 'url(#mushroomTexture)'
        });
        group.appendChild(cap);

        // Stem
        const stemPath = `M${x - stemWidth / 2},${y}
                         L${x - stemWidth / 2},${y + stemHeight}
                         L${x + stemWidth / 2},${y + stemHeight}
                         L${x + stemWidth / 2},${y} Z`;

        const stem = this.createSvgElement('path', {
            d: stemPath,
            fill: '#f5deb3',
            opacity: '0.9'
        });
        group.appendChild(stem);

        // Add gill details under cap
        for (let i = 0; i < 3; i++) {
            const gillY = y - 2;
            const gillX = x - capWidth / 3 + (i * capWidth / 3);
            const gill = this.createSvgElement('line', {
                x1: gillX,
                y1: gillY,
                x2: gillX,
                y2: gillY + 3,
                stroke: '#d2a679',
                'stroke-width': '0.5',
                opacity: '0.4'
            });
            group.appendChild(gill);
        }

        return group;
    }

    /**
     * Enhanced spinach leaves
     */
    generateSpinach(attributes, position) {
        const size = 9 + Math.random() * 4;
        const d = `M${position.x - size},${position.y}
                  Q${position.x - size / 2},${position.y - size * 2}
                  ${position.x},${position.y - size * 1.5}
                  Q${position.x + size / 2},${position.y - size * 2}
                  ${position.x + size},${position.y}
                  Q${position.x},${position.y + size / 2}
                  ${position.x - size},${position.y}`;

        const leaf = this.createSvgElement('path', {
            d,
            fill: attributes.fill,
            opacity: 0.7 + Math.random() * 0.2,
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        return leaf;
    }

    /**
     * Enhanced artichokes
     */
    generateArtischocken(attributes, position) {
        const group = this.createSvgElement('g', {
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        const ellipse = this.createSvgElement('ellipse', {
            cx: position.x,
            cy: position.y,
            rx: 18 + Math.random() * 6,
            ry: 9 + Math.random() * 3,
            fill: attributes.fill,
            opacity: '0.85'
        });
        group.appendChild(ellipse);

        // Add leaf details
        for (let i = 0; i < 3; i++) {
            const leafLine = this.createSvgElement('line', {
                x1: position.x - 10 + i * 10,
                y1: position.y - 5,
                x2: position.x - 10 + i * 10,
                y2: position.y + 5,
                stroke: '#7a9f1a',
                'stroke-width': '1',
                opacity: '0.5'
            });
            group.appendChild(leafLine);
        }

        return group;
    }

    /**
     * Enhanced peppers
     */
    generatePaprika(attributes, position) {
        const ellipse = this.createSvgElement('ellipse', {
            cx: position.x,
            cy: position.y,
            rx: 9 + Math.random() * 3,
            ry: 5 + Math.random() * 2,
            fill: attributes.fill,
            opacity: '0.85',
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        return ellipse;
    }

    /**
     * Enhanced zucchini
     */
    generateZucchini(attributes, position) {
        const ellipse = this.createSvgElement('ellipse', {
            cx: position.x,
            cy: position.y,
            rx: 9 + Math.random() * 3,
            ry: 5 + Math.random() * 2,
            fill: attributes.fill,
            opacity: '0.85',
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        return ellipse;
    }

    /**
     * Enhanced eggplant
     */
    generateMelanzane(attributes, position) {
        const ellipse = this.createSvgElement('ellipse', {
            cx: position.x,
            cy: position.y,
            rx: 14 + Math.random() * 4,
            ry: 7 + Math.random() * 3,
            fill: attributes.fill,
            opacity: '0.85',
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        return ellipse;
    }

    /**
     * Enhanced onion rings
     */
    generateZwiebel(attributes, position) {
        const group = this.createSvgElement('g', {
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        const size = 13 + Math.random() * 5;

        // Outer ring
        const outer = this.createSvgElement('circle', {
            cx: position.x,
            cy: position.y,
            r: size,
            stroke: attributes.stroke || '#d2b48c',
            'stroke-width': 3,
            fill: 'none',
            opacity: '0.7'
        });
        group.appendChild(outer);

        // Inner ring for depth
        const inner = this.createSvgElement('circle', {
            cx: position.x,
            cy: position.y,
            r: size * 0.6,
            stroke: '#c9a97a',
            'stroke-width': 1.5,
            fill: 'none',
            opacity: '0.5'
        });
        group.appendChild(inner);

        return group;
    }

    /**
     * Enhanced chili peppers (Lombardi)
     */
    generateLombardi(attributes, position) {
        const x = position.x;
        const y = position.y;
        const size = 9 + Math.random() * 3;

        const pathData = `M ${x},${y}
                         q ${size / 2},-${size} ${size},0
                         c ${size / 2},${size} -${size / 2},${size * 1.5} -${size},${size}
                         s -${size / 2},-${size} 0,-${size} z`;

        const chili = this.createSvgElement('path', {
            d: pathData,
            fill: attributes.fill,
            opacity: '0.85',
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${x} ${y})`
        });

        return chili;
    }

    /**
     * Enhanced peperonata
     */
    generatePeperonata(attributes, position) {
        const ellipse = this.createSvgElement('ellipse', {
            cx: position.x,
            cy: position.y,
            rx: 13 + Math.random() * 5,
            ry: 23 + Math.random() * 6,
            fill: attributes.fill,
            opacity: '0.8',
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        return ellipse;
    }

    /**
     * Enhanced arugula leaves
     */
    generateRucola(attributes, position) {
        const pathData = `M ${position.x},${position.y}
                         c -5,-15 -10,-30 0,-45
                         c 10,15 5,30 0,45 z`;

        const leaf = this.createSvgElement('path', {
            d: pathData,
            fill: attributes.fill,
            opacity: 0.7 + Math.random() * 0.2,
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        return leaf;
    }

    /**
     * Enhanced tomatoes
     */
    generateTomato(attributes, position) {
        const group = this.createSvgElement('g', {
            filter: 'url(#ingredientShadow)'
        });

        const size = 7 + Math.random() * 3;

        const tomato = this.createSvgElement('circle', {
            cx: position.x,
            cy: position.y,
            r: size,
            fill: attributes.fill,
            opacity: '0.9'
        });
        group.appendChild(tomato);

        // Highlight
        const highlight = this.createSvgElement('circle', {
            cx: position.x - size * 0.3,
            cy: position.y - size * 0.3,
            r: size * 0.3,
            fill: '#ff8c7a',
            opacity: '0.5'
        });
        group.appendChild(highlight);

        return group;
    }

    /**
     * Enhanced olives
     */
    generateOlive(attributes, position) {
        const group = this.createSvgElement('g', {
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        const olive = this.createSvgElement('ellipse', {
            cx: position.x,
            cy: position.y,
            rx: 7 + Math.random() * 2,
            ry: 11 + Math.random() * 3,
            fill: attributes.fill,
            opacity: '0.85'
        });
        group.appendChild(olive);

        // Pimento center (for green olives)
        if (Math.random() > 0.5) {
            const pimento = this.createSvgElement('ellipse', {
                cx: position.x,
                cy: position.y,
                rx: 2,
                ry: 3,
                fill: '#ff4444',
                opacity: '0.7'
            });
            group.appendChild(pimento);
        }

        return group;
    }

    /**
     * Enhanced capers
     */
    generateKapern(attributes, position) {
        const caper = this.createSvgElement('ellipse', {
            cx: position.x,
            cy: position.y,
            rx: 3 + Math.random() * 2,
            ry: 5 + Math.random() * 2,
            fill: attributes.fill,
            opacity: '0.8',
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        return caper;
    }

    /**
     * Enhanced corn kernels
     */
    generateMais(attributes, position) {
        const size = 2.5 + Math.random() * 1;

        const corn = this.createSvgElement('ellipse', {
            cx: position.x,
            cy: position.y,
            rx: size,
            ry: size * 1.3,
            fill: attributes.fill,
            opacity: 0.8 + Math.random() * 0.2,
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        return corn;
    }

    /**
     * Enhanced paprika powder
     */
    generatePaprikapulver(attributes, position) {
        const size = 1.5 + Math.random() * 1;

        const powder = this.createSvgElement('circle', {
            cx: position.x,
            cy: position.y,
            r: size,
            fill: attributes.fill,
            opacity: 0.3 + Math.random() * 0.3
        });

        return powder;
    }

    /**
     * Enhanced oregano/herb specks
     */
    generateOregano(attributes, position) {
        const size = 0.8 + Math.random() * 0.8;

        const oregano = this.createSvgElement('ellipse', {
            cx: position.x,
            cy: position.y,
            rx: size,
            ry: size * 1.5,
            fill: attributes.fill,
            opacity: 0.5 + Math.random() * 0.3,
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        return oregano;
    }

    /**
     * Enhanced balsamico glaze drizzle
     */
    generateBalsamicoGlaze(attributes) {
        const path1 = `M50,200 Q100,150 150,180 T250,200`;
        const path2 = `M60,210 Q110,165 155,190 T245,215`;

        const group = this.createSvgElement('g', {});

        const drizzle1 = this.createSvgElement('path', {
            d: path1,
            ...attributes,
            opacity: '0.7'
        });

        const drizzle2 = this.createSvgElement('path', {
            d: path2,
            ...attributes,
            opacity: '0.5'
        });

        group.appendChild(drizzle1);
        group.appendChild(drizzle2);

        return group;
    }

    /**
     * Enhanced cocktail sauce drizzle
     */
    generateCocktailSosse(attributes) {
        const path = `M50,220 Q100,175 150,200 T250,220`;

        return this.createSvgElement('path', {
            d: path,
            ...attributes,
            opacity: '0.7'
        });
    }

    /**
     * Enhanced garlic
     */
    generateKnoblauch(attributes, position) {
        const size = 5 + Math.random() * 2;
        const d = `M${position.x},${position.y}
                  Q${position.x - size},${position.y - size}
                  ${position.x},${position.y - size * 2}
                  Q${position.x + size},${position.y - size}
                  ${position.x},${position.y}`;

        return this.createSvgElement('path', {
            d,
            fill: attributes.fill,
            opacity: '0.8',
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });
    }

    /**
     * Enhanced basil leaves
     */
    generateBasilikum(attributes, position) {
        const size = 4 + Math.random() * 2;
        const d = `M${position.x},${position.y}
                  Q${position.x - size},${position.y - size}
                  ${position.x},${position.y - size * 2}
                  Q${position.x + size},${position.y - size}
                  ${position.x},${position.y}`;

        const leaf = this.createSvgElement('path', {
            d,
            fill: attributes.fill,
            opacity: 0.7 + Math.random() * 0.2,
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        return leaf;
    }

    /**
     * Enhanced fried egg
     */
    generateSpiegelei(attributes, position) {
        const group = this.createSvgElement('g', {
            filter: 'url(#ingredientShadow)'
        });

        // Irregular white shape
        const whitePath = `M${position.x - 20},${position.y}
                          Q${position.x - 25},${position.y - 15} ${position.x - 15},${position.y - 20}
                          Q${position.x},${position.y - 22} ${position.x + 15},${position.y - 18}
                          Q${position.x + 23},${position.y - 10} ${position.x + 20},${position.y + 5}
                          Q${position.x + 15},${position.y + 20} ${position.x},${position.y + 22}
                          Q${position.x - 15},${position.y + 18} ${position.x - 20},${position.y} Z`;

        const white = this.createSvgElement('path', {
            d: whitePath,
            fill: 'white',
            opacity: '0.95'
        });
        group.appendChild(white);

        const yolk = this.createSvgElement('circle', {
            cx: position.x,
            cy: position.y,
            r: 9,
            fill: '#ffd700',
            opacity: '0.95'
        });
        group.appendChild(yolk);

        // Yolk highlight
        const highlight = this.createSvgElement('circle', {
            cx: position.x - 3,
            cy: position.y - 3,
            r: 3,
            fill: '#ffed4e',
            opacity: '0.6'
        });
        group.appendChild(highlight);

        return group;
    }

    /**
     * Enhanced boiled egg
     */
    generateGekochtesEi(attributes, position) {
        const group = this.createSvgElement('g', {
            filter: 'url(#ingredientShadow)'
        });

        const egg = this.createSvgElement('ellipse', {
            cx: position.x,
            cy: position.y,
            rx: 14,
            ry: 23,
            fill: 'white',
            opacity: '0.95'
        });
        group.appendChild(egg);

        const yolk = this.createSvgElement('circle', {
            cx: position.x,
            cy: position.y,
            r: 7,
            fill: '#FFD700',
            opacity: '0.9'
        });
        group.appendChild(yolk);

        return group;
    }

    /**
     * Enhanced pineapple chunks
     */
    generateAnanas(attributes, position) {
        const size = 18 + Math.random() * 6;
        const x = position.x;
        const y = position.y;

        const d = `M${x},${y}
                  L${x + size},${y}
                  A${size},${size} 0 0,0 ${x},${y - size} Z`;

        const path = this.createSvgElement('path', {
            d,
            fill: attributes.fill,
            opacity: '0.85',
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${x} ${y})`
        });

        return path;
    }

    /**
     * Enhanced sardellen (anchovies)
     */
    generateSardellen(attributes, position) {
        const size = 14 + Math.random() * 4;
        const d = `M${position.x - size},${position.y}
                  Q${position.x},${position.y - size / 2} ${position.x + size},${position.y}
                  Q${position.x},${position.y + size / 2} ${position.x - size},${position.y}`;

        const fish = this.createSvgElement('path', {
            d,
            fill: attributes.fill,
            opacity: '0.85',
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        return fish;
    }

    /**
     * Enhanced shrimps
     */
    generateShrimps(attributes, position) {
        const size = 9 + Math.random() * 3;
        const d = `M${position.x},${position.y}
                  C${position.x + size},${position.y - size}
                  ${position.x + size},${position.y + size}
                  ${position.x},${position.y + size}
                  C${position.x - size},${position.y + size}
                  ${position.x - size},${position.y - size}
                  ${position.x},${position.y}`;

        const shrimp = this.createSvgElement('path', {
            d,
            fill: attributes.fill,
            opacity: '0.85',
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        return shrimp;
    }

    /**
     * Enhanced seafood mix
     */
    generateMeeresfruchte(attributes, position) {
        return this.generateShrimps(attributes, position);
    }

    /**
     * Enhanced mixed vegetables
     */
    generateVierGemuse(attributes, position) {
        const group = this.createSvgElement('g', {});
        const vegetables = [
            { generator: this.generatePaprika.bind(this), count: 5, attrs: { fill: '#ff4500' } },
            { generator: this.generateZucchini.bind(this), count: 5, attrs: { fill: '#9acd32' } },
            { generator: this.generateMelanzane.bind(this), count: 5, attrs: { fill: '#800080' } },
            { generator: this.generatePilze.bind(this), count: 5, attrs: { fill: 'url(#mushroomGradient)' } }
        ];

        vegetables.forEach(veg => {
            for (let i = 0; i < veg.count; i++) {
                const vegPosition = this.getRandomPositionInCircle();
                const vegElement = veg.generator(veg.attrs, vegPosition);
                group.appendChild(vegElement);
            }
        });

        return group;
    }

    /**
     * Enhanced parmesan splinters
     */
    generateParmesansplitter(attributes, position) {
        const polygon = this.createSvgElement('polygon', {
            points: `${position.x},${position.y}
                    ${position.x + 8 + Math.random() * 4},${position.y - 4 - Math.random() * 2}
                    ${position.x + 4 + Math.random() * 2},${position.y + 8 + Math.random() * 4}`,
            fill: attributes.fill,
            opacity: 0.7 + Math.random() * 0.2,
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        return polygon;
    }

    /**
     * Enhanced cocktail sauce blobs
     */
    generateCocktailsauce(attributes, position) {
        const ellipse = this.createSvgElement('ellipse', {
            cx: position.x,
            cy: position.y,
            rx: 13 + Math.random() * 5,
            ry: 7 + Math.random() * 3,
            fill: attributes.fill,
            opacity: '0.8',
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        return ellipse;
    }

    /**
     * Enhanced mayonnaise drizzle
     */
    generateMayonnaise(attributes) {
        const path1 = `M50,200 Q100,150 150,180 T250,200`;
        const path2 = `M60,210 Q110,165 155,190 T245,215`;

        const group = this.createSvgElement('g', {});

        const drizzle1 = this.createSvgElement('path', {
            d: path1,
            ...attributes,
            opacity: '0.8'
        });

        const drizzle2 = this.createSvgElement('path', {
            d: path2,
            ...attributes,
            opacity: '0.6'
        });

        group.appendChild(drizzle1);
        group.appendChild(drizzle2);

        return group;
    }

    /**
     * Enhanced sriracha chili mayo drizzle
     */
    generateSrirachaMayo(attributes) {
        const path = `M50,220 Q100,175 150,200 T250,220`;

        return this.createSvgElement('path', {
            d: path,
            ...attributes,
            opacity: '0.8'
        });
    }

    /**
     * Enhanced cheese slices
     */
    generateKasescheiben(attributes, position) {
        const group = this.createSvgElement('g', {
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        const width = 30 + Math.random() * 10;
        const height = 25 + Math.random() * 8;

        // Cheese slice base
        const slice = this.createSvgElement('rect', {
            x: position.x - width / 2,
            y: position.y - height / 2,
            width: width,
            height: height,
            fill: attributes.fill,
            opacity: '0.85',
            rx: 3
        });
        group.appendChild(slice);

        // Add holes (Swiss cheese effect)
        const holeCount = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < holeCount; i++) {
            const holeX = position.x - width / 4 + Math.random() * width / 2;
            const holeY = position.y - height / 4 + Math.random() * height / 2;
            const holeR = 2 + Math.random() * 3;

            const hole = this.createSvgElement('circle', {
                cx: holeX,
                cy: holeY,
                r: holeR,
                fill: '#f5deb3',
                opacity: '0.6'
            });
            group.appendChild(hole);
        }

        return group;
    }

    /**
     * Enhanced asparagus spears
     */
    generateSpargel(attributes, position) {
        const group = this.createSvgElement('g', {
            filter: 'url(#ingredientShadow)',
            transform: `rotate(${Math.random() * 360} ${position.x} ${position.y})`
        });

        const length = 35 + Math.random() * 10;
        const width = 4 + Math.random() * 2;

        // Asparagus spear
        const spear = this.createSvgElement('rect', {
            x: position.x - width / 2,
            y: position.y - length / 2,
            width: width,
            height: length,
            fill: attributes.fill,
            opacity: '0.85',
            rx: width / 2
        });
        group.appendChild(spear);

        // Tip (darker)
        const tip = this.createSvgElement('ellipse', {
            cx: position.x,
            cy: position.y - length / 2,
            rx: width / 2 + 1,
            ry: 5,
            fill: '#6b8e23',
            opacity: '0.9'
        });
        group.appendChild(tip);

        return group;
    }

    /**
     * Enhanced salt crystals
     */
    generateSalz(attributes, position) {
        const size = 1 + Math.random() * 1.5;

        // Random crystal shape (square or diamond)
        if (Math.random() > 0.5) {
            return this.createSvgElement('rect', {
                x: position.x - size / 2,
                y: position.y - size / 2,
                width: size,
                height: size,
                fill: attributes.fill,
                opacity: 0.4 + Math.random() * 0.4,
                transform: `rotate(${Math.random() * 45} ${position.x} ${position.y})`
            });
        } else {
            return this.createSvgElement('circle', {
                cx: position.x,
                cy: position.y,
                r: size,
                fill: attributes.fill,
                opacity: 0.4 + Math.random() * 0.4
            });
        }
    }
}
