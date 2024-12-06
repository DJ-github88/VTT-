// lootTables.js

// Initialize items if not already defined
if (typeof window.items === 'undefined') {
    window.items = []; // Ensure this is populated appropriately
}

// Define creature loot tables
window.creatureLootTables = {
    'Eldritch Horror': {
        common: [
            { itemId: 3, chance: 0.15 },  // Potion of Healing
            { itemId: 14, chance: 0.12 }  // Elixir of Mana
        ],
        uncommon: [
            { itemId: 21, chance: 0.08 },  // Skull of Agility
            { itemId: 22, chance: 0.08 }   // Elixir of Fortitude
        ],
        rare: [
            { itemId: 9, chance: 0.03 },   // Staff of the Elements
            { itemId: 11, chance: 0.03 }   // Helm of Insight
        ],
        epic: [
            { itemId: 31, chance: 0.01 }   // Blade of the Phoenix
        ]
    },
    // Add more creatures as needed
};

// Function to safely remove a child element
function safeRemoveChild(parent, child) {
    if (parent && child && parent.contains(child)) {
        parent.removeChild(child);
    }
}

// Function to roll loot based on a loot table
function rollLoot(lootTable) {
    const rolledItems = [];
    Object.entries(lootTable).forEach(([rarity, items]) => {
        items.forEach(({ itemId, chance }) => {
            if (Math.random() < chance) {
                const item = window.items.find(i => i.id === itemId);
                if (item) {
                    rolledItems.push({
                        ...item,
                        rarity: rarity
                    });
                }
            }
        });
    });
    return rolledItems;
}

// Function to display the loot table in the UI
function displayLootTable(container, lootTable) {
    console.log('Displaying loot table:', lootTable);
    if (!window.items || window.items.length === 0) {
        console.error('Items database not found or empty!');
        return;
    }

    const table = container.querySelector('.loot-table');
    if (!table) {
        console.error('Loot table element not found in container');
        return;
    }

    const tbody = table.querySelector('tbody');
    tbody.innerHTML = ''; // Clear existing rows
    let hasItems = false;

    Object.entries(lootTable).forEach(([rarity, items]) => {
        items.forEach(({ itemId, chance }) => {
            const item = window.items.find(i => i.id === itemId);
            if (item) {
                hasItems = true;
                const row = document.createElement('tr');
                row.className = rarity;
                
                row.innerHTML = `
                    <td class="item-icon"><img src="${item.image}" alt="${item.name}"></td>
                    <td class="item-name">${item.name}</td>
                    <td class="item-rarity">${rarity.charAt(0).toUpperCase() + rarity.slice(1)}</td>
                    <td class="item-chance">${(chance * 100).toFixed(1)}%</td>
                `;
                
                // Add hover effects for item info
                row.addEventListener('mouseover', (e) => showItemInfo(item, e));
                row.addEventListener('mouseout', () => hideItemInfo());
                
                tbody.appendChild(row);
            }
        });
    });

    if (!hasItems) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="4" class="empty-message">No items available</td>';
        tbody.appendChild(emptyRow);
    }
}




