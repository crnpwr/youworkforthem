// Create an attractive tooltip for the swarm chart
// It will start off-screen and invisible, and will be positioned and filled based on handleMouseEvents in interactions.js
// We need to make sure it fits the content from .mp-image and .mp-name
export function createSwarmTooltip(innerChart) {
    const tooltipWidth = 100;
    const tooltipHeight = 100;

    const tooltip = innerChart
        .append("g")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .attr("transform", `translate(0,1000)`); // Start off-screen

    tooltip.append("rect")
        .attr("width", tooltipWidth)
        .attr("height", tooltipHeight)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("class", "swarm-tooltip-rect")
        .attr("fill-opacity", 0.85);

    const tooltipContent = tooltip.append("g")
        .attr("class", "tooltip-content");

    // Add an image inside the tooltip
    tooltipContent.append("image")
        .attr("class", "mp-image")
        .attr("xlink:href", "https://members-api.parliament.uk/api/Members/5330/Thumbnail")
        .attr("width", 50) // Set the width of the image
        .attr("height", 50) // Set the height of the image
        .attr("x", tooltipWidth / 2 - 25) // Center the image horizontally
        .attr("y", 10); // Position the image vertically

    // Add MP name below the image, so that it shrinks to fit the tooltip width
    tooltipContent.append("text")
        .attr("class", "mp-name")
        .attr("x", tooltipWidth / 2)
        .attr("y", 70)
        .text("MP Name")
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", 350);
    
    tooltipContent.append("text")
        .attr("class", "mp-value")
        .attr("x", tooltipWidth / 2)
        .attr("y", 90)
        .text("£0") // Placeholder
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", 275);
}