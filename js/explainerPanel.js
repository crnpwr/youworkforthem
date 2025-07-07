import { setupMpSearch } from './search.js';
import { loadDataRef } from './dataLoader.js';

export function populateExplainerPanel(mp) {
  const explainerPanel = d3.select("#explainer-panel");
  if (mp) {
    explainerPanel.html(mp.mp_infobox_html);
    d3.select("#explainer-header")
        .text("MP Spotlight");
  } else {
    d3.select("#explainer-panel")
        .style("position", "relative")
        .style("top", "20px")
        .style("margin-bottom", "20px");

    // Set the header text for the explainer panel
    d3.select("#explainer-header")
        .text("About this project");

    explainerPanel.html(defaultExplainerContent);
    setupMpSearch();
    lastUpdateDate();
  }
    
};

// Store the default explainer panel content
const defaultExplainerContent = `
    <p align="right">This visualization shows MPs' expenses and declared interests.</p>
    <p align="right">It's particularly designed to highlight the relation between MPs' behaviour personally and politically.</p>
    <p align="right">For example, MPs with rental properties who are charging rent to the taxpayer, or MPs who support benefit cuts but 
    seem to take a lot in expenses or gifts.</p>
    <p align="right">Use the filters to explore data by expense type or MPs with rental properties.</p>
    <p align="right">Hover over the circles to see more details about each MP's expenses.</p>
    <p align="right">Try clicking on an MP to see more about them.</p>
    <p align="right">Or try clicking HERE to see a particularly interesting MP.</p>
    <div id="mp-search-container" style="position:relative; margin-top: 2em;">
      <input type="text" id="mp-search" placeholder="Search MP by name..." autocomplete="off" style="width:100%;padding:6px;" />
      <div id="mp-search-suggestions" style="position:absolute; background:white; border:1px solid #ccc; z-index:1000; width:100%; display:none;"></div>
    </div>
`;

// Call the function to populate the explainer panel
populateExplainerPanel();

export function setupPanelPopup() {
  const infoPanel = document.getElementById('info-panel');
  const openBtn = document.getElementById('open-panel-btn');
  const closeBtn = document.getElementById('close-panel-btn');

  function checkScreen() {
    if (window.innerWidth <= 820) {
      openBtn.style.display = 'block';
      closeBtn.style.display = 'block';
      infoPanel.classList.remove('popup-open');
    } else {
      openBtn.style.display = 'none';
      closeBtn.style.display = 'none';
      infoPanel.classList.remove('popup-open');
    }
  }

  openBtn.addEventListener('click', () => {
    infoPanel.classList.add('popup-open');
  });
  closeBtn.addEventListener('click', () => {
    infoPanel.classList.remove('popup-open');
  });

  window.addEventListener('resize', checkScreen);
  checkScreen();
}

setupPanelPopup();

// Automatically open the popup on small screens when the page loads
if (window.innerWidth <= 820) {
  document.getElementById('info-panel').classList.add('popup-open');
}

// Update the explainer panel with the last updated date
export async function lastUpdateDate() {
    try {
        const refData = await loadDataRef();
        const lastUpdated = refData.last_updated || refData.date || null;
        if (lastUpdated) {
            const explainerPanel = document.getElementById('explainer-panel');
            if (explainerPanel) {
                const oldDate = explainerPanel.querySelector('.last-updated-info');
                if (oldDate) oldDate.remove();
                const dateDiv = document.createElement('div');
                dateDiv.className = 'last-updated-info';
                dateDiv.innerHTML = `Last data update: <strong>${lastUpdated}</strong>`;
                explainerPanel.appendChild(dateDiv);
            }
        }
    } catch (err) {
        console.warn('Could not load last updated date:', err);
    }
}