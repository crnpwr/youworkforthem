import { partyColours, MP_CIRCLE_RADIUS, MP_CIRCLE_RADIUS_SELECTED } from './shared_constants.js';
import { handleMouseEvents, selectCircle, updateCircleOpacity } from './interactions.js';
import { populateExplainerPanel } from './explainerPanel.js';
import { createSwarmTooltip } from './tooltips.js';


// Swarm graph for MPs, value_field placing them on a vertical axis.
// This is a force-directed graph where each circle represents an MP's claim
export const drawMpSwarm = (data, value_field, draw_new) => {
    const margin = {top: 5, left: 45, right: 40, bottom: 20};
    
    // Responsive chart dimensions
    let width, height;
    if (window.innerWidth <= 500) {
        width = 350;
        height = 700;
    } else if (window.innerWidth <= 700) {
        width = 500;
        height = 600;
    }
    else {
        width = 500;
        height = 500;
    }

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    let innerChart;

    if (draw_new) {
        // If drawing a new chart, set up the SVG and inner chart
        // Append SVG container
        const svg = d3.select("#accom-swarm")
            .append("svg")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("viewBox", `0, 0, ${width}, ${height}`);

        // Append inner chart group
        innerChart = svg
            .append("g")
            .attr("class", "inner-chart")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);
        
        // Add click handler to SVG background to reset highlights
        svg.on("click", function() {
            selectCircle(0); // Reset circle selection
            populateExplainerPanel();
    });
    } else {
        // If not drawing a new chart, just select the existing innerChart
        innerChart = d3.select("#accom-swarm").select(".inner-chart");

        // Clear existing circles
        innerChart.selectAll(".circ")
            .transition()
                .duration(10000)
                .style("opacity", 0)
                .attr("cx", innerWidth/2);
                //.remove()
            //.on("end", () => {
        // Remove all circles after transition ends 
            //innerChart.selectAll(".circ").remove();
        //});
        
        innerChart.selectAll(".circ")
            .remove();
        
        // Clear existing axes
        innerChart.selectAll(".axis-y")
            .remove();

        // Clear existing tooltip
        innerChart.selectAll(".tooltip")
            .remove();
    }

    
    // Declare scales
    const maxAccomClaim = d3.max(data, d => d[value_field]);
    const yScale = d3.scaleLinear()
        .domain([0, maxAccomClaim])
        .range([innerHeight, 0])
        .nice();
    const colorScale = d3.scaleOrdinal()
        .domain(partyColours.map(s => s.name))
        .range(partyColours.map(s => s.color));
    
    // Append axes
    const leftAxis = d3.axisLeft(yScale)
        .tickFormat(d => `£${d3.format(",.0f")(d)}`);;
    innerChart
        .append("g")
            .attr("class", "axis-y")
            .call(leftAxis);
    
    // If there are more than 25 MPs with a value of 0, filter them out
    if (data.filter(d => d[value_field] === 0).length > 25) {
        data = data.filter(d => d[value_field] > 0);
    }
    // Data binding
    innerChart
        .selectAll(".circ")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "circ")
        .attr("stroke", "grey")
        .attr("id", d => d["mp_id"])
        .attr("fill", d => colorScale(d["party"]))
        .attr("r", MP_CIRCLE_RADIUS)
        .attr("cx", innerWidth/2)
        .attr("cy", d => yScale(d[value_field]))
        .attr("opacity", 0.6);

    // Force simulation
    let simulation = d3.forceSimulation(data)
    
        .force("x", d3.forceX((d) => {
            return innerWidth/2;
            }).strength(1))
        
        .force("y", d3.forceY((d) => {
            return yScale(d[value_field]);
            }).strength(1))
        
        .force("collide", d3.forceCollide(MP_CIRCLE_RADIUS*2))
        
        .alphaDecay(0.02)
        .alpha(0.4)
        .on("tick", tick);
    
    // Run force sim
    function tick() {
        d3.selectAll(".circ")
            .attr("cx", (d) => d.x)
            // Best not to use this as can alter y position, giving false values
            // .attr("cy", (d) => d.y);
        }

    handleMouseEvents(data, value_field);
    createSwarmTooltip(innerChart); // Create the tooltip for the swarm chart

    // Generate an array of numbers from 0 to 9999
    const allNumbers = Array.from({ length: 10000 }, (_, i) => i);

    // Call updateCircleOpacity with the array
    updateCircleOpacity(allNumbers);

    // Restore explainer panel to default
    populateExplainerPanel();

};