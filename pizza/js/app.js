/**
 * Main Application Entry Point
 */

import { DataLoader } from './data-loader.js';
import { PizzaVisualizer } from './pizza-visualizer.js';
import { SearchEngine } from './search.js';
import { UIController } from './ui-controller.js';

class PizzaApp {
    constructor() {
        this.dataLoader = null;
        this.visualizer = null;
        this.searchEngine = null;
        this.uiController = null;
    }

    /**
     * Initialize and start the application
     */
    async initialize() {
        try {
            console.log('Initializing Pizza Creator Application...');

            // Initialize modules
            this.dataLoader = new DataLoader();
            this.visualizer = new PizzaVisualizer('pizza-container');
            this.searchEngine = new SearchEngine(this.dataLoader);
            this.uiController = new UIController(this.dataLoader, this.visualizer, this.searchEngine);

            // Initialize UI
            await this.uiController.initialize();

            console.log('Pizza Creator Application initialized successfully!');

        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Handle initialization errors
     */
    handleInitializationError(error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); max-width: 500px; padding: 20px;';
        errorDiv.innerHTML = `
            <h2>Failed to Load Application</h2>
            <p>${error.message}</p>
            <p>Please refresh the page or contact support if the problem persists.</p>
        `;
        document.body.appendChild(errorDiv);
    }
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new PizzaApp();
    app.initialize();
});

// Export for debugging purposes
if (typeof window !== 'undefined') {
    window.PizzaApp = PizzaApp;
}
