// landlord-scroll.js
// Entry point for the landlord-focused scroll/story experience
import { loadMpDataLandlordStatic } from './dataLoader.js';

// Constants
let landlordMps = [];
const WIDTH = window.innerWidth / 2;
const HEIGHT = window.innerHeight / 2;
const LEFTMARGIN = WIDTH * 0.1;
const RIGHTMARGIN = WIDTH * 0.1;
const UPPERMARGIN = HEIGHT * 0.1;
const LOWERMARGIN = HEIGHT * 0.1;
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

    // Update circle radius
    svg.selectAll(".circ")
        .transition()
        .duration(300)
        .attr("r", d => {
            const newRadius = MP_CIRCLE_RADIUS * Math.sqrt(d.RentalProperties);

            // Update the corresponding clipPath size
            const clipPath = svg.select(`clipPath#clip-${d.mp_id}`);
            if (!clipPath.empty()) {
                clipPath.select("circle")
                    .attr("r", newRadius); // Update the radius of the clipPath circle
            } else {
                console.warn(`ClipPath not found for MP ID: ${d.mp_id}`);
            }

            return newRadius; // Update the circle radius
        });

    svg.selectAll("circle")
        .attr("r", d => {
            const newRadius = MP_CIRCLE_RADIUS * Math.sqrt(d.RentalProperties);
            return newRadius;
        });

    // Update image alignment to match resized circles
    const mpImages = svg.select(".mp-images");
    mpImages.selectAll("image")
        .attr("width", d => MP_CIRCLE_RADIUS * Math.sqrt(d.RentalProperties) * 2)
        .attr("height", d => MP_CIRCLE_RADIUS * Math.sqrt(d.RentalProperties) * 2)
        .attr("x", d => d.x - MP_CIRCLE_RADIUS * Math.sqrt(d.RentalProperties))
        .attr("y", d => d.y - MP_CIRCLE_RADIUS * Math.sqrt(d.RentalProperties));
};

const resizeCirclesToDefaultSize = () => {
    d3.select("svg")
        .selectAll(".circ")
        .transition() // Smooth transition for size changes
        .duration(300)
        .attr("r", MP_CIRCLE_RADIUS); // Reset to default size
};

export const updateCircleOpacity = (inclusions) => {
    return new Promise(resolve => {
        d3.select("svg").select(".mp-images")
            .selectAll("image")
            .transition()
            .duration(300)
            .style("opacity", d => {
                if (inclusions.length === 0) {
                    return 1; // Set opacity to 1 if inclusions list is empty
                }
                return inclusions.includes(d.mp_id) ? 1 : 0.3; // Highlight inclusions, dim exclusions
            })
            .on("end", resolve); // Resolve the Promise when the transition ends
    });
};


