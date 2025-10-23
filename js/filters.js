import { mpFilters, expenseTypes } from './shared_constants.js';
import { updateCircleOpacity } from './interactions.js';
import { drawMpSwarm } from './swarmGraph.js';

// Create filter buttons for each expense type
export const createExpenseFilterButtons = (data) => {
    const buttonContainer = d3.select("#filter-buttons");

    // Add text line
    buttonContainer.append("p")
        .attr("class", "filter-text")
        .text("Explore financial records for");

    expenseTypes.forEach((type, i) => {
        const btn = buttonContainer
            .append("button")
            .attr("class", "filter-button")
            .attr("data-type", type.id)
            .html(`<span style="font-size: 1.5em;">${type.emoji}</span> ${type.name}`)
            .on("click", () => {
                d3.selectAll(".filter-button").classed("active", false);
                d3.select(`.filter-button[data-type="${type.id}"]`).classed("active", true);
                d3.selectAll(".filter-button-mp").classed("active", false);
                drawMpSwarm(data, type.value_field, false);
                d3.select("#accom-swarm-header").text(type.header_text);
            });

        // Set the first button as active and draw the initial graph
        if (i === 1) {
            btn.classed("active", true);
            drawMpSwarm(data, type.value_field, true); // true for initial draw
            d3.select("#accom-swarm-header").text(type.header_text);
        }
    });
};


// Extracted handler for MP filter button clicks
export function handleMpFilterButtonClick(filter, data) {
    const isActive = d3.select(`.filter-button-mp[data-type="${filter.id}"]`).classed("active");
    if (isActive) {
        d3.select(`.filter-button-mp[data-type="${filter.id}"]`).classed("active", false);
    }
    else {
        d3.select(`.filter-button-mp[data-type="${filter.id}"]`)
            .classed("active", true); // Add active class to the clicked button
    }
    // Filter the data based on the active filters
    filterMPCircles(data); // Call the filter function to update circle opacity
}

export const createMpFilterButtons = async (data) => {
    const buttonContainer = d3.select("#mp-filter-buttons"); // Select the container for MP filter buttons

     // Add text line
    buttonContainer.append("p")
        .attr("class", "filter-text")
        .text("Highlight MPs");

    // Create buttons for each filter
    mpFilters.forEach(filter => {
        buttonContainer
            .append("button")
            .attr("class", "filter-button-mp")
            .attr("data-type", filter.id) // Use the filter id as data-type
            .text(`${filter.emoji} ${filter.name}`) // Use emoji and name for button label
            .on("click", () => handleMpFilterButtonClick(filter, data));
    });
};


function filterMPCircles(data) {
    // Get all active filter buttons
    const activeButtons = Array.from(document.querySelectorAll('.filter-button-mp.active'));

    // If no filter buttons are active, pass an empty list
    if (activeButtons.length === 0) {
        updateCircleOpacity([]);
        return;
    }

    // Build a list of {field, value} pairs from active buttons
    const activeFilters = activeButtons.map(btn => {
        const filterId = btn.getAttribute('data-type');
        // Find the corresponding filter in mpFilters to get the field and value
        const filterObj = mpFilters.find(f => f.id === filterId);
        return {
            field: filterObj.field,
            value: filterObj.value
        };
    });

    // Filter data: keep MPs that match ALL active filters
    const filtered = data.filter(mp =>
        activeFilters.every(f => String(mp[f.field]) === String(f.value))
    );

    const mp_list = filtered.map(mp => mp.mp_id); // Get the list of mp_ids from the filtered MPs
    
    // If there's no filtered MPs, set mp_list to [0] to reset the opacity
    if (mp_list.length === 0) {
        mp_list.push(0); // Reset to a default value to avoid empty selection
    }

    // Map to mp_id and update circle opacity
    updateCircleOpacity(mp_list);
}
