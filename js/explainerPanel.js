import { setupMpSearch } from './search.js';
import { loadDataRef } from './dataLoader.js';
import { highlightRandomMp } from './utils.js';
import { selectCircle } from './interactions.js';
import { handleMpFilterButtonClick } from './filters.js';

export function populateExplainerPanel(mp) {
  const explainerPanel = d3.select("#explainer-panel");
  const explainerHeader = d3.select("#explainer-header");
  // Always render a single close button in the header for MP Spotlight, and only show it in default view on mobile
  if (mp) {
    explainerHeader.html(`MP Spotlight <button id=\"close-explainer-btn\" title=\"Close\" aria-label=\"Close MP Spotlight\" style=\"float:right;font-size:1.5em;line-height:1;color:#333;background:none;border:none;cursor:pointer;padding:0 0.2em;z-index:10;\">&times;</button>`);
    explainerPanel.html(`<div>${mp.mp_infobox_html}</div>`);
  } else {
    // Only show close button in default view if on mobile
    if (window.innerWidth <= 820) {
      explainerHeader.html(`About this project <button id=\"close-explainer-btn\" title=\"Close\" aria-label=\"Close Explainer\" style=\"float:right;font-size:1.5em;line-height:1;color:#333;background:none;border:none;cursor:pointer;padding:0 0.2em;z-index:10;\">&times;</button>`);
    } else {
      explainerHeader.text("About this project");
    }
    explainerPanel
      .style("position", "relative")
      .style("top", "20px")
      .style("margin-bottom", "20px");
    explainerPanel.html(defaultExplainerContent);
    setupMpSearch();
    lastUpdateDate();
    setupRandomInterestingMPClick(window.mpData);
    setupAntiRentersLandlordsLink();
  }
  // Attach close button handler (works for both MP and default explainer)
  const closeBtn = document.getElementById('close-explainer-btn');
  if (closeBtn) {
    closeBtn.onclick = () => {
      // On mobile, close the popup
      if (window.innerWidth <= 820) {
        document.getElementById('info-panel').classList.remove('popup-open');
      }
      // If in MP mode, also reset selection and explainer
      if (mp) {
        selectCircle(0);
        populateExplainerPanel();
      }
    };
  }
};

// Store the default explainer panel content
const defaultExplainerContent = `
    <p align="right">This project lets you explore financial and voting records of members of the UK parliament.</p>
    <p align="right">In the chart on the left, each circle is an MP. The colour of the circle shows the MP's party.</p>
    <p align="right">The default view shows who's accepted the most valuable gifts from people. The MPs at the top take the most freebies.</p>
    <p align="right">Use the buttons below the graph to change the values or highlight groups of MPs.</p> 
    <p align="right">For example, you can see the MPs who claim the most money in expenses, or highlight MPs who voted to cut universal credit.</p>
    <p align="right">One way this can be used is to see how MPs private and public lives are related.</p>
    <p align="right">For example, you might want to look at MPs who are landlords but voted against the renters rights bill. Click <a href="#" id="anti-renters-landlords-link">here</a> to try that.</p>
    <p align="right">Try clicking on an MP to see more about them, or just click <a href="#" id="random-interesting-mp-link">here</a> to see a random MP who might be interesting.</p>
    <p align="right">Use the search box below to find an MP by name.</p>
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

  function checkScreen() {
    if (window.innerWidth <= 820) {
      openBtn.style.display = 'block';
      infoPanel.classList.remove('popup-open');
    } else {
      openBtn.style.display = 'none';
      infoPanel.classList.remove('popup-open');
    }
  }

  openBtn.addEventListener('click', () => {
    infoPanel.classList.add('popup-open');
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
                dateDiv.innerHTML = `Last data update: <strong>${lastUpdated}</strong><br><br><br>`;
                explainerPanel.appendChild(dateDiv);
            }
        }
    } catch (err) {
        console.warn('Could not load last updated date:', err);
    }
}

export function setupRandomInterestingMPClick(mpData) {
  const link = document.getElementById('random-interesting-mp-link');
  if (link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      highlightRandomMp(mpData); // This function should select and highlight a random MP
    });
  }
}

export function setupAntiRentersLandlordsLink() {
  const link = document.getElementById('anti-renters-landlords-link');
  if (link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      // Get the filter definitions and data from global scope
      const mpFilters = window.mpFilters;
      const data = window.mpFilterData;
      if (mpFilters && data) {
        const landlordFilter = mpFilters.find(f => f.id === 'landlords');
        const rentersFilter = mpFilters.find(f => f.id === 'anti-renters');
        if (landlordFilter) handleMpFilterButtonClick(landlordFilter, window.mpFilterData);
        if (rentersFilter) handleMpFilterButtonClick(rentersFilter, window.mpFilterData);
      }
    });
  }
}