function updateCircleAndImage(mpId, scaleFactor) {
    updateCircleOpacity([mpId]).then(() => {
        const newRadius = MP_CIRCLE_RADIUS * Math.sqrt(scaleFactor);

        // Update the clipPath circle
        d3.select(`clipPath#clip-${mpId}`)
            .select("circle")
            .transition()
            .duration(300)
            .attr("r", newRadius);

        // Update the corresponding image
        d3.select(`image[id="${mpId}"]`)
            .transition()
            .duration(300)
            .attr("width", newRadius * 2)
            .attr("height", newRadius * 2)
            .attr("x", d => d.x - newRadius)
            .attr("y", d => d.y - newRadius);
    });
}

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
                    .duration(300)
                    .style("opacity", 0)
                    .remove()
                }
            }
        },
        "outline-of-houses" : (enterOrExit, direction) => {
            if (enterOrExit === "enter") {
                // Lay out 171 houses in a grid
                const numHouses = 171;
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
                    .filter((d, i) => i > numHouses - numAgricultural - 1)
                    .text("🌾"); // Agricultural properties
                svg.selectAll(".house")
                    .filter((d, i) => i <= numHouses - numAgricultural - 1 && i >= numHouses - numAgricultural - numBusinessandCommercial)
                    .text("🏢"); // Business/commercial properties
            }
            else {
                // Remove all houses
                d3.select("svg").selectAll(".house")
                    .transition()
                    .duration(300)
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
                    d3.select("svg").select(".mp-images")
                        .transition()
                        .duration(300)
                        .style("opacity", 0)
                        .remove();
                    
                    d3.select("svg").select("defs")
                        .remove();
            }
        }},
                
        "resize-property-holdings": (enterOrExit, direction) => {
            if (enterOrExit === "enter") {
                if (direction === 'down') {
                    resizeCirclesOnPropertyCount();

                    const svg = d3.select("svg");
                    const mpImages = svg.select(".mp-images");
                    //const landlordMpsData = svg.selectAll(".circ").data();

                    const simulation = d3.forceSimulation(landlordMps)
                        .force("x", d3.forceX(WIDTH / 2).strength(0.1))
                        .force("y", d3.forceY(HEIGHT / 2).strength(0.1))
                        .force("collide", d3.forceCollide(d => MP_CIRCLE_RADIUS * Math.sqrt(d.RentalProperties) * 1.3))
                        .on("tick", () => {
                            svg.selectAll("circle")
                                .attr("cx", d => d.x)
                                .attr("cy", d => d.y);

                            mpImages.selectAll("image")
                                .attr("x", d => d.x - (MP_CIRCLE_RADIUS * Math.sqrt(d.RentalProperties))) // Align image with circle
                                .attr("y", d => d.y - (MP_CIRCLE_RADIUS * Math.sqrt(d.RentalProperties))); // Align image with circle
                        });

                    simulation.alpha(0.1).restart();
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
                updateCircleOpacity([5227]);
                // Overlay image from "imgs/athwal-residential-press.png" on top of svg
                const svg = d3.select("svg");
                svg.append("image")
                    .attr("xlink:href", "imgs/athwal-residential-press.png")
                    .attr("class", "athwal-residential-press")
                    .attr("preserveAspectRatio", "xMinYMin meet")
                    .attr("x", WIDTH * 1 / 16)
                    .attr("y", HEIGHT / 8)
                    ;
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
                updateCircleOpacity([5227]);
                console.log("Athwal commercial press enter");
                // Overlay image from "imgs/athwal-residential-press.png" on top of svg
                const svg = d3.select("svg");
                svg.append("image")
                    .attr("xlink:href", "imgs/athwal-commercial-press.png")
                    .attr("class", "athwal-commercial-press")
                    .attr("preserveAspectRatio", "xMinYMin meet")
                    .attr("x", WIDTH * 3 / 16)
                    .attr("y", HEIGHT / 4)
                    ;
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
            resizeCirclesOnPropertyCount();
        },
        "reeves-expand-74": (enterOrExit, direction) => {
            if (enterOrExit === "enter") {
                updateCircleAndImage(4031, 7.4); // Scale up 7.4x

                // Add news image
                d3.select("svg").append("image")
                    .attr("xlink:href", "imgs/reeves-income-press.png")
                    .attr("class", "reeves-income-press")
                    .attr("preserveAspectRatio", "xMinYMin meet")
                    .attr("x", WIDTH * 1 / 16)
                    .attr("y", 3 * HEIGHT / 8);
            }
            else {
                // Remove news image
                d3.select("svg").select(".reeves-income-press")
                    .transition()
                    .duration(500)
                    .style("opacity", 0)
                    .remove();
            }
        },
        "reeves-household-income": (enterOrExit, direction) => {
            if (enterOrExit === "enter") {
                updateCircleAndImage(4031, 40.7); // Scale up 40.7x
            }
        },
        "reeves-vs-average": (enterOrExit, direction) => {
            if (enterOrExit === "enter") {
            updateCircleAndImage(4031, 40.7); 
            // Create a temporary circle to highlight average income
            let avgIncomeR = MP_CIRCLE_RADIUS * Math.sqrt(3.67);
            let reevesCircle = d3.select("clipPath#clip-4031").select("circle");
            let reevesCircleCx = +reevesCircle.attr("cx");
            let reevesCircleCy = +reevesCircle.attr("cy");
            let reevesCircleR = MP_CIRCLE_RADIUS * Math.sqrt(40.7);

            let ucPipR = MP_CIRCLE_RADIUS * Math.sqrt(2.98);
            // If reevesCircleCx > Width/2, then avgIncomeCx = ReevesCircleCx - ReevesCircleR * 1.1
            let avgIncomeCx = reevesCircleCx > WIDTH / 2 ? reevesCircleCx - reevesCircleR * 1.1 - avgIncomeR : reevesCircleCx + reevesCircleR * 1.1 + avgIncomeR;
            let ucPipCx = reevesCircleCx > WIDTH / 2 ? reevesCircleCx - reevesCircleR * 1.1 - ucPipR - 2.2 * avgIncomeR : reevesCircleCx + reevesCircleR * 1.1 + ucPipR + 2.2 * avgIncomeR;
            d3.select("svg").append("circle")
                .attr("class", "avg-income")
                .attr("cx", avgIncomeCx)
                .attr("cy", reevesCircleCy)
                .attr("r", avgIncomeR)
                .attr("fill", "black");
            }

            else {
                // Delete avg income circle
                d3.select("svg").selectAll(".avg-income").remove();                
            }
        },
        "ali-highlight": (enterOrExit, direction) => {
            updateCircleOpacity([4138]);
            resizeCirclesOnPropertyCount();
        },
        "ali-expand-496": (enterOrExit, direction) => {
            if (enterOrExit === "enter") {
            updateCircleAndImage(4138, 4.96); // Scale up 4.96x
    }
        },
        "ali-expand-580": (enterOrExit, direction) => {
            if (enterOrExit === "enter") {
                updateCircleAndImage(4138, 5.8); // Scale up 5.8x

                // Add news image
                d3.select("svg").append("image")
                    .attr("xlink:href", "imgs/ali-resigns-press.png")
                    .attr("class", "ali-resigns-press")
                    .attr("preserveAspectRatio", "xMinYMin meet")
                    .attr("x", WIDTH * 1 / 16)
                    .attr("y", HEIGHT / 8);
            } else {
                // Remove news image
                d3.select("svg").select(".ali-resigns-press")
                    .transition()
                    .duration(500)
                    .style("opacity", 0)
                    .remove();
            }
        },
        "anti-renters-rights": (enterOrExit, direction) => {
            if (enterOrExit === "enter") {
                {
                    resizeCirclesOnPropertyCount();
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
    },
        "outro": (enterOrExit, direction) => {
            updateCircleOpacity([]); // Reset opacity
        }
}

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
    d3.csv('data/rent_index.csv').then(data => {
        // Process and visualize the data
        const boundingRect = svg.node().getBoundingClientRect();
        const innerChartWidth = WIDTH * 0.8;
        const innerChartHeight = boundingRect.height * 0.8;
        const innerChartTopMargin = boundingRect.height * 0.1;
        const innerChartLeftMargin = WIDTH * 0.1;

        let innerChartArea = svg.append("g")
            .attr("class", "line-chart")
            .attr("transform", `translate(${innerChartLeftMargin}, ${innerChartTopMargin})`);

        // Parse time and prepare data
        const parseTime = d3.timeParse("%b-%Y");
        // Filter to Jan-2015 and after (where complete for all regions)
        const startDate = parseTime("Jan-2015");
        data = data.filter(d => parseTime(d["Time period and Region Code"]) >= startDate);

        data.forEach(d => {
            d.date = parseTime(d["Time period and Region Code"]);
            d.England = +d["England"];
            d.Wales = +d["Wales"];
            d.Scotland = +d["Scotland"];
            d["Northern Ireland"] = +d["Northern Ireland"]
            d["London"] = +d["London"];
        });

        // Define scales
        const xScale = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([0, innerChartWidth]);

        const yScale = d3.scaleLinear()
            .domain([100, 140]) // Adjust domain based on your data
            .range([innerChartHeight, 0]);

        // Define line generator
        const line = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.value));

        // Regions to plot
        const regions = ["England", "Wales", "Scotland", "Northern Ireland", "London"];
        const colors = ["#fca1a1ff", "#D30731", "#0065BF", "#169B62", "#000000ff"]; // Colors for each region

        // Filter data for each region to start from the first non-NaN value
        const filteredData = regions.map(region => {
            const regionData = data.map(d => ({ date: d.date, value: d[region] }));
            const firstValidIndex = regionData.findIndex(d => !isNaN(d.value));
            return regionData.slice(firstValidIndex); // Trim data to start from the first valid value
        });

        // Plot lines for each region
        filteredData.forEach((regionData, index) => {
            innerChartArea.append("path")
                .datum(regionData)
                .attr("class", `line-${regions[index].toLowerCase().replace(" ", "-")}`)
                .attr("d", line)
                .attr("fill", "none")
                .attr("stroke", colors[index])
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", function () {
                    const totalLength = this.getTotalLength();
                    return `${totalLength} ${totalLength}`;
                })
                .attr("stroke-dashoffset", function () {
                    return this.getTotalLength();
                })
                .transition()
                .duration(5000)
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0);
        });

        // Add axes
        innerChartArea.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${innerChartHeight})`)
            .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat("%Y")));

        innerChartArea.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale)
                .ticks(5)
                .tickFormat(d => `+${d - 100}%`));

        // Add y-axis label
        innerChartArea.append("text")
            .attr("class", "y-axis-label")
            .attr("x", -innerChartHeight / 2) // Center the label vertically
            .attr("y", -40) // Position to the left of the y-axis
            .attr("transform", "rotate(-90)") // Rotate the text vertically
            .style("text-anchor", "middle") // Center alignment
            .style("font-size", "12px")
            .style("font-family", "Roboto, sans-serif")
            .style("fill", "#145114")
            .text("Avg. Rent Increase Since 2015");

        // Add source
        innerChartArea.append("foreignObject")
            .attr("x", innerChartWidth + 20)
            .attr("y", innerChartHeight + 30)
            .attr("width", 120)
            .attr("height", 30)
            .append("xhtml:div")
            .style("font-size", "12px")
            .style("font-family", "Roboto, sans-serif")
            .style("text-align", "right")
            .html('<span>Source: <a href="https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/indexofprivatehousingrentalprices/january2024" target="_blank" style="color: #145114; text-decoration: none;">ONS</a></span>');

        // Add legend
        const legend = innerChartArea.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${innerChartWidth + 20}, 20)`);


        regions.forEach((region, index) => {
            const legendItem = legend.append("g")
                .attr("class", `legend-item-${regions[index].toLowerCase().replace(" ", "-")}`)
                .attr("transform", `translate(0, ${index * 20})`);

            legendItem.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", colors[index]);

            legendItem.append("text")
                .attr("x", 15)
                .attr("y", 10)
                .text(region)
                .style("font-size", "12px")
                .style("alignment-baseline", "middle");
        });
    });
}
function drawCircles(svg, landlordMps) {
    // Keep this for later, allowed to use images as fill patterns
    const defs = svg.append('defs');
    landlordMps.forEach(mp => {
        // Create a clipPath for each MP
        defs.append('clipPath')
            .attr('id', `clip-${mp.mp_id}`)
            .append('circle')
            .attr('cx', 0) // Center relative to the image
            .attr('cy', 0) // Center relative to the image
            .attr('r', MP_CIRCLE_RADIUS); // Radius of the circle
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
        .attr('stroke', '#145114')
        .attr('stroke-width', 1.5)
        .append('title')
        .text(d => `${d.name} (${d.party})`);

    const mpImages = svg.append('g')
        .attr('class', 'mp-images');

    mpImages.selectAll('image')
        .data(landlordMps)
        .enter()
        .append('image')
        .attr('id', d => d.mp_id) // Set ID for each image
        .attr('xlink:href', d => d.thumbnail || 'default-image.png') // Image source
        .attr('width', MP_CIRCLE_RADIUS * 2) // Match circle size
        .attr('height', MP_CIRCLE_RADIUS * 2) // Match circle size
        .attr('clip-path', d => `url(#clip-${d.mp_id})`) // Apply clipPath
        .attr('x', d => WIDTH / 2 - MP_CIRCLE_RADIUS) // Align image with circle
        .attr('y', d => HEIGHT / 2 - MP_CIRCLE_RADIUS); // Align image with circle

        
    const simulation = d3.forceSimulation(landlordMps)
        .force("x", d3.forceX(WIDTH / 2).strength(0.5))
        .force("y", d3.forceY(HEIGHT / 2).strength(0.5))
        .force("collide", d3.forceCollide(MP_CIRCLE_RADIUS * 1.5))
        .on("tick", () => {
            svg.selectAll("circle")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            mpImages.selectAll("image")
                .attr("x", d => d.x - MP_CIRCLE_RADIUS) // Align image with circle
                .attr("y", d => d.y - MP_CIRCLE_RADIUS); // Align image with circle
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
loadMpDataLandlordStatic()
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



