import { selectCircle } from './interactions.js';
import { populateExplainerPanel } from './explainerPanel.js';

export function setupMpSearch() {
    const searchInput = document.getElementById('mp-search');
    const suggestionsBox = document.getElementById('mp-search-suggestions');
    if (!searchInput || !suggestionsBox) return;

    searchInput.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();
        suggestionsBox.innerHTML = '';
        if (!query) {
            suggestionsBox.style.display = 'none';
            return;
        }
        const matches = window.mpData
            .filter(mp => mp.name && mp.name.toLowerCase().includes(query))
            .slice(0, 8);

        if (matches.length === 0) {
            suggestionsBox.style.display = 'none';
            return;
        }

        matches.forEach(mp => {
            const div = document.createElement('div');
            div.textContent = mp.name;
            div.style.cursor = 'pointer';
            div.style.padding = '4px 8px';
            div.addEventListener('mousedown', function(e) {
                e.preventDefault();
                searchInput.value = mp.name;
                suggestionsBox.style.display = 'none';
                selectCircle(mp.mp_id, true);
                populateExplainerPanel(mp);
            });
            suggestionsBox.appendChild(div);
        });
        suggestionsBox.style.display = 'block';
    });

    searchInput.addEventListener('blur', () => {
        setTimeout(() => { suggestionsBox.style.display = 'none'; }, 100);
    });
}