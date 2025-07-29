// landlord-scroll.js
// Entry point for the landlord-focused scroll/story experience
import { loadMpData } from './dataLoader.js';

// Constants
let landlordMps = [];
const WIDTH = window.innerWidth / 2;
const HEIGHT = window.innerHeight / 2;
const MARGIN = 40;
const MP_CIRCLE_RADIUS = 10;
const MP_CIRCLE_RADIUS_SELECTED = 20;

const selectCircle = (mp_id, select_or_deselect) => {
    d3.select("svg")
        .selectAll(".circ")
        .transition() // Smooth transition for size changes
        .duration(300)
        .attr("r", d => {
            if (d.mp_id === mp_id) {
                return select_or_deselect ? MP_CIRCLE_RADIUS_SELECTED : MP_CIRCLE_RADIUS; // Enlarge if selected, shrink if deselected
            }
            return MP_CIRCLE_RADIUS; // Default size for other circles
        });
};

const resizeCirclesOnPropertyCount = () => {
    const svg = d3.select("svg");

    svg.selectAll(".circ")
        .transition()
        .duration(300)
        .attr("r", d => {
            const newRadius = MP_CIRCLE_RADIUS * Math.sqrt(d.RentalProperties);

            // Update the corresponding pattern size
            //console.log(d.mp_id);
            const pattern = svg.select(`pattern[id="${d.mp_id}"]`);
            if (!pattern.empty()) {
                pattern
                    .attr('width', newRadius * 2)
                    .attr('height', newRadius * 2);

                pattern.select("image")
                    .attr('width', newRadius * 2)
                    .attr('height', newRadius * 2);
            } else {
                console.warn(`Pattern not found for MP ID: ${d.mp_id}`);
            }

            return newRadius;
        })
        .attr("fill", d => `url(#${d.mp_id})`); // Refresh the fill attribute
};

const resizeCirclesToDefaultSize = () => {
    d3.select("svg")
        .selectAll(".circ")
        .transition() // Smooth transition for size changes
        .duration(300)
        .attr("r", MP_CIRCLE_RADIUS); // Reset to default size
};

