//import { drawMpSwarm } from './swarmGraph.js';
import { createExpenseFilterButtons, createMpFilterButtons } from './filters.js';
import { setupPanelPopup, populateExplainerPanel } from './explainerPanel.js';
import { mpFilters } from './shared_constants.js';

// Main entry point
document.addEventListener("DOMContentLoaded", function () {
    d3.csv("data/mp_data_summary.csv", d3.autoType).then(data => {
        // Make mpData globally accessible
        window.mpData = data;
        window.mpFilters = mpFilters;
        window.mpFilterData = data;

        // Draw the initial swarm graph
        //drawMpSwarm (data, "expenses_total", true);

        // Create filter buttons
        createExpenseFilterButtons(data);
        createMpFilterButtons(data);

        // Set up the explainer panel and popup panel logic
        populateExplainerPanel();
        setupPanelPopup();

        // Set up the MP search functionality
        import('./search.js');
    });
});