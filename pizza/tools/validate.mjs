#!/usr/bin/env node
/**
 * Data validator for the Pizza Creator app.
 *
 * Checks:
 *  - restaurants.json registry: required fields, unique ids, data files exist
 *  - every restaurant file: structure, unique ingredient/pizza ids,
 *    no dangling pizza -> ingredient references
 *  - every ingredient's svgLayer has a definition in pizza-visualizer.js
 *  - registry pizzaCount matches the actual number of pizzas
 *
 * Usage:
 *   node pizza/tools/validate.mjs          # validate, exit 1 on errors
 *   node pizza/tools/validate.mjs --fix    # also rewrite stale pizzaCount values
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const pizzaDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fix = process.argv.includes('--fix');

let errors = 0;
let warnings = 0;
const error = (msg) => { errors++; console.error(`  ERROR   ${msg}`); };
const warn = (msg) => { warnings++; console.warn(`  warning ${msg}`); };

// --- Defined SVG layers (parsed from the visualizer source) ---
const vizSource = await readFile(path.join(pizzaDir, 'js/pizza-visualizer.js'), 'utf8');
const definedLayers = new Set([...vizSource.matchAll(/id:\s*'([a-z0-9-]+-layer)'/g)].map(m => m[1]));
console.log(`SVG layer definitions found in visualizer: ${definedLayers.size}`);

// --- Registry ---
const registryPath = path.join(pizzaDir, 'data/restaurants.json');
const registry = JSON.parse(await readFile(registryPath, 'utf8'));

const registryIds = new Set();
const requiredRegistryFields = ['id', 'name', 'displayName', 'location', 'country', 'region', 'dataFile', 'enabled'];

let registryDirty = false;

for (const entry of registry.restaurants) {
    const label = entry.id || entry.name || '<unnamed>';
    console.log(`\nRestaurant: ${label}`);

    for (const field of requiredRegistryFields) {
        if (!(field in entry)) error(`registry entry missing field "${field}"`);
    }

    if (registryIds.has(entry.id)) error(`duplicate registry id "${entry.id}"`);
    registryIds.add(entry.id);

    const dataPath = path.join(pizzaDir, 'data', entry.dataFile || '');
    if (!entry.dataFile || !existsSync(dataPath)) {
        error(`data file not found: data/${entry.dataFile}`);
        continue;
    }

    // --- Restaurant data file ---
    let data;
    try {
        data = JSON.parse(await readFile(dataPath, 'utf8'));
    } catch (e) {
        error(`invalid JSON in data/${entry.dataFile}: ${e.message}`);
        continue;
    }

    if (!data.restaurant || !data.ingredients?.categories || !Array.isArray(data.pizzas)) {
        error(`data/${entry.dataFile}: missing restaurant/ingredients.categories/pizzas`);
        continue;
    }

    // Ingredients
    const ingredientIds = new Set();
    for (const [catId, category] of Object.entries(data.ingredients.categories)) {
        if (!Array.isArray(category.items)) {
            error(`category "${catId}" has no items array`);
            continue;
        }
        for (const ing of category.items) {
            if (!ing.id || !ing.name || !ing.svgLayer) {
                error(`category "${catId}": ingredient missing id/name/svgLayer: ${JSON.stringify(ing)}`);
                continue;
            }
            if (ingredientIds.has(ing.id)) error(`duplicate ingredient id "${ing.id}"`);
            ingredientIds.add(ing.id);

            if (!definedLayers.has(ing.svgLayer)) {
                warn(`ingredient "${ing.name}" (${ing.id}) has no SVG definition for layer "${ing.svgLayer}"`);
            }
        }
    }

    // Pizzas
    const pizzaIds = new Set();
    for (const pizza of data.pizzas) {
        if (!pizza.id || !pizza.name || !Array.isArray(pizza.ingredients)) {
            error(`pizza missing id/name/ingredients: ${JSON.stringify(pizza).slice(0, 80)}`);
            continue;
        }
        if (pizzaIds.has(pizza.id)) error(`duplicate pizza id "${pizza.id}"`);
        pizzaIds.add(pizza.id);

        for (const ref of pizza.ingredients) {
            if (!ingredientIds.has(ref)) {
                error(`pizza "${pizza.name}" references unknown ingredient "${ref}"`);
            }
        }
    }

    // pizzaCount drift
    if (entry.pizzaCount !== data.pizzas.length) {
        if (fix) {
            console.log(`  fixed   pizzaCount ${entry.pizzaCount} -> ${data.pizzas.length}`);
            entry.pizzaCount = data.pizzas.length;
            registryDirty = true;
        } else {
            error(`registry pizzaCount is ${entry.pizzaCount} but data has ${data.pizzas.length} pizzas (run with --fix)`);
        }
    }

    console.log(`  ok      ${ingredientIds.size} ingredients, ${data.pizzas.length} pizzas`);
}

// Orphaned data files not referenced by the registry
const dataFiles = (await readdir(path.join(pizzaDir, 'data/restaurants')))
    .filter(f => f.endsWith('.json') && !f.startsWith('_'));
const referenced = new Set(registry.restaurants.map(r => path.basename(r.dataFile || '')));
for (const f of dataFiles) {
    if (!referenced.has(f)) warn(`data/restaurants/${f} is not referenced by restaurants.json`);
}

if (registryDirty) {
    await writeFile(registryPath, JSON.stringify(registry, null, 2) + '\n');
    console.log('\nrestaurants.json updated');
}

console.log(`\n${errors} error(s), ${warnings} warning(s)`);
process.exit(errors > 0 ? 1 : 0);