export const updateCircleOpacity = (inclusions) => {
    // Select all circles in #accom-swarm
    d3.select("svg")
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

// Scrollama Setup
function setupScrollama(scroller, step, figure) {
    const stepFunctions = {
        "rental-crisis-intro": (enterOrExit, direction) => {
            if (enterOrExit === "enter") {
                // Show the rental crisis intro
                if (direction === 'up') {
                    drawRentLineChart(figure.select("svg"));
                }
            } else {
                if (direction === 'down'){
                // Delete line chart with transition
                d3.select(".line-chart")
                    .transition()
                    .duration(600)
                    .style("opacity", 0)
                    .remove()
                }
            }
        },
        "outline-of-houses" : (enterOrExit, direction) => {
            if (enterOrExit === "enter") {
                // Lay out 180 houses in a grid
                const numHouses = 180;
                const sqrtHouses = Math.ceil(Math.sqrt(numHouses));
                const houseWidth = WIDTH / sqrtHouses;
                const houseHeight = HEIGHT / sqrtHouses;
                const numAgricultural = 5;
                const numBusinessandCommercial = 17;

                const houseData = Array.from({ length: numHouses }, (_, i) => ({
                    x: (i % sqrtHouses) * houseWidth,
                    y: Math.floor(i / sqrtHouses) * houseHeight

                }));
                // Show a house emoji for each house
                const svg = d3.select("svg");
                svg.selectAll(".house")
                    .data(houseData)
                    .enter()
                    .append("text")
                    .attr("class", "house")
                    .attr("x", d => d.x + houseWidth / 2)
                    .attr("y", d => d.y + houseHeight / 2)
                    .text("🏠")
                    .style("font-size", "24px")
                    .style("text-anchor", "middle");

                // Replace some houses with agricultural and business/commercial properties
                svg.selectAll(".house")
                    .filter((d, i) => i > 180 - numAgricultural - 1)
                    .text("🌾"); // Agricultural properties
                svg.selectAll(".house")
                    .filter((d, i) => i <= 180 - numAgricultural - 1 && i >= 180 - numAgricultural - numBusinessandCommercial)
                    .text("🏢"); // Business/commercial properties
            }
            else {
                // Remove all houses
                d3.select("svg").selectAll(".house")
                    .transition()
                    .duration(1000)
                    .style("opacity", 0)
                    .remove();
            }},
        "mp-landlords" : (enterOrExit, direction) => {
            if (enterOrExit === "enter") {
                if (direction === 'down') {
                    console.log("Draw circles")
                    // Draw circles for landlord MPs
                    const svg = d3.select("svg");
                    
                    // Reset circle selection
                    selectCircle(0);
                    
                    // Draw circles
                    drawCircles(svg, landlordMps);
                }
            }
            else {
                if (direction === 'up') {
                    // Delete all circles
                    d3.select("svg").selectAll(".circ")
                        .transition()
                        .duration(1000)
                        .style("opacity", 0)
                        .remove()
            }
        }},
                
        "resize-property-holdings": (enterOrExit, direction) => {
            if (enterOrExit === "enter") {
                if (direction === 'down') {
                    resizeCirclesOnPropertyCount();

                    const svg = d3.select("svg");
                    const landlordMpsData = svg.selectAll(".circ").data();

                    /*const simulation = d3.forceSimulation(landlordMpsData)
                        .force("x", d3.forceX(WIDTH / 2).strength(0.1))
                        .force("y", d3.forceY(HEIGHT / 2).strength(0.1))
                        .force("collide", d3.forceCollide(d => MP_CIRCLE_RADIUS * Math.sqrt(d.RentalProperties) * 1.3))
                        .on("tick", () => {
                            svg.selectAll(".circ")
                                .attr("cx", d => d.x)
                                .attr("cy", d => d.y);
                        });

                    simulation.alpha(0.1).restart();*/
            } else {
                if (direction === 'up') {
                    console.log("Please make smaller!");
                    resizeCirclesToDefaultSize();
                }
            }
        }
    },
        "athwal-highlight": (enterOrExit, direction) => {
            if (enterOrExit === "enter") {
                if (direction === 'down') {
                updateCircleOpacity([5227]); // Highlight Athwal circle
            }}
            else {
                if (direction === 'up') {
                updateCircleOpacity([]); // Reset opacity if exiting upwards
            }}
        },
        "athwal-residential-press": (enterOrExit, direction) => {
            if (enterOrExit === "enter") {
                // Overlay image from "imgs/athwal-residential-press.png" on top of svg
                const svg = d3.select("svg");
                svg.append("image")
                    .attr("xlink:href", "imgs/athwal-residential-press.png")
                    .attr("class", "athwal-residential-press")
                    .attr("preserveAspectRatio", "xMinYMin meet")
                    .attr("x", WIDTH * 5 / 8)
                    .attr("y", HEIGHT / 8)
                    .attr("width", "20%");
            }
            else {
                // Remove the image overlay
                d3.select("svg").select(".athwal-residential-press")
                    .transition()
                    .duration(500)
                    .style("opacity", 0)
                    .remove();
            }
        },
        "athwal-commercial-press": (enterOrExit, direction) => {
            if (enterOrExit === "enter") {
                console.log("Athwal commercial press enter");
                // Overlay image from "imgs/athwal-residential-press.png" on top of svg
                const svg = d3.select("svg");
                svg.append("image")
                    .attr("xlink:href", "imgs/athwal-commercial-press.png")
                    .attr("class", "athwal-commercial-press")
                    .attr("preserveAspectRatio", "xMinYMin meet")
                    .attr("x", WIDTH * 3 / 4)
                    .attr("y", HEIGHT / 4)
                    .attr("width", "20%");
            }
            else {
                // Remove the image overlay
                d3.select("svg").select(".athwal-commercial-press")
                    .transition()
                    .duration(500)
                    .style("opacity", 0)
                    .remove();
            }
        },
        "reeves-highlight": (enterOrExit, direction) => {
            updateCircleOpacity([4031]);
        },
        "reeves-expand-74": (enterOrExit, direction) => {
            d3.select('circle[id="4031"]')
                .transition()
                .duration(300)
                .attr("r", d => MP_CIRCLE_RADIUS * Math.sqrt(7.4));
        },
        "reeves-household-income": (enterOrExit, direction) => {
            d3.select('circle[id="4031"]')
                .transition()
                .duration(300)
                .attr("r", d => MP_CIRCLE_RADIUS * Math.sqrt(40.7));
        },
        "reeves-vs-average": (enterOrExit, direction) => {
            if (enterOrExit === "enter") {
            // Create a temporary circle to highlight average income
            let avgIncomeR = MP_CIRCLE_RADIUS * Math.sqrt(3.67);
            let reevesCircle = d3.select('circle[id="4031"]')
            let reevesCircleCx = +reevesCircle.attr("cx");
            let reevesCircleCy = +reevesCircle.attr("cy");
            let reevesCircleR = +reevesCircle.attr("r");

            let ucPipR = MP_CIRCLE_RADIUS * Math.sqrt(2.98);
            // If reevesCircleCx > Width/2, then avgIncomeCx = ReevesCircleCx - ReevesCircleR * 1.1
            let avgIncomeCx = reevesCircleCx > WIDTH / 2 ? reevesCircleCx - reevesCircleR * 1.1 - avgIncomeR : reevesCircleCx + reevesCircleR * 1.1 + avgIncomeR;
            let ucPipCx = reevesCircleCx > WIDTH / 2 ? reevesCircleCx - reevesCircleR * 1.1 - ucPipR - 2.2 * avgIncomeR : reevesCircleCx + reevesCircleR * 1.1 + ucPipR + 2.2 * avgIncomeR;
            d3.select("svg").append("circle")
                .attr("class", "avg-income")
                .attr("cx", avgIncomeCx)
                .attr("cy", reevesCircleCy)
                .attr("r", avgIncomeR)
                .attr("fill", "black")
                //.attr("stroke", "#ff0000")
                //.attr("stroke-width", 2)
                ;
            
            /* Commenting out UC PIP circle, too visually similar to average income circle
            d3.select("svg").append("circle")
                .attr("class", "uc-pip")
                .attr("cx", ucPipCx)
                .attr("cy", reevesCircleCy)
                .attr("r", ucPipR)
                .attr("fill", "black")
                //.attr("stroke", "#0000ff")
                //.attr("stroke-width", 2)
                ;*/}
           
            else {
                // Delete UC and PIP circles
                d3.select("svg").selectAll(".avg-income, .uc-pip").remove();
                // Reset Reeves circle to be like others
                d3.select('circle[id="4031"]')
                    .attr("r", d => MP_CIRCLE_RADIUS * Math.sqrt(1));
                updateCircleOpacity([]);
                
            }
        },
        "anti-renters-rights": (enterOrExit, direction) => {
            if (enterOrExit === "enter") {
                {
                    // Highlight anti-renters landlords
                    const antiRentersLandlords = landlordMps.filter(mp => mp.vote_1905_response_filter === 'True');
                    const antiRentersLandlordsIds = antiRentersLandlords.map(mp => mp.mp_id);
                    console.log("Anti-renters landlords:", antiRentersLandlordsIds);
                    updateCircleOpacity(antiRentersLandlordsIds)
                }
             /*} else {
                    updateCircleOpacity([]); // Reset opacity
                }*/
            }
    }}

    scroller
        .setup({
            step: "#scrolly article .step",
            offset: 0.9,
            debug: false
        })
        .onStepEnter(response => {
            console.log(response);
            const stepKey = response.element.getAttribute("data-step");
            // Call the function for the current step
            if (stepFunctions[stepKey]) {
                console.log(response.direction);
                stepFunctions[stepKey]("enter", response.direction);
            }
            step.classed("is-active", (d, i) => i === response.index);
            figure.select("p").text(response.index + 1);
        })
        .onStepExit(response => {
            const stepKey = response.element.getAttribute("data-step");
            if (stepFunctions[stepKey]) {
                stepFunctions[stepKey]("exit", response.direction);
            }
        });
}

// Data Visualization
function createSVG(figure) {
    return figure
        .append('svg')
            .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`)
            .attr('width', "100%")
            .attr('height', "100%")
            .style('display', 'block');
}


function drawRentLineChart(svg) {
    // Open data in 'data/rent_index.csv'
    d3.csv('data/rent_index.csv').then(data => {
        // Process and visualize the data
        let innerChartArea = svg.append("g")
            .attr("class", "line-chart");

        // Example: Create a line chart of rent index over time, using column "Time period and Region Code"
        // Adapt to format mmm-yyyy
        const parseTime = d3.timeParse("%b-%Y");
        data.forEach(d => {
            d.date = parseTime(d["Time period and Region Code"]);
            d.index = +d["England"];
        });
        const xScale = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([0, WIDTH]);
        
        // y-scale from 70 to 140
        const yScale = d3.scaleLinear()
            .domain([70, 140])
            .range([HEIGHT, 0]);
        const line = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.England));

        innerChartArea.append("path")
            .datum(data)
            .attr("class", "rent-line")
            .attr("d", line)
            .attr("fill", "none")
            .attr("stroke", "#145114")
            .attr("stroke-width", 2);

        // Add axes, placing x-axis at 100 and y-axis on the left
        innerChartArea.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${HEIGHT})`)
            .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat("%b %Y")));
        innerChartArea.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale).ticks(5));
    });
}
function drawCircles(svg, landlordMps) {
    // Keep this for later, allowed to use images as fill patterns
    const defs = svg.append('defs');
    landlordMps.forEach((mp, i) => {
        defs.append('pattern')
            .attr('id', mp.mp_id)
            .attr('patternUnits', 'userSpaceOnUse') // Optimize rendering
            .attr('width', MP_CIRCLE_RADIUS * 2)
            .attr('height', MP_CIRCLE_RADIUS * 2)
            .append('image')
            .attr('xlink:href', mp.thumbnail || 'default-image.png')
            .attr('width', MP_CIRCLE_RADIUS * 2)
            .attr('height', MP_CIRCLE_RADIUS * 2);
    });

    svg.selectAll('circle')
        .data(landlordMps)
        .enter()
        .append('circle')
        .attr('class', 'circ')
        .attr("id", d => d["mp_id"])
        .attr('cx', WIDTH / 2)
        .attr('cy', HEIGHT / 2)
        .attr('r', MP_CIRCLE_RADIUS)
        // Uncomment this line to use images as fill patterns
        //.attr('fill', (d, i) => `url(#${d.mp_id})`)
        .attr('stroke', '#145114')
        .attr('stroke-width', 1.5)
        .append('title')
        .text(d => `${d.name} (${d.party})`);

        
    const simulation = d3.forceSimulation(landlordMps)
        .force("x", d3.forceX(WIDTH / 2).strength(0.5))
        .force("y", d3.forceY(HEIGHT / 2).strength(0.5))
        .force("collide", d3.forceCollide(MP_CIRCLE_RADIUS * 1.5))
        .on("tick", () => {
            svg.selectAll("circle")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });

    simulation.alpha(0.1).restart();
}

// Resize Logic
function setupResize(step, figure, scroller) {
    const handleResize = () => {
        const stepHeight = Math.floor(window.innerHeight * 0.75);
        step.style("height", `${stepHeight}px`);

        const figureHeight = window.innerHeight / 2;
        const figureMarginTop = (window.innerHeight - figureHeight) / 2;

        figure
            .style("height", `${figureHeight}px`)
            .style("top", `${figureMarginTop}px`);

        scroller.resize();
    };

    window.addEventListener("resize", handleResize);
    handleResize();
}

// Main Logic
loadMpData()
    .then(data => {
        landlordMps = data.filter(mp => mp.is_landlord === 'True');
        const main = d3.select("main");
        const scrolly = main.select("#scrolly");
        const figure = scrolly.select("figure");
        const article = scrolly.select("article");
        const step = article.selectAll(".step");

        const scroller = scrollama();

        setupResize(step, figure, scroller);
        setupScrollama(scroller, step, figure);

        const svg = createSVG(figure);
        drawRentLineChart(svg);
        //drawCircles(svg, landlordMps);
    })
    .catch(error => console.error("Error loading MP data:", error));