window.createLootOrb = function(item, sourceToken, dropEvent) {
    const lootOrb = document.createElement('div');
    lootOrb.classList.add('loot-orb', item.rarity?.toLowerCase() || 'common', 'spawning');

    // Clean up stats/effects
    const stats = typeof item.stats === 'string' ? JSON.parse(item.stats) : item.stats || {};
    const effects = typeof item.effects === 'string' ? JSON.parse(item.effects) : item.effects || {};

    // Clean and format properties
    Object.assign(lootOrb.dataset, {
        id: item.id?.toString() || '',
        instanceId: item.instanceId?.toString() || '',
        name: item.name || '',
        description: item.description || '',
        rarity: item.rarity || 'common',
        type: item.type || '',
        slot: Array.isArray(item.slot) ? item.slot.join(',') : item.slot || '',
        effects: JSON.stringify(effects),
        stats: JSON.stringify(stats),
        image: item.image || '/api/placeholder/400/320',
        valueGold: (item.valueGold || 0).toString(),
        valueSilver: (item.valueSilver || 0).toString(), 
        valueCopper: (item.valueCopper || 0).toString(),
        armorType: item.armorType || '',
        armorMaterial: item.armorMaterial || '',
        weaponType: item.weaponType || '',
        weaponCategory: item.weaponCategory || '',
        weaponSubtype: item.weaponSubtype || '',
        damageDice: item.damageDice || '',
        duration: (item.duration || 0).toString(),
        value: (item.value || 0).toString(),  // Add total value
        itemData: JSON.stringify(item)  // Store complete item data
    });

    // Position
    const rect = gridOverlay.getBoundingClientRect();
    const scale = characterState.scale || 1;
    const gridScale = characterState.gridScale || 40;
    const gridX = dropEvent ? Math.floor((e.clientX - rect.left) / (gridScale * scale)) :
                 (sourceToken?.dataset.gridX || 0);
    const gridY = dropEvent ? Math.floor((e.clientY - rect.top) / (gridScale * scale)) :
                 (sourceToken?.dataset.gridY || 0);

    Object.assign(lootOrb.style, {
        left: `${gridX * gridScale}px`,
        top: `${gridY * gridScale}px`, 
        width: `${gridScale * 0.3}px`,
        height: `${gridScale * 0.3}px`,
        position: 'absolute'
    });

    // Event Listeners
    lootOrb.addEventListener('mousemove', (e) => {
        const itemData = {
            dataset: {
                name: item.name,
                description: item.description,
                rarity: item.rarity,
                type: item.type,
                effects: JSON.stringify(item.stats),
                slot: Array.isArray(item.slot) ? item.slot.join(',') : item.slot,
                weaponType: item.weaponType,
                weaponCategory: item.weaponCategory,
                armorType: item.armorType,
                armorMaterial: item.armorMaterial,
                damageDice: item.damageDice,
                valueGold: (item.valueGold || 0).toString(),
                valueSilver: (item.valueSilver || 0).toString(),
                valueCopper: (item.valueCopper || 0).toString(),
                value: (item.value || 0).toString(),
                size: JSON.stringify(item.size || { width: 1, height: 1 }),
                width: (item.size?.width || 1).toString(),
                height: (item.size?.height || 1).toString()
            }
        };
        showItemInfo(itemData, e);
        lootOrb.style.transform = 'scale(1.2)';
    });

    lootOrb.addEventListener('mouseout', () => {
        hideItemInfo();
        lootOrb.style.transform = 'scale(1)';
    });

    lootOrb.addEventListener('click', () => collectLoot(item, lootOrb));

    gridOverlay.appendChild(lootOrb);
    return lootOrb;
};










function getCurrencyOrbClass(amount) {
    if (amount.gold && amount.gold > 0) {
        return 'gold';
    } else if (amount.silver && amount.silver > 0) {
        return 'silver';
    } else {
        return 'copper';
    }
}

function getCurrencyOrbClass(amount) {
    if (amount.gold && amount.gold > 0) {
        return 'legendary'; // Or use 'gold' if you prefer
    } else if (amount.silver && amount.silver > 0) {
        return 'rare'; // Or use 'silver'
    } else {
        return 'common'; // Or use 'copper'
    }
}


// Function to collect loot
function collectLoot(item, lootOrb) {
    const itemData = {
        ...item,
        size: {
            width: parseInt(lootOrb.dataset.width || item.size?.width || 1),
            height: parseInt(lootOrb.dataset.height || item.size?.height || 1)
        },
        instanceId: item.instanceId || Date.now().toString(),
        weaponType: lootOrb.dataset.weaponType,
        weaponCategory: lootOrb.dataset.weaponCategory,
        armorType: lootOrb.dataset.armorType,
        armorMaterial: lootOrb.dataset.armorMaterial,
        damageDice: lootOrb.dataset.damageDice,
        valueGold: parseInt(lootOrb.dataset.valueGold || 0),
        valueSilver: parseInt(lootOrb.dataset.valueSilver || 0),
        valueCopper: parseInt(lootOrb.dataset.valueCopper || 0)
    };
    
    addItemToInventory(itemData);
    playLootCollectAnimation(lootOrb);
    addLootMessage(characterState.name, [itemData], 'collect');
    hideItemInfo();
    lootOrb.remove();
}

// Function to play loot collection animation
function playLootCollectAnimation(lootOrb) {
    if (!lootOrb) return;

    const rect = lootOrb.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const color = window.getComputedStyle(lootOrb).backgroundColor;
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'loot-particle';
        particle.style.backgroundColor = color;
        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;
        
        const angle = (i / 8) * Math.PI * 2;
        const velocity = {
            x: Math.cos(angle) * 5,
            y: Math.sin(angle) * 5
        };
        
        document.body.appendChild(particle);
        
        let frame = 0;
        const animate = () => {
            frame++;
            const x = centerX + velocity.x * frame;
            const y = centerY + velocity.y * frame + 0.5 * frame * frame;
            
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.opacity = 1 - frame / 20;
            
            if (frame < 20) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// Function to initialize the roll loot button
function initializeRollLootButton() {
    const rollLootButton = document.querySelector('.roll-loot-button');
    if (rollLootButton) {
        rollLootButton.addEventListener('click', () => {
            console.log('Roll loot button clicked');
            const currentCreature = characterState.currentToken;
            if (currentCreature) {
                const creatureName = currentCreature.dataset.name;
                console.log('Rolling loot for:', creatureName);
                handleCreatureLoot(creatureName, currentCreature);
            } else {
                console.warn('No creature selected');
            }
        });
    } else {
        console.error('Roll loot button not found');
    }
}

// Function to show the loot window
function showLootWindow(creatureName, sourceToken) {
    const lootContent = document.querySelector('.tab-content.loot-content');
    const lootTableContainer = lootContent.querySelector('.loot-table-container');
    
    if (!lootContent || !lootTableContainer) {
        console.error('Loot containers not found:', {
            lootContent: !!lootContent,
            lootTableContainer: !!lootTableContainer
        });
        return;
    }
    
    const creatureLootTable = getCreatureLootTable(creatureName);
    displayLootTable(lootTableContainer, creatureLootTable);
}

// Function to get a creature's loot table
function getCreatureLootTable(creatureName) {
    console.log('Getting loot table for:', creatureName);
    const lootTable = window.creatureLootTables[creatureName];
    if (!lootTable) {
        console.warn(`No loot table found for creature: ${creatureName}`);
        return {
            common: [{ itemId: 3, chance: 0.5 }], // Default to healing potion
            uncommon: [],
            rare: [],
            epic: []
        };
    }
    console.log('Found loot table:', lootTable);
    return lootTable;
}

// Function to handle creature loot
function handleCreatureLoot(creatureName, sourceToken) {
    console.log('Handling loot for:', creatureName);
    const lootTable = getCreatureLootTable(creatureName);
    const rolledLoot = rollLoot(lootTable);
    
    if (rolledLoot.length > 0) {
        // Create loot orbs with slight delays for visual effect
        rolledLoot.forEach((item, index) => {
            setTimeout(() => {
                createLootOrb(item, sourceToken);
            }, index * 100); // 100ms delay between each orb
        });
        
        // Add loot drop message
        addLootMessage(creatureName, rolledLoot, 'drop');
    } else {
        // Add a message indicating no loot was dropped
        addMessage('loot', 'System', `${creatureName} dropped nothing.`);
    }
}

// Initialize the loot system once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeRollLootButton();
    
    // Set up loot tab click handler
    const lootTab = document.querySelector('[data-tab="loot"]');
    if (lootTab) {
        lootTab.addEventListener('click', () => {
            const currentCreature = characterState.currentToken;
            if (currentCreature) {
                showLootWindow(currentCreature.dataset.name, currentCreature);
            }
        });
    }
});
