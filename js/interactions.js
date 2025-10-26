import { MP_CIRCLE_RADIUS, MP_CIRCLE_RADIUS_SELECTED } from './shared_constants.js';
import { populateExplainerPanel } from './explainerPanel.js';

// Handle mouse movement
export const handleMouseEvents = (data, value_field) => {
    // Fixed to accom-swarm right now
    d3.select("#accom-swarm").selectAll("circle")
        .on("mouseenter", (e, d) => {
            console.log("DOM event", e);
            console.log("Attached datum", d);

            d3.select(".tooltip")
                .attr("transform", `translate(0,0)`)
                .transition()
                    .duration(500)
                    .style("opacity", 1);
            

            const tooltipContent = d3.select(".tooltip-content")

            // Change the image source based on the MP's ID
            tooltipContent.select(".mp-image")
                .attr("xlink:href", `https://members-api.parliament.uk/api/Members/${d['mp_id']}/Thumbnail`);

            tooltipContent.select(".mp-name")
                    .text(`${d['name']}`);
            
            tooltipContent.select(".mp-value")
                    .text(`£${d3.format("(,.0f")(d[value_field])}`);

            // Translate the tooltip to the mouse position
            // Using the circle's position
            // e.layerX and e.layerY are the mouse coordinates relative to the viewport
            // If this is more than half the width of the screen, move it to the left
            let xPosition = e.layerX;
            let yPosition = e.layerY;

            if (xPosition > 420 / 2) {
                xPosition -= 100; // Adjust to keep tooltip within viewport
            } else {
                xPosition += 5;
                } // Adjust to keep tooltip to the right of the mouse
            if (yPosition > 520 / 2) {
                yPosition -= 100; // Adjust to keep tooltip within viewport
            } else {
                yPosition += 1; // Adjust to keep tooltip below the mouse
            }
            // Set the tooltip position
            // Using the mouse position
            // e.layerX and e.layerY are the mouse coordinates relative to the viewport
            d3.select(".tooltip")
                .style("opacity", 1)
                .attr("transform", `translate(${xPosition}, ${yPosition})`);

            // Make sure tooltip text and image fit within the tooltip
            d3.select(".tooltip-content")
                .select(".mp-image")
                .attr("width", 50) // Set the width of the image
                .attr("height", 50) // Set the height of the image
                .attr("x", 25) // Center the image horizontally
                .attr("y", 10); // Position the image vertically

            d3.select(".tooltip-content")
                .select(".mp-name")
                .attr("x", 50) // Center the text horizontally
                .attr("y", 75) // Position the text below the image
                .style("font-size", "12px")
                .style("font-weight", 500);


            //d3.select(".tooltip")
            //    .attr("transform", `translate(${e.layerX}, ${e.layerY})`);
        })
        .on("mouseleave", e => {
            d3.select(".tooltip")
                .style("opacity", 0)
                .attr("transform", `translate(0,1000)`);
        })
        .on("click", (e, d) => {
            e.stopPropagation();
            selectIndividualMPCircle(d);
        });
};

// Function to select an individual MP's circle, highlight it and show their info in the explainer panel
export function selectIndividualMPCircle(mp) {
    // mp should be the full MP data object
    selectCircle(mp.mp_id, true);
    populateExplainerPanel(mp);
    if (window.innerWidth <= 820) {
        document.getElementById('info-panel').classList.add('popup-open');
    }
}

// Function to update the opacity of circles, highlighting or dimming them based on the inclusions list
export const updateCircleOpacity = (inclusions) => {
    // Select all circles in #accom-swarm
    d3.select("#accom-swarm")
        .selectAll(".circ")
        .transition() // Smooth transition for opacity changes
        .duration(300)
        .style("opacity", d => {
            if (inclusions.length === 0) {
                return 0.8; // Set opacity to 0.8 if inclusions list is empty
            }
            return inclusions.includes(d.mp_id) ? 1 : 0.3;  // Highlight inclusions, dim exclusions
         });
};

// Function to select or deselect an individual circle, making it larger or smaller
export const selectCircle = (mp_id, select_or_deselect) => {
    d3.select("#accom-swarm")
        .selectAll(".circ")
        .transition() // Smooth transition for size changes
        .duration(300)
        .attr("r", d => {
            if (d.mp_id === mp_id) {
                return select_or_deselect ? MP_CIRCLE_RADIUS_SELECTED : MP_CIRCLE_RADIUS; // Enlarge if selected, shrink if deselected
            }
            return MP_CIRCLE_RADIUS; // Default size for other circles
        });
}

