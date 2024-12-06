


// Add this to your creature window initialization
function initializeCreatureSheet() {
    const sheet = document.getElementById('creatureSheetPopup');
    if (!sheet) {
        console.error('Creature sheet popup not found');
        return;
    }

    // Initialize close button
    const closeButton = sheet.querySelector('.close-button');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            sheet.style.display = 'none';
        });
    }

    // Set up tab functionality
    const tabs = sheet.querySelectorAll('.tab-buttons > *');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const tabName = tab.dataset.tab || tab.textContent.trim().toLowerCase();
            
            // Hide all content panels
            sheet.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = 'none';
            });
            
            // Show selected content
            const selectedContent = sheet.querySelector(`.${tabName}-content`);
            if (selectedContent) {
                selectedContent.style.display = 'block';
                
                // Handle special tabs
                if (tabName === 'abilities' && characterState.currentToken) {
                    if (typeof window.initializeAbilitiesTab === 'function') {
                        window.initializeAbilitiesTab(sheet, characterState.currentToken);
                    }
                } else if (tabName === 'loot' && characterState.currentToken) {
                    if (typeof window.showLootWindow === 'function') {
                        window.showLootWindow(characterState.currentToken.dataset.name, characterState.currentToken);
                    }
                }
            }
        });
    });
}

function updateCreatureSheetDisplay(token) {
    const sheet = document.getElementById('creatureSheetPopup');
    if (!sheet || !token) return;

    // Get creature data from library
    const creature = creatureLibrary.find(c => c.name === token.dataset.name);
    if (!creature) {
        console.error(`Creature "${token.dataset.name}" not found in library`);
        return;
    }

    // Update name in header
    const nameHeader = sheet.querySelector('.sheet-header h2');
    if (nameHeader) nameHeader.textContent = creature.name;

    // Update core stats
    updateStatValue(sheet, 'health', `${creature.currentHealth}/${creature.maxHealth}`);
    updateStatValue(sheet, 'mana', `${creature.currentMana}/${creature.maxMana}`);

    // Update base stats
    updateStatValue(sheet, 'constitution', creature.stats.con);
    updateStatValue(sheet, 'strength', creature.stats.str);
    updateStatValue(sheet, 'agility', creature.stats.agi);
    updateStatValue(sheet, 'intelligence', creature.stats.int);
    updateStatValue(sheet, 'spirit', creature.stats.spir);
    updateStatValue(sheet, 'charisma', creature.stats.cha);

    // Update derived stats
    updateStatValue(sheet, 'healthRegen', creature.derivedStats.healthRegen);
    updateStatValue(sheet, 'manaRegen', creature.derivedStats.manaRegen);
    updateStatValue(sheet, 'damage', creature.derivedStats.damage);
    updateStatValue(sheet, 'spellDamage', creature.derivedStats.spellDamage);
    updateStatValue(sheet, 'healing', creature.derivedStats.healing);
    updateStatValue(sheet, 'armor', creature.derivedStats.armor);
    updateStatValue(sheet, 'criticalChance', creature.derivedStats.crit);
    updateStatValue(sheet, 'movementSpeed', creature.derivedStats.moveSpeed);

    console.log('Updated creature sheet for:', creature.name, {
        stats: creature.stats,
        derivedStats: creature.derivedStats
    });
}

// Helper function to update stat values
function updateStatValue(sheet, statName, value) {
    const element = sheet.querySelector(`.${statName}-value`);
    if (element) {
        element.textContent = value;
    } else {
        console.warn(`Stat element not found: ${statName}-value`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Creature window close button handler
    const closeButton = document.querySelector('#creatureSheetPopup .close-button');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            const creatureSheet = document.getElementById('creatureSheetPopup');
            if (creatureSheet) {
                creatureSheet.style.display = 'none';
            }
        });
        initializeCreatureSheet();
    }
});