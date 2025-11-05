/**
 * PizzaVisualizer - Handles SVG rendering of pizza ingredients
 */

const pizzaCenter = { x: 150, y: 150 };
const defaultPizzaRadius = 120;

export class PizzaVisualizer {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = null;
        this.initialized = false;
    }

    /**
     * Initialize the pizza visualizer
     */
    initialize() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            throw new Error(`Container with ID ${this.containerId} not found`);
        }

        // Clear existing content
        this.container.innerHTML = '';

        // Generate the base pizza and all ingredient layers
        this.generateIngredientLayers();
        this.initialized = true;
    }

    /**
     * Generate all ingredient SVG layers
     */
    generateIngredientLayers() {
        // Add base pizza layer
        const baseSvg = this.createSvgElement('svg', {
            viewBox: '0 0 300 300',
            class: 'ingredient-layer',
            style: 'display: block; position: absolute; top: 0; left: 0;'
        });

        const baseCircle = this.createSvgElement('circle', {
            cx: '150',
            cy: '150',
            r: '140',
            fill: '#f4a460',
            stroke: '#d2691e',
            'stroke-width': '5'
        });

        baseSvg.appendChild(baseCircle);
        this.container.appendChild(baseSvg);

        // Define gradients
        const defs = this.createSvgElement('defs', {});
        const gradient = this.createSvgElement('linearGradient', {
            id: 'peperonataGradient',
            x1: '0%',
            x2: '100%',
            y1: '0%',
            y2: '0%'
        });
        gradient.appendChild(this.createSvgElement('stop', {offset: '0%', 'stop-color': '#ffcc00'}));
        gradient.appendChild(this.createSvgElement('stop', {offset: '100%', 'stop-color': '#ff4500'}));
        defs.appendChild(gradient);
        this.container.appendChild(defs);

        // Generate all ingredient layers
        const ingredients = this.getIngredientsDefinition();
        ingredients.forEach(ingredient => {
            const svg = this.createSvgElement('svg', {
                viewBox: '0 0 300 300',
                class: 'ingredient-layer',
                id: ingredient.id,
                style: 'position:absolute;top:0;left:0;opacity:0'
            });

            const count = ingredient.count || 1;
            for (let i = 0; i < count; i++) {
                let position = ingredient.position ||
                    this.getRandomPositionInCircle(ingredient.placementRadius || defaultPizzaRadius);
                if (ingredient.count < 2) {
                    position = this.getPositionNearCenter();
                }

                let element;
                if (ingredient.customGenerator) {
                    element = ingredient.customGenerator(ingredient.attributes, position);
                } else {
                    element = this.createIngredientElement(ingredient, position);
                }

                svg.appendChild(element);
            }

            this.container.appendChild(svg);
        });
    }

    /**
     * Get ingredients definition array
     */
    getIngredientsDefinition() {
        return [
            // Base Layer
            { id: 'tomatensauce-layer', elementType: 'circle', attributes: { r: defaultPizzaRadius, fill: '#e34234', opacity: 0.8 }, count: 1, position: pizzaCenter },

            // Cheeses
            { id: 'mozzarella-fior-di-latte-layer', elementType: 'circle', attributes: { r: 15, fill: 'white' }, count: 12 },
            { id: 'mozzarella-layer', elementType: 'circle', attributes: { r: 15, fill: 'white' }, count: 12 },
            { id: 'buffelmozzarella-layer', elementType: 'circle', attributes: { r: 15, fill: '#f8f8f2' }, count: 10 },
            { id: 'gorgonzola-layer', elementType: 'circle', attributes: { r: 12, fill: '#7f8c8d', opacity: 0.7 }, count: 8 },
            { id: 'parmesan-layer', customGenerator: this.generateParmesan.bind(this), attributes: { fill: '#f1c40f' }, count: 30 },
            { id: 'brie-layer', customGenerator: this.generateBrie.bind(this), attributes: { fill: '#f5f5dc' }, count: 10 },
            { id: 'ricotta-layer', customGenerator: this.generateBrie.bind(this), attributes: { fill: '#f5f5dc' }, count: 10 },
            { id: 'feta-layer', elementType: 'rect', attributes: { width: 15, height: 15, fill: '#fdf5e6' }, count: 12 },
            { id: 'philadelphia-layer', elementType: 'circle', attributes: { r: 10, fill: '#fff' }, count: 10 },
            { id: 'kase-layer', elementType: 'circle', attributes: { r: 15, fill: 'white' }, count: 12 },
            { id: 'schafskase-layer', elementType: 'rect', attributes: { width: 15, height: 15, fill: '#fffacd' }, count: 10 },
            { id: 'krauterkase-layer', customGenerator: this.generateKrauterkase.bind(this), attributes: { fill: '#f4a460' }, count: 10 },
            { id: 'krautertopfen-layer', customGenerator: this.generateKrautertopfenkase.bind(this), attributes: { fill: '#f5deb3' }, count: 10 },

            // Meats
            { id: 'schinken-layer', elementType: 'rect', attributes: { width: 40, height: 20, fill: '#e9967a' }, count: 8, rotation: true },
            { id: 'speck-layer', elementType: 'rect', attributes: { width: 50, height: 10, fill: '#cd853f' }, count: 8, rotation: true },
            { id: 'rohschinken-layer', elementType: 'rect', attributes: { width: 40, height: 20, fill: '#e9967a' }, count: 8, rotation: true },
            { id: 'salami-layer', elementType: 'circle', attributes: { r: 12, fill: '#c94c4c' }, count: 10 },
            { id: 'scharfe-salami-layer', elementType: 'circle', attributes: { r: 12, fill: '#a52a2a' }, count: 10 },
            { id: 'kaminwurze-layer', customGenerator: this.generateKaminwurz.bind(this), attributes: { fill: '#8b4513' }, count: 8 },
            { id: 'kaminwurz-layer', customGenerator: this.generateKaminwurz.bind(this), attributes: { fill: '#8b4513' }, count: 8 },
            { id: 'wurstel-layer', elementType: 'circle', attributes: { r: 10, fill: '#f5a623' }, count: 15 },
            { id: 'bresaola-layer', elementType: 'ellipse', attributes: { rx: 20, ry: 10, fill: '#8b0000' }, count: 8, rotation: true },

            // Seafood
            { id: 'tonno-layer', customGenerator: this.generateTonno.bind(this), attributes: { fill: '#b0c4de' }, count: 12 },
            { id: 'thunfisch-layer', customGenerator: this.generateTonno.bind(this), attributes: { fill: '#b0c4de' }, count: 12 },
            { id: 'sardellen-layer', customGenerator: this.generateSardellen.bind(this), attributes: { fill: '#708090' }, count: 8 },
            { id: 'shrimps-layer', customGenerator: this.generateShrimps.bind(this), attributes: { fill: '#ffa07a' }, count: 10 },
            { id: 'meeresfruchte-layer', customGenerator: this.generateMeeresfruchte.bind(this), attributes: { fill: '#ff7f50' }, count: 15 },

            // Vegetables
            { id: 'pilze-layer', customGenerator: this.generatePilze.bind(this), attributes: { fill: '#deb887' }, count: 12 },
            { id: 'steinpilze-layer', customGenerator: this.generatePilze.bind(this), attributes: { fill: '#c2a383' }, count: 8 },
            { id: 'pfifferlinge-layer', customGenerator: this.generatePilze.bind(this), attributes: { fill: '#ffd700' }, count: 12 },
            { id: 'champignon-layer', customGenerator: this.generatePilze.bind(this), attributes: { fill: '#deb887' }, count: 12 },
            { id: 'artischocken-layer', elementType: 'ellipse', attributes: { rx: 20, ry: 10, fill: '#a2c523' }, count: 8, rotation: true },
            { id: 'spinat-layer', customGenerator: this.generateSpinach.bind(this), attributes: { fill: '#2E8B57' }, count: 15 },
            { id: 'spinach-layer', customGenerator: this.generateSpinach.bind(this), attributes: { fill: '#2E8B57' }, count: 15 },
            { id: 'paprika-layer', elementType: 'ellipse', attributes: { rx: 10, ry: 5, fill: '#ff4500' }, count: 10, rotation: true },
            { id: 'zucchini-layer', elementType: 'ellipse', attributes: { rx: 10, ry: 5, fill: '#9acd32' }, count: 10, rotation: true },
            { id: 'melanzane-layer', elementType: 'ellipse', attributes: { rx: 15, ry: 8, fill: '#800080' }, count: 10, rotation: true },
            { id: 'zwiebel-layer', elementType: 'circle', attributes: { r: 15, stroke: '#d2b48c', 'stroke-width': 3, fill: 'none' }, count: 8 },
            { id: 'lombardi-layer', customGenerator: this.generateLombardi.bind(this), attributes: { fill: '#ff0000' }, count: 8 },
            { id: 'peperonata-layer', elementType: 'ellipse', attributes: { rx: 15, ry: 25, fill: '#ffcc00' }, count: 8, rotation: true },
            { id: 'rucola-layer', customGenerator: this.generateRucola.bind(this), attributes: { fill: '#228b22' }, count: 12 },
            { id: 'cocktail-tomaten-layer', elementType: 'circle', attributes: { r: 8, fill: '#ff6347' }, count: 15 },
            { id: 'marinierte-tomaten-layer', elementType: 'circle', attributes: { r: 8, fill: '#ff6347' }, count: 15 },
            { id: 'tomaten-layer', elementType: 'circle', attributes: { r: 10, fill: '#ff6347' }, count: 10 },

            // Miscellaneous
            { id: 'oliven-layer', elementType: 'ellipse', attributes: { rx: 8, ry: 12, fill: '#556b2f' }, count: 10 },
            { id: 'taggiasca-oliven-layer', elementType: 'ellipse', attributes: { rx: 8, ry: 12, fill: '#556b2f' }, count: 10 },
            { id: 'kapern-layer', elementType: 'ellipse', attributes: { rx: 4, ry: 6, fill: '#6b8e23' }, count: 15 },
            { id: 'riesen-kapern-layer', elementType: 'ellipse', attributes: { rx: 4, ry: 6, fill: '#6b8e23' }, count: 15 },
            { id: 'mais-layer', elementType: 'circle', attributes: { r: 3, fill: '#ffd700' }, count: 70 },
            { id: 'paprikapulver-layer', elementType: 'circle', attributes: { r: 2, fill: '#ff6347', opacity: 0.5 }, count: 100 },
            { id: 'balsamico-glaze-layer', customGenerator: this.generateBalsamicoGlaze.bind(this), attributes: { stroke: '#5c3317', 'stroke-width': 3, fill: 'none' }, count: 1 },
            { id: 'cocktail-sosse-layer', customGenerator: this.generateCocktailSosse.bind(this), attributes: { stroke: '#ff69b4', 'stroke-width': 3, fill: 'none' }, count: 1 },
            { id: 'knoblauch-layer', customGenerator: this.generateKnoblauch.bind(this), attributes: { fill: '#fffacd' }, count: 12 },
            { id: 'basilikum-layer', customGenerator: this.generateBasilikum.bind(this), attributes: { fill: '#008000' }, count: 12 },
            { id: 'spiegelei-layer', customGenerator: this.generateSpiegelei.bind(this), attributes: {}, count: 2, placementRadius: 50 },
            { id: 'gekochtes-ei-layer', customGenerator: this.generateGekochtesEi.bind(this), attributes: {}, count: 2, placementRadius: 50 },
            { id: 'ei-layer', customGenerator: this.generateGekochtesEi.bind(this), attributes: {}, count: 2, placementRadius: 50 },
            { id: 'oregano-layer', elementType: 'circle', attributes: { r: 1, fill: '#556b2f' }, count: 150 },
            { id: 'origano-layer', elementType: 'circle', attributes: { r: 1, fill: '#556b2f' }, count: 150 },
            { id: 'krauter-layer', elementType: 'circle', attributes: { r: 1, fill: '#556b2f' }, count: 150 },
            { id: 'vier-gemuse-sorten-layer', customGenerator: this.generateVierGemuse.bind(this), attributes: {}, count: 1 },
            { id: 'ananas-layer', customGenerator: this.generateAnanas.bind(this), attributes: { fill: '#ffdb58' }, count: 15 },
            { id: 'parmesansplitter-layer', customGenerator: this.generateParmesansplitter.bind(this), attributes: { fill: '#fffacd' }, count: 12 },
            { id: 'cocktailsauce-layer', customGenerator: this.generateCocktailsauce.bind(this), attributes: { fill: '#ff6347' }, count: 10 },
        ];
    }

    /**
     * Show an ingredient layer
     * @param {string} svgLayerId - The SVG layer ID
     */
    showIngredient(svgLayerId) {
        const layer = document.getElementById(svgLayerId);
        if (layer) {
            layer.style.opacity = '1';
        }
    }

    /**
     * Hide an ingredient layer
     * @param {string} svgLayerId - The SVG layer ID
     */
    hideIngredient(svgLayerId) {
        const layer = document.getElementById(svgLayerId);
        if (layer) {
            layer.style.opacity = '0';
        }
    }

    /**
     * Clear all ingredient layers
     */
    clearPizza() {
        const layers = this.container.querySelectorAll('.ingredient-layer');
        layers.forEach((layer, index) => {
            // Keep base pizza visible (first layer)
            layer.style.opacity = index === 0 ? '1' : '0';
        });
    }

    /**
     * Render pizza with given ingredient layer IDs
     * @param {Array<string>} ingredientSvgLayers - Array of SVG layer IDs
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

    // === Custom Ingredient Generators ===

    generateParmesan(attributes, position) {
        const size = 6;
        const points = [
            `${position.x},${position.y - size / 2}`,
            `${position.x + size / 2},${position.y + size / 2}`,
            `${position.x - size / 2},${position.y + size / 2}`
        ].join(' ');
        return this.createSvgElement('polygon', { points, ...attributes });
    }

    generateBrie(attributes, position) {
        const size = 12;
        const d = `M${position.x - size},${position.y} A${size},${size} 0 0,1 ${position.x + size},${position.y} L${position.x},${position.y + size} Z`;
        return this.createSvgElement('path', { d, ...attributes });
    }

    generateTonno(attributes, position) {
        const size = 10;
        const points = [
            `${position.x},${position.y - size}`,
            `${position.x - size},${position.y + size}`,
            `${position.x + size},${position.y + size}`
        ].join(' ');
        return this.createSvgElement('polygon', { points, ...attributes });
    }

    generatePilze(attributes, position) {
        const capWidth = 20, capHeight = 10, stemWidth = 6, stemHeight = 12;
        const x = position.x, y = position.y;
        const capPath = `M${x - capWidth / 2},${y} C${x - capWidth / 2 + 5},${y - capHeight} ${x + capWidth / 2 - 5},${y - capHeight} ${x + capWidth / 2},${y} Z`;
        const stemPath = `M${x - stemWidth / 2},${y} L${x - stemWidth / 2},${y + stemHeight} L${x + stemWidth / 2},${y + stemHeight} L${x + stemWidth / 2},${y} Z`;
        const group = this.createSvgElement('g', {});
        const cap = this.createSvgElement('path', { d: capPath, fill: attributes.fill });
        const stem = this.createSvgElement('path', { d: stemPath, fill: '#f5deb3' });
        group.appendChild(cap);
        group.appendChild(stem);
        const rotation = Math.random() * 360;
        group.setAttribute('transform', `rotate(${rotation} ${x} ${y})`);
        return group;
    }

    generateSpinach(attributes, position) {
        const size = 10;
        const d = `M${position.x - size},${position.y} Q${position.x},${position.y - size * 2} ${position.x + size},${position.y} T${position.x - size},${position.y}`;
        const leaf = this.createSvgElement('path', { d, ...attributes });
        const rotation = Math.random() * 360;
        leaf.setAttribute('transform', `rotate(${rotation} ${position.x} ${position.y})`);
        return leaf;
    }

    generateLombardi(attributes, position) {
        const x = position.x, y = position.y, size = 10;
        const pathData = `M ${x},${y} q ${size / 2},-${size} ${size},0 c ${size / 2},${size} -${size / 2},${size * 1.5} -${size},${size} s -${size / 2},-${size} 0,-${size} z`;
        const chili = this.createSvgElement('path', { d: pathData, ...attributes });
        const rotation = Math.random() * 360;
        chili.setAttribute('transform', `rotate(${rotation} ${x} ${y})`);
        return chili;
    }

    generateKnoblauch(attributes, position) {
        const size = 6;
        const d = `M${position.x},${position.y} Q${position.x - size},${position.y - size} ${position.x},${position.y - size * 2} Q${position.x + size},${position.y - size} ${position.x},${position.y}`;
        return this.createSvgElement('path', { d, ...attributes });
    }

    generateBasilikum(attributes, position) {
        const size = 5;
        const d = `M${position.x},${position.y} Q${position.x - size},${position.y - size} ${position.x},${position.y - size * 2} Q${position.x + size},${position.y - size} ${position.x},${position.y}`;
        const leaf = this.createSvgElement('path', { d, ...attributes });
        const rotation = Math.random() * 360;
        leaf.setAttribute('transform', `rotate(${rotation} ${position.x} ${position.y})`);
        return leaf;
    }

    generateSpiegelei(attributes, position) {
        const group = this.createSvgElement('g', {});
        const white = this.createSvgElement('circle', { cx: position.x, cy: position.y, r: 20, fill: 'white' });
        const yolk = this.createSvgElement('circle', { cx: position.x, cy: position.y, r: 10, fill: 'yellow' });
        group.appendChild(white);
        group.appendChild(yolk);
        return group;
    }

    generateGekochtesEi(attributes, position) {
        const group = this.createSvgElement('g', {});
        const egg = this.createSvgElement('ellipse', { cx: position.x, cy: position.y, rx: 15, ry: 25, fill: 'white' });
        const yolk = this.createSvgElement('circle', { cx: position.x, cy: position.y, r: 8, fill: '#FFD700' });
        group.appendChild(egg);
        group.appendChild(yolk);
        return group;
    }

    generateAnanas(attributes, position) {
        const size = 20;
        const x = position.x, y = position.y;
        const d = `M${x},${y} L${x + size},${y} A${size},${size} 0 0,0 ${x},${y - size} Z`;
        const path = this.createSvgElement('path', { d, ...attributes });
        const rotation = Math.random() * 360;
        path.setAttribute('transform', `rotate(${rotation} ${x} ${y})`);
        return path;
    }

    generateSardellen(attributes, position) {
        const size = 15;
        const d = `M${position.x - size},${position.y} Q${position.x},${position.y - size / 2} ${position.x + size},${position.y} Q${position.x},${position.y + size / 2} ${position.x - size},${position.y}`;
        const fish = this.createSvgElement('path', { d, ...attributes });
        const rotation = Math.random() * 360;
        fish.setAttribute('transform', `rotate(${rotation} ${position.x} ${position.y})`);
        return fish;
    }

    generateShrimps(attributes, position) {
        const size = 10;
        const d = `M${position.x},${position.y} C${position.x + size},${position.y - size} ${position.x + size},${position.y + size} ${position.x},${position.y + size} C${position.x - size},${position.y + size} ${position.x - size},${position.y - size} ${position.x},${position.y}`;
        const shrimp = this.createSvgElement('path', { d, ...attributes });
        const rotation = Math.random() * 360;
        shrimp.setAttribute('transform', `rotate(${rotation} ${position.x} ${position.y})`);
        return shrimp;
    }

    generateMeeresfruchte(attributes, position) {
        return this.generateShrimps(attributes, position);
    }

    generateRucola(attributes, position) {
        const pathData = `M ${position.x},${position.y} c -5,-15 -10,-30 0,-45 c 10,15 5,30 0,45 z`;
        const leaf = this.createSvgElement('path', { d: pathData, ...attributes });
        const rotation = Math.random() * 360;
        leaf.setAttribute('transform', `rotate(${rotation} ${position.x} ${position.y})`);
        return leaf;
    }

    generateBalsamicoGlaze(attributes) {
        const d = `M50,200 C150,100 150,100 250,200`;
        return this.createSvgElement('path', { d, ...attributes });
    }

    generateCocktailSosse(attributes) {
        const d = `M50,220 C150,120 150,120 250,220`;
        return this.createSvgElement('path', { d, ...attributes });
    }

    generateVierGemuse(attributes, position) {
        const group = this.createSvgElement('g', {});
        const vegetables = [
            { generator: this.generatePaprika.bind(this), count: 5 },
            { generator: this.generateZucchini.bind(this), count: 5 },
            { generator: this.generateMelanzane.bind(this), count: 5 },
            { generator: this.generatePilze.bind(this), count: 5 }
        ];
        vegetables.forEach(veg => {
            for (let i = 0; i < veg.count; i++) {
                const vegPosition = this.getRandomPositionInCircle();
                const vegElement = veg.generator({}, vegPosition);
                group.appendChild(vegElement);
            }
        });
        return group;
    }

    generatePaprika(attributes, position) {
        const ellipse = this.createSvgElement('ellipse', { cx: position.x, cy: position.y, rx: 10, ry: 5, fill: '#ff4500' });
        const rotation = Math.random() * 360;
        ellipse.setAttribute('transform', `rotate(${rotation} ${position.x} ${position.y})`);
        return ellipse;
    }

    generateZucchini(attributes, position) {
        const ellipse = this.createSvgElement('ellipse', { cx: position.x, cy: position.y, rx: 10, ry: 5, fill: '#9acd32' });
        const rotation = Math.random() * 360;
        ellipse.setAttribute('transform', `rotate(${rotation} ${position.x} ${position.y})`);
        return ellipse;
    }

    generateMelanzane(attributes, position) {
        const ellipse = this.createSvgElement('ellipse', { cx: position.x, cy: position.y, rx: 15, ry: 8, fill: '#800080' });
        const rotation = Math.random() * 360;
        ellipse.setAttribute('transform', `rotate(${rotation} ${position.x} ${position.y})`);
        return ellipse;
    }

    generateKrautertopfenkase(attributes, position) {
        const circle = this.createSvgElement('circle', { cx: position.x, cy: position.y, r: 12, fill: '#f5deb3' });
        const rotation = Math.random() * 360;
        circle.setAttribute('transform', `rotate(${rotation} ${position.x} ${position.y})`);
        return circle;
    }

    generateKrauterkase(attributes, position) {
        const rect = this.createSvgElement('rect', {
            x: position.x - 10,
            y: position.y - 10,
            width: 20,
            height: 20,
            fill: '#f4a460',
            rx: 4,
            ry: 4
        });
        const rotation = Math.random() * 360;
        rect.setAttribute('transform', `rotate(${rotation} ${position.x} ${position.y})`);
        return rect;
    }

    generateKaminwurz(attributes, position) {
        const ellipse = this.createSvgElement('ellipse', {
            cx: position.x,
            cy: position.y,
            rx: 5,
            ry: 20,
            fill: '#8b4513'
        });
        const rotation = Math.random() * 360;
        ellipse.setAttribute('transform', `rotate(${rotation} ${position.x} ${position.y})`);
        return ellipse;
    }

    generateParmesansplitter(attributes, position) {
        const polygon = this.createSvgElement('polygon', {
            points: `${position.x},${position.y} ${position.x + 10},${position.y - 5} ${position.x + 5},${position.y + 10}`,
            fill: '#fffacd'
        });
        const rotation = Math.random() * 360;
        polygon.setAttribute('transform', `rotate(${rotation} ${position.x} ${position.y})`);
        return polygon;
    }

    generateCocktailsauce(attributes, position) {
        const ellipse = this.createSvgElement('ellipse', {
            cx: position.x,
            cy: position.y,
            rx: 15,
            ry: 8,
            fill: '#ff6347'
        });
        const rotation = Math.random() * 360;
        ellipse.setAttribute('transform', `rotate(${rotation} ${position.x} ${position.y})`);
        return ellipse;
    }
}
