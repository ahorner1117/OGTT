/**
 * OGTT Weekly Recap - Dynamic Leaderboard
 * Handles adding/deleting rows, editing fields, and auto-calculating totals
 */

// Initial data
const initialData = [
    { name: '@MarshyPicks', role: 'Lead Analyst', units: 173.27 },
    { name: '@Capper01', role: 'NBA Specialist', units: 19.37 },
    { name: '@Capper02', role: 'NFL Expert', units: 8.67 },
    { name: '@Capper03', role: 'MMA Specialist', units: 4.62 },
    { name: '@Capper04', role: 'Props Expert', units: 4.38 },
    { name: '@Capper05', role: 'Soccer Analyst', units: 1.59 },
    { name: '@Capper06', role: 'NHL Expert', units: -2.37 },
    { name: '@Capper07', role: 'Tennis Analyst', units: -2.45 }
];

// State
let cappers = [...initialData];

// DOM Elements
const leaderboard = document.getElementById('leaderboard');
const addRowBtn = document.getElementById('addRowBtn');
const totalUnits = document.getElementById('totalUnits');
const totalValue = document.getElementById('totalValue');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderLeaderboard();
    addRowBtn.addEventListener('click', addNewRow);
});

/**
 * Render the entire leaderboard
 */
function renderLeaderboard() {
    // Sort by units descending
    cappers.sort((a, b) => b.units - a.units);
    
    leaderboard.innerHTML = '';
    
    if (cappers.length === 0) {
        leaderboard.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 4.5v15m7.5-7.5h-15"/>
                </svg>
                <p>No cappers added yet. Click "Add Capper" to get started.</p>
            </div>
        `;
        updateTotal();
        return;
    }
    
    cappers.forEach((capper, index) => {
        const row = createRow(capper, index);
        leaderboard.appendChild(row);
    });
    
    updateTotal();
}

/**
 * Create a single row element
 */
function createRow(capper, index) {
    const row = document.createElement('div');
    row.className = 'player-row';
    row.dataset.index = index;
    
    // Add positive/negative class
    if (capper.units >= 0) {
        row.classList.add('positive');
    } else {
        row.classList.add('negative');
    }
    
    // Add top-3 class for ranking highlight
    if (index < 3) {
        row.classList.add('top-3');
    }
    
    // Format rank with leading zero
    const rankNum = String(index + 1).padStart(2, '0');
    
    // Format units display
    const unitsDisplay = formatUnits(capper.units);
    const unitsClass = capper.units >= 0 ? 'positive' : 'negative';
    
    row.innerHTML = `
        <div class="rank">${rankNum}</div>
        <div class="player-info">
            <input type="text" class="player-input player-name" value="${escapeHtml(capper.name)}" data-field="name" data-index="${index}">
            <input type="text" class="player-input player-role" value="${escapeHtml(capper.role)}" data-field="role" data-index="${index}">
        </div>
        <div class="units-wrapper">
            <input type="text" class="units-input ${unitsClass}" value="${unitsDisplay}" data-field="units" data-index="${index}">
            <div class="units-label">UNITS</div>
        </div>
        <button class="delete-btn" data-index="${index}" title="Remove capper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
        </button>
    `;
    
    // Add event listeners
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('change', handleInputChange);
        input.addEventListener('blur', handleInputChange);
    });
    
    const deleteBtn = row.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', handleDelete);
    
    return row;
}

/**
 * Handle input changes
 */
function handleInputChange(e) {
    const field = e.target.dataset.field;
    const index = parseInt(e.target.dataset.index);
    let value = e.target.value;
    
    if (field === 'units') {
        // Parse the units value
        value = parseUnits(value);
        cappers[index].units = value;
        
        // Update the display
        e.target.value = formatUnits(value);
        
        // Update classes
        e.target.classList.remove('positive', 'negative');
        e.target.classList.add(value >= 0 ? 'positive' : 'negative');
        
        // Re-render to update rankings
        renderLeaderboard();
    } else {
        cappers[index][field] = value;
    }
    
    updateTotal();
}

/**
 * Handle row deletion
 */
function handleDelete(e) {
    const btn = e.currentTarget;
    const index = parseInt(btn.dataset.index);
    const row = btn.closest('.player-row');
    
    // Add removing animation
    row.classList.add('removing');
    
    setTimeout(() => {
        cappers.splice(index, 1);
        renderLeaderboard();
    }, 300);
}

/**
 * Add a new row
 */
function addNewRow() {
    const newCapper = {
        name: '@NewCapper',
        role: 'Specialist',
        units: 0
    };
    
    cappers.push(newCapper);
    renderLeaderboard();
    
    // Focus on the new name input
    const newRow = leaderboard.lastElementChild;
    if (newRow && !newRow.classList.contains('empty-state')) {
        const nameInput = newRow.querySelector('.player-name');
        if (nameInput) {
            nameInput.focus();
            nameInput.select();
        }
    }
}

/**
 * Update the total units display
 */
function updateTotal() {
    const total = cappers.reduce((sum, capper) => sum + capper.units, 0);
    const formattedTotal = formatUnits(total);
    
    totalUnits.textContent = formattedTotal;
    
    // Update styling based on positive/negative
    totalValue.classList.remove('positive', 'negative');
    if (total < 0) {
        totalValue.classList.add('negative');
    }
}

/**
 * Format units for display
 */
function formatUnits(value) {
    const prefix = value >= 0 ? '+' : '';
    return prefix + value.toFixed(2);
}

/**
 * Parse units from string input
 */
function parseUnits(str) {
    // Remove any non-numeric characters except minus and decimal
    const cleaned = str.replace(/[^0-9.\-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Export data as JSON (utility function)
 */
function exportData() {
    const data = {
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        cappers: cappers,
        total: cappers.reduce((sum, c) => sum + c.units, 0)
    };
    return JSON.stringify(data, null, 2);
}

/**
 * Import data from JSON (utility function)
 */
function importData(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        if (data.startDate) document.getElementById('startDate').value = data.startDate;
        if (data.endDate) document.getElementById('endDate').value = data.endDate;
        if (data.cappers && Array.isArray(data.cappers)) {
            cappers = data.cappers;
            renderLeaderboard();
        }
    } catch (e) {
        console.error('Failed to import data:', e);
    }
}
