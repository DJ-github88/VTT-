let itemInstanceIdCounter = 1;
let isDraggingItem = false;
let inventory = [];
let encumbranceStatus = 'normal';
let currentEncumbranceStatus = 'normal';

const statDisplayNames = {
    str: "Strength",
    con: "Constitution",
    agi: "Agility",
    int: "Intelligence",
    spir: "Spirit",
    cha: "Charisma",
    maxHealth: "Max Health",
    currentHealth: "Current Health",
    maxMana: "Max Mana",
    currentMana: "Current Mana",
    healing: "Healing", // If used for spell-based healing
    healthRegen: "Health Regeneration",
    manaRegen: "Mana Regeneration",
    damage: "Damage",
    rangedDamage: "Ranged Damage",
    spellDamage: "Spell Damage",
    armor: "Armor",
    crit: "Critical Chance",
    moveSpeed: "Movement Speed",
    carryingCapacity: "Carrying Capacity"
};

function initializeCharacterStats() {
    const baseStats = {
        con: 10, str: 10, agi: 10, int: 10, spir: 10, cha: 10
    };

    characterState.totalStats = { ...baseStats };
    characterState.derivedStats.maxHealth = characterState.totalStats.con * 5;
    characterState.derivedStats.currentHealth = characterState.derivedStats.maxHealth;
    characterState.derivedStats.maxMana = characterState.totalStats.int * 5;
    characterState.derivedStats.currentMana = characterState.derivedStats.maxMana;

    updateCharacterStats();
    updateHealthBar();
    updateManaBar();
}

// Initialize Buff Updater
function initializeBuffUpdater() {
    setInterval(() => {
        const now = Date.now();
        let buffsChanged = false;

        characterState.activeBuffs = characterState.activeBuffs.filter((buff, index) => {
            const isExpired = buff.endTime <= now;
            if (isExpired) {
                buffsChanged = true;
                // Remove buff effects
                for (const [stat, value] of Object.entries(buff.statChanges)) {
                    applyStatChange(stat, -value); // Reverse the stat change
                }
                console.log(`initializeBuffUpdater: Buff "${buff.name}" has expired. Effects removed.`);
                return false; // Remove this buff from the array
            }
            return true; // Keep this buff in the array
        });

        if (buffsChanged) {
            // Recalculate temporary bonuses after removing expired buffs
            characterState.temporaryBonuses = calculateTemporaryBonuses();
            updateCharacterStats();
        }

        // Re-render buffs to update the UI
        renderBuffs();
        updateBuffDurationDisplays();
    }, 1000); // Update every second
}

// Call this function once when the game initializes
initializeBuffUpdater();

// Unified displayStats Function
function displayStats(stats) {
    const statsContainer = document.createElement('div');
    statsContainer.classList.add('stats-container'); // For styling

    for (const [key, value] of Object.entries(stats)) {
        const statName = statDisplayNames[key] || key;

        // Handle negative and positive values differently
        let displayValue = value;
        let statColor = '#d4af37'; // Default gold color

        if (key === 'currentHealth') {
            displayValue = value < 0 ? `-${Math.abs(value)}` : `${value}`;
            statColor = value < 0 ? 'red' : '#d4af37';
        }

        const statElement = document.createElement('p');
        statElement.textContent = `${statName}: ${displayValue}`;
        statElement.style.color = statColor;
        statsContainer.appendChild(statElement);
    }

    return statsContainer;
}

function updateStatDisplay(stat) {
    const statValue = document.getElementById(`${stat}Value`);
    const statTotalOverlay = document.getElementById(`${stat}TotalOverlay`);
    const statModifier = document.getElementById(`${stat}Modifier`);

    if (statValue && statTotalOverlay && statModifier) {
        const baseValue = parseInt(statValue.getAttribute('value'));
        const totalValue = characterState.totalStats[stat];
        const modifier = Math.floor((totalValue - 10) / 2);

        statValue.textContent = baseValue;
        statTotalOverlay.textContent = totalValue;
        statModifier.textContent = modifier >= 0 ? `+${modifier}` : modifier;
    }
}







// Grid //
function generateInventoryGrid() {
    const inventoryGrid = document.getElementById('inventoryGrid');

    const baseRows = 5;
    const totalCols = 15; // Fixed number of columns

    // Use total Strength from characterState
    const strengthValue = characterState.totalStats.str || 10;
    let strengthModifier = Math.floor((strengthValue - 10) / 2);
    strengthModifier = Math.max(strengthModifier, 0); // Ensure modifier is non-negative
    const maxAdditionalRows = 5; // Cap the maximum additional rows
    const additionalRows = Math.min(strengthModifier, maxAdditionalRows);

    const totalRows = baseRows + additionalRows;
    // Adjust the grid template
    inventoryGrid.style.gridTemplateColumns = `repeat(${totalCols}, 42px)`;
    inventoryGrid.style.gridTemplateRows = `repeat(${totalRows}, 42px)`;
    inventoryGrid.dataset.rows = totalRows;
    inventoryGrid.dataset.cols = totalCols;

    // Clear existing tiles without removing inventory items
    const tiles = inventoryGrid.querySelectorAll('.inventory-tile');
    tiles.forEach(tile => tile.remove());

    // Create new tiles
    for (let y = 0; y < totalRows; y++) {
        for (let x = 0; x < totalCols; x++) {
            const tile = document.createElement('div');
            tile.classList.add('inventory-tile');
            tile.dataset.x = x;
            tile.dataset.y = y;

            // Determine which section the tile belongs to based on x-coordinate
            if (x < 5) {
                // Unencumbered tiles
                tile.classList.add('unencumbered');
                tile.style.backgroundColor = 'rgba(38, 28, 28, 0.8)';
            } else if (x < 10) {
                // Encumbered tiles
                tile.classList.add('encumbered');
                tile.style.backgroundColor = 'rgba(255, 165, 0, 0.3)';
            } else {
                // Overencumbered tiles
                tile.classList.add('overencumbered');
                tile.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
            }

            inventoryGrid.appendChild(tile);
        }
    }
}


function updateInventoryGridColoring() {
    const inventoryGrid = document.getElementById('inventoryGrid');
    const tiles = inventoryGrid.querySelectorAll('.inventory-tile');
    const totalCols = parseInt(inventoryGrid.dataset.cols);

    const baseNormalCols = 5;
    const baseEncumberedCols = 5;

    // Use total strength from characterState
    const strengthValue = characterState.totalStats.str || 10;
    const strengthModifier = Math.floor((strengthValue - 10) / 2);
    const strengthModifierCols = Math.max(strengthModifier, 0);

    const normalCols = baseNormalCols + strengthModifierCols;
    const encumberedCols = baseEncumberedCols;
    const overEncumberedCols = totalCols - normalCols - encumberedCols;

    tiles.forEach((tile, index) => {
        const col = index % totalCols;
        if (col < normalCols) {
            tile.style.backgroundColor = 'rgba(38, 28, 28, 0.8)';
        } else if (col < normalCols + encumberedCols) {
            tile.style.backgroundColor = 'rgba(255, 165, 0, 0.3)';
        } else {
            tile.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
        }
    });
}

function regenerateInventoryGrid() {
    // Store current items and their positions
    const inventoryItems = document.querySelectorAll('.inventory-grid .inventory-item');
    const itemsData = [];
    inventoryItems.forEach(item => {
        itemsData.push({
            element: item,
            x: parseInt(item.dataset.x),
            y: parseInt(item.dataset.y)
        });
    });

    // Generate the updated inventory grid based on new Strength value
    generateInventoryGrid();

    // Re-position existing items in the inventory
    itemsData.forEach(data => {
        const itemSize = {
            width: parseInt(data.element.dataset.width),
            height: parseInt(data.element.dataset.height)
        };

        if (isSlotAvailable(data.x, data.y, itemSize, data.element.dataset.instanceId)) {
            placeItemInGrid(data.element, data.x, data.y);
        } else {
            // If the original slot is not available, try to find a new one
            const availableSlot = findAvailableSlot(itemSize, data.element.dataset.instanceId);
            if (availableSlot) {
                placeItemInGrid(data.element, availableSlot.x, availableSlot.y);
            } else {
                alert(`Not enough space to place item ${data.element.dataset.itemId}`);
            }
        }
    });

    // Update the encumbrance status based on new Strength and items
    updateEncumbranceStatus();
}


// Encumbrance //
function updateEncumbranceStatus() {
    const inventoryGrid = document.getElementById('inventoryGrid');
    const items = inventoryGrid.querySelectorAll('.inventory-item');

    let isEncumbered = false;
    let isOverEncumbered = false;

    // Check each item in the inventory to determine if the player is encumbered or overencumbered
    items.forEach(item => {
        const x = parseInt(item.dataset.x);
        const y = parseInt(item.dataset.y);
        const width = parseInt(item.dataset.width);
        const height = parseInt(item.dataset.height);

        // Loop through the item's tiles
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const tileX = x + j;
                const tileY = y + i;
                const tile = inventoryGrid.querySelector(`.inventory-tile[data-x="${tileX}"][data-y="${tileY}"]`);
                
                if (tile) {
                    if (tile.classList.contains('overencumbered')) {
                        isOverEncumbered = true;
                    } else if (tile.classList.contains('encumbered')) {
                        isEncumbered = true;
                    }
                }
            }
        }
    });

    // Determine encumbrance status
    let encumbranceStatus = 'normal';
    if (isOverEncumbered) {
        encumbranceStatus = 'overencumbered';
    } else if (isEncumbered) {
        encumbranceStatus = 'encumbered';
    }

    // Update the current encumbrance status in characterState
    characterState.encumbranceStatus = encumbranceStatus;

    // Update the UI to show the current encumbrance status visually
    updateEncumbranceIcon(encumbranceStatus);

    // Update derived stats based on encumbrance status using characterState
    updateDerivedStats(characterState.totalStats, characterState.equipmentBonuses, characterState.encumbranceStatus);
}

function updateEncumbranceIcon(encumbranceStatus) {
    const encumbranceIcon = document.getElementById('encumbranceIcon');
    if (!encumbranceIcon) return;

    if (encumbranceStatus === 'overencumbered') {
        encumbranceIcon.style.display = 'block';
        encumbranceIcon.textContent = 'Overencumbered';
        encumbranceIcon.style.color = 'red';
    } else if (encumbranceStatus === 'encumbered') {
        encumbranceIcon.style.display = 'block';
        encumbranceIcon.textContent = 'Encumbered';
        encumbranceIcon.style.color = 'orange';
    } else {
        encumbranceIcon.style.display = 'none';
    }
}

function initializeItemSize(itemElement) {
    const width = parseInt(itemElement.dataset.originalWidth);
    const height = parseInt(itemElement.dataset.originalHeight);
    
    // Force proper initial sizing
    itemElement.style.width = `${width * 42 - 2}px`;
    itemElement.style.height = `${height * 42 - 2}px`;
    
    const imgElement = itemElement.querySelector('.item-image');
    if (imgElement) {
        imgElement.style.width = '100%';
        imgElement.style.height = '100%';
        imgElement.style.objectFit = 'cover';
    }
}

function addItemToInventory(item) {
    console.log('Adding item to inventory:', item);

    // Input validation
    if (!item || !item.id) {
        console.error('Invalid item data provided to addItemToInventory');
        return;
    }

    // Handle currency items
    if (item.type === 'currency') {
        addCurrency('gold', item.amount.gold || 0);
        addCurrency('silver', item.amount.silver || 0);
        addCurrency('copper', item.amount.copper || 0);
        return;
    }

    // Size validation
    if (!item.size || typeof item.size.width !== 'number' || typeof item.size.height !== 'number') {
        console.error(`Invalid item size for item "${item.name}"`);
        return;
    }

    // Handle stackable items
    if (item.stackable) {
        // ... existing stackable items logic ...
    }

    // Create new instance id if not already set
    if (!item.instanceId) {
        item.instanceId = itemInstanceIdCounter++;
    }

    // Create comprehensive item data
    const itemData = {
        ...item,
        quantity: item.stackable ? item.quantity || 1 : 1,
        instanceId: item.instanceId,
        originalDuration: item.duration || 0,
        currentDuration: item.duration || 0,
        stackCap: item.stackCap || 5,
        isStackable: !!item.stackable,
        effects: item.effects || item.stats || {},
    };

    // Add to inventory array
    inventory.push({ ...itemData });

    // Create DOM element
    const itemElement = document.createElement('div');
    
    // Handle rarity
    const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const rarity = (item.rarity && validRarities.includes(item.rarity.toLowerCase())) 
                   ? item.rarity.toLowerCase() 
                   : 'common';

    itemElement.classList.add('inventory-item', rarity);
    
    // Set size
    const tileSize = 40;
    const borderWidth = 3;
    itemElement.style.width = `${(item.size.width * tileSize) + borderWidth}px`;
    itemElement.style.height = `${(item.size.height * tileSize) + borderWidth}px`;

    // Ensure numerical properties are properly set
    itemData.value = parseInt(itemData.value) || 0;
    itemData.valueGold = parseInt(itemData.valueGold) || 0;
    itemData.valueSilver = parseInt(itemData.valueSilver) || 0;
    itemData.valueCopper = parseInt(itemData.valueCopper) || 0;
    itemData.level = parseInt(itemData.level) || 1;
    itemData.requiredLevel = parseInt(itemData.requiredLevel) || 1;
    itemData.size.width = parseInt(itemData.size.width) || 1;
    itemData.size.height = parseInt(itemData.size.height) || 1;

// Set all dataset attributes
Object.assign(itemElement.dataset, {
    itemId: itemData.id.toString(),
    instanceId: itemData.instanceId.toString(),
    rotation: '0',
    originalWidth: itemData.size.width.toString(),
    originalHeight: itemData.size.height.toString(),
    width: itemData.size.width.toString(),
    height: itemData.size.height.toString(),
    type: itemData.type || '',
    name: itemData.name || '',
    description: itemData.description || '',
    effects: JSON.stringify(itemData.effects || {}),
    rarity: (itemData.rarity || 'common').toLowerCase(),
    image: itemData.image || '/api/placeholder/400/320',
    icon: itemData.icon || '📦',
    itemData: JSON.stringify(itemData),
    quantity: itemData.quantity.toString(),
    value: itemData.value.toString(),
    valueGold: itemData.valueGold.toString(),
    valueSilver: itemData.valueSilver.toString(),
    valueCopper: itemData.valueCopper.toString(),
    slot: Array.isArray(itemData.slot) ? itemData.slot.join(',') : (itemData.slot || ''),
    weaponType: itemData.weaponType || '',
    weaponSubtype: itemData.weaponSubtype || '',
    offHanded: itemData.offHanded ? 'true' : 'false',
    damageDice: itemData.damageDice || '',
    armorMaterial: itemData.armorMaterial || '',
    armorType: itemData.armorType || '',
    accessoryType: itemData.accessoryType || '',
    duration: itemData.duration ? itemData.duration.toString() : '0',
    consumableEffect: itemData.consumableEffect || '',
    twoHanded: itemData.twoHanded ? 'true' : 'false',
    binds: itemData.binds || '',
    level: itemData.level.toString(),
    requiredLevel: itemData.requiredLevel.toString(),
    quality: itemData.quality || '',
});

    // Create and append image
    const imgElement = document.createElement('img');
    imgElement.src = itemData.image || '/api/placeholder/400/320';
    imgElement.alt = itemData.name;
    imgElement.classList.add('item-image');
    imgElement.style.width = '100%';
    imgElement.style.height = '100%';
    imgElement.style.objectFit = 'cover';
    imgElement.draggable = false;
    itemElement.appendChild(imgElement);

    // Add quantity badge for stackable items
    if (itemData.isStackable) {
        const quantityElement = document.createElement('div');
        quantityElement.classList.add('item-quantity');
        quantityElement.textContent = itemData.quantity.toString();
        itemElement.appendChild(quantityElement);
    }

    // Add event listeners
    itemElement.addEventListener('mouseenter', (e) => showItemInfo(itemElement, e));
    itemElement.addEventListener('mousemove', updateTooltipPosition);
    itemElement.addEventListener('mouseleave', hideItemInfo);
    itemElement.addEventListener('contextmenu', handleInventoryContextMenu);
    
    // Find available slot and place item
    const availableSlot = findAvailableSlot(
        { width: itemData.size.width, height: itemData.size.height },
        itemData.instanceId
    );

    if (availableSlot) {
        placeItemInGrid(itemElement, availableSlot.x, availableSlot.y);
        const inventoryGrid = document.getElementById('inventoryGrid');
        inventoryGrid.appendChild(itemElement);
        makeItemDraggable(itemElement);
    } else {
        inventory = inventory.filter(i => i.instanceId !== itemData.instanceId);
        console.warn(`Failed to place item "${itemData.name}" due to lack of space.`);
        return;
    }

    // Update UI
    if (itemData.isStackable || itemData.type === 'consumable') {
        updateActionBarQuantities();
    }
    updateEncumbranceStatus();
}



function verifyInventoryStacks() {
    const stacksByType = {};
    const inventoryItems = document.querySelectorAll('.inventory-item[data-type="consumable"]');
    
    inventoryItems.forEach(item => {
        const itemId = item.dataset.itemId;
        if (!stacksByType[itemId]) {
            stacksByType[itemId] = [];
        }
        stacksByType[itemId].push({
            instanceId: item.dataset.instanceId,
            quantity: parseInt(item.dataset.quantity) || 0
        });
    });

    console.log('Current inventory stacks:', stacksByType);
    return stacksByType;
}

function createItemElement(item) {
    const itemElement = document.createElement('div');

    // Define valid rarities
    const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

    // Determine the rarity class, default to 'common' if not specified or invalid
    const rarity = (item.rarity && validRarities.includes(item.rarity.toLowerCase())) 
                   ? item.rarity.toLowerCase() 
                   : 'common';

    if (!item.rarity || !validRarities.includes(item.rarity.toLowerCase())) {
        console.warn(`Item "${item.name}" has an invalid or missing rarity. Defaulting to 'common'.`);
    }

    // Add both 'inventory-item' and the rarity class
    itemElement.classList.add('inventory-item', rarity);
    console.log(`Assigned classes: inventory-item, ${rarity} to item "${item.name}"`);

    // Calculate exact size based on grid
    const tileSize = 40; // Base tile size in pixels
    const gapSize = 2; // Gap between tiles, if any
    const borderWidth = 3; // Border width in pixels

    // Set initial size (accounting for borders)
    itemElement.style.width = `${(item.size.width * tileSize) + borderWidth}px`;
    itemElement.style.height = `${(item.size.height * tileSize) + borderWidth}px`;

    // Create and style the image element
    const imgElement = document.createElement('img');
    imgElement.src = item.image || 'path/to/default/item/image.png';
    imgElement.alt = item.name;
    imgElement.classList.add('item-image');
    imgElement.draggable = false;

    // Ensure the image fills the container
    imgElement.style.width = '100%';
    imgElement.style.height = '100%';
    imgElement.style.objectFit = 'cover';
    imgElement.style.position = 'absolute';
    imgElement.style.top = '0';
    imgElement.style.left = '0';

    // Append the image to the item container
    itemElement.appendChild(imgElement);

// Set dataset attributes for further use
itemElement.dataset.itemId = item.id;
itemElement.dataset.instanceId = item.instanceId;
itemElement.dataset.rotation = '0';
itemElement.dataset.originalWidth = item.size.width;
itemElement.dataset.originalHeight = item.size.height;
itemElement.dataset.width = item.size.width;
itemElement.dataset.height = item.size.height;
itemElement.dataset.type = item.type;
itemElement.dataset.name = item.name;
itemElement.dataset.description = item.description;
itemElement.dataset.effects = JSON.stringify(item.stats || {});
itemElement.dataset.icon = item.icon || '📦';

// Add weapon and armor properties from both root level and stats
itemElement.dataset.weaponType = item.weaponType || item.stats?.weaponType || '';
itemElement.dataset.weaponCategory = item.weaponCategory || item.stats?.weaponCategory || '';
itemElement.dataset.damageDice = item.damageDice || item.stats?.damageDice || '';
itemElement.dataset.armorType = item.armorType || item.stats?.armorType || '';
itemElement.dataset.armorMaterial = item.armorMaterial || item.stats?.armorMaterial || '';
itemElement.dataset.slot = Array.isArray(item.slot) ? item.slot.join(',') : (item.slot || '');

// Store complete item data last
itemElement.dataset.itemData = JSON.stringify(item);

    // Add quantity badge for stackable items
    if (item.stackable) {
        itemElement.dataset.quantity = '1';
        const quantityElement = document.createElement('div');
        quantityElement.classList.add('item-quantity');
        quantityElement.textContent = '1';
        itemElement.appendChild(quantityElement);
        console.log(`Added quantity badge to stackable item "${item.name}"`);
    }

// Add event listeners
itemElement.addEventListener('mouseenter', (e) => showItemInfo(itemElement, e));
itemElement.addEventListener('mousemove', updateTooltipPosition);
itemElement.addEventListener('mouseleave', hideItemInfo);
itemElement.addEventListener('contextmenu', handleInventoryContextMenu);


    return itemElement;
}



// Update the splitItem function
function splitItem(item, itemElement) {
    const instanceId = itemElement.dataset.instanceId;
    const inventoryIndex = inventory.findIndex(invItem => 
        invItem.instanceId.toString() === instanceId
    );

    if (inventoryIndex === -1) return;

    const currentInventoryItem = inventory[inventoryIndex];
    const currentQuantity = currentInventoryItem.quantity;

    if (currentQuantity <= 1) return;

    const splitQuantity = Math.floor(currentQuantity / 2);
    const remainingQuantity = currentQuantity - splitQuantity;

    // Update original stack
    currentInventoryItem.quantity = remainingQuantity;
    itemElement.dataset.quantity = remainingQuantity;
    const quantityElement = itemElement.querySelector('.item-quantity');
    if (quantityElement) {
        quantityElement.textContent = remainingQuantity;
    }

    // Create new stack
    const newItemData = {
        ...item,
        quantity: splitQuantity,
        instanceId: itemInstanceIdCounter++
    };
    
    // Add to inventory array
    inventory.push(newItemData);

    // Create new DOM element
    const newItemElement = createItemElement(newItemData);
    
    // Find slot for new stack
    const availableSlot = findAvailableSlot({
        width: item.size.width,
        height: item.size.height
    });

    if (availableSlot) {
        placeItemInGrid(newItemElement, availableSlot.x, availableSlot.y);
        const inventoryGrid = document.getElementById('inventoryGrid');
        inventoryGrid.appendChild(newItemElement);
        makeItemDraggable(newItemElement);
    } else {
        // Revert if no space
        currentInventoryItem.quantity = currentQuantity;
        itemElement.dataset.quantity = currentQuantity;
        if (quantityElement) {
            quantityElement.textContent = currentQuantity;
        }
        inventory.pop();
        return;
    }

    updateEncumbranceStatus();
    updateActionBarQuantities();
}




// Update the useItem function
function useItem(item, itemElement = null) {
    if (!item) {
        console.error('useItem: Invalid item parameter.');
        return;
    }

    // Get the player token
    const playerToken = document.querySelector('.token.player-token');
    if (!playerToken) {
        console.error('useItem: Player token not found');
        return;
    }

    // For consumables, check total quantity across ALL stacks
    if (item.type === 'consumable') {
        const totalQuantity = getTotalQuantityForItem(item.id);

        // Prevent usage if empty
        if (totalQuantity === 0) {
            addCombatMessage(`No ${item.name} remaining in inventory!`);
            return;
        }
    }

    // Check if in combat and handle AP cost
    if (window.combatState && window.combatState.isInCombat) {
        const currentAP = parseInt(playerToken.dataset.actionPoints) || 0;
        if (currentAP < 1) {
            addCombatMessage("Not enough AP to use item!");
            return;
        }
        // Spend 1 AP
        playerToken.dataset.actionPoints = currentAP - 1;
        updateTokenAP(playerToken);
        updateAPBar(currentAP - 1);
    }

    console.log('useItem: Using item:', item.name);

    // Store initial health/mana values for comparison
    const initialHealth = characterState.derivedStats.currentHealth;
    const initialMana = characterState.derivedStats.currentMana;

    // 1. Apply Immediate Effects
    applyImmediateEffects(item, playerToken);

    // 2. Apply Temporary Buffs
    applyTemporaryBuffs(item);

    // 3. Handle Item Consumption
    if (item.type === 'consumable') {
        // Find the smallest stack to consume from
        const stacks = Array.from(document.querySelectorAll(
            `.inventory-item[data-item-id="${item.id}"]`
        )).sort((a, b) => {
            return (parseInt(a.dataset.quantity) || 0) - (parseInt(b.dataset.quantity) || 0);
        });

        if (stacks.length > 0) {
            const targetStack = stacks[0];
            const currentQuantity = parseInt(targetStack.dataset.quantity) || 0;

            if (currentQuantity > 1) {
                // Reduce stack
                targetStack.dataset.quantity = currentQuantity - 1;
                const quantityElement = targetStack.querySelector('.item-quantity');
                if (quantityElement) {
                    quantityElement.textContent = currentQuantity - 1;
                }

                // Update inventory array
                const inventoryItem = inventory.find(invItem => 
                    invItem.instanceId.toString() === targetStack.dataset.instanceId
                );
                if (inventoryItem) {
                    inventoryItem.quantity = currentQuantity - 1;
                }
            } else {
                // Remove empty stack from inventory
                inventory = inventory.filter(invItem => 
                    invItem.instanceId.toString() !== targetStack.dataset.instanceId
                );
                if (targetStack.parentNode) {
                    targetStack.parentNode.removeChild(targetStack);
                }
            }
        } else {
            // No stacks found, but item type is consumable
            console.warn(`No stacks found for consumable item "${item.name}" with ID ${item.id}`);
        }
    }

    // Update action bar quantities
    updateActionBarQuantities();

    // 4. Calculate and show changes
    const healthChange = characterState.derivedStats.currentHealth - initialHealth;
    const manaChange = characterState.derivedStats.currentMana - initialMana;

    // Show floating combat text for health/mana changes
    if (healthChange !== 0) {
        showFloatingCombatText(playerToken, healthChange, healthChange > 0 ? 'heal' : 'damage');
    }
    if (manaChange !== 0) {
        showFloatingCombatText(playerToken, manaChange, 'mana');
    }

    // Update combat log with detailed information
    let message = `${characterState.name} used ${item.name}`;
    if (healthChange !== 0) {
        message += ` (${healthChange > 0 ? '+' : ''}${healthChange} HP)`;
    }
    if (manaChange !== 0) {
        message += ` (${manaChange > 0 ? '+' : ''}${manaChange} MP)`;
    }
    addCombatMessage(message);

    // Update all visual elements
    updateTokenVisuals(playerToken);
    if (characterState.currentTarget === playerToken) {
        updateTargetInfo(playerToken);
    }

    // Log the inventory after using the item
    console.log('useItem: Inventory after use:', inventory);
}






// Helper function to get item data from element
function getItemDataFromElement(element) {
    return {
        name: element.dataset.name,
        icon: element.dataset.icon,
        image: element.dataset.image,
        description: element.dataset.description,
        effects: JSON.parse(element.dataset.effects || '[]'),
        type: 'consumable'
    };
}

function findItemById(itemId) {
    return characterState.inventory.find(item => item.id === itemId) ||
           characterState.equipment.find(item => item.id === itemId);
}

function useConsumable(itemId) {
    const item = findItemById(itemId);
    if (!item || item.quantity <= 0) {
        addCombatMessage("Item not available!");
        return;
    }

    // Apply consumable effects
    if (item.effects) {
        item.effects.forEach(effect => {
            switch(effect.type) {
                case 'heal':
                    heal(effect.value, characterState.currentToken);
                    break;
                case 'mana':
                    regenerateMana(effect.value, characterState.currentToken);
                    break;
                // Add other effect types as needed
            }
        });
    }

    // Reduce quantity
    item.quantity--;
    if (item.quantity <= 0) {
        removeItemFromInventory(itemId);
        // Also remove from action bar if present
        document.querySelectorAll(`.action-slot[data-action-id="${itemId}"]`).forEach(slot => {
            slot.innerHTML = `<img src="path/to/empty-slot.png" alt="Empty Slot">`;
            delete slot.dataset.actionType;
            delete slot.dataset.actionId;
            delete slot.dataset.actionName;
        });
    }
    
    updateInventoryDisplay();
}

// Update the applyImmediateEffects function
function applyImmediateEffects(item, token) {
    if (item.stats.currentHealth) {
        const healAmount = item.stats.currentHealth;
        characterState.derivedStats.currentHealth = Math.min(
            characterState.derivedStats.currentHealth + healAmount,
            characterState.derivedStats.maxHealth
        );
        // Update token's health
        token.dataset.currentHealth = characterState.derivedStats.currentHealth;
        updateHealthBar();
        console.log(`applyImmediateEffects: Restored ${healAmount} health.`);
    }

    if (item.stats.currentMana) {
        const manaAmount = item.stats.currentMana;
        characterState.derivedStats.currentMana = Math.min(
            characterState.derivedStats.currentMana + manaAmount,
            characterState.derivedStats.maxMana
        );
        // Update token's mana
        token.dataset.currentMana = characterState.derivedStats.currentMana;
        updateManaBar();
        console.log(`applyImmediateEffects: Restored ${manaAmount} mana.`);
    }

    if (item.stats.maxHealth) {
        characterState.derivedStats.maxHealth += item.stats.maxHealth;
        token.dataset.maxHealth = characterState.derivedStats.maxHealth;
        updateHealthBar();
        console.log(`applyImmediateEffects: Changed max health by ${item.stats.maxHealth}.`);
    }

    if (item.stats.maxMana) {
        characterState.derivedStats.maxMana += item.stats.maxMana;
        token.dataset.maxMana = characterState.derivedStats.maxMana;
        updateManaBar();
        console.log(`applyImmediateEffects: Changed max mana by ${item.stats.maxMana}.`);
    }

    // Handle other immediate effects
    for (const [stat, value] of Object.entries(item.stats)) {
        if (!['currentHealth', 'currentMana', 'maxHealth', 'maxMana'].includes(stat)) {
            applyStatChange(stat, value);
        }
    }
}



// Update the handleItemConsumption function
function handleItemConsumption(item, itemElement) {
    if (!item.type === "consumable") return;

    const instanceId = itemElement.dataset.instanceId;
    const inventoryIndex = inventory.findIndex(invItem => 
        invItem.instanceId.toString() === instanceId
    );

    if (inventoryIndex === -1) {
        console.error(`handleItemConsumption: Inventory item not found for instanceId ${instanceId}`);
        return;
    }

    // Calculate total quantity BEFORE consumption
    let totalQuantity = 0;
    const inventoryStacks = document.querySelectorAll(
        `.inventory-item[data-item-id="${item.id}"]`
    );
    
    inventoryStacks.forEach(stack => {
        totalQuantity += parseInt(stack.dataset.quantity) || 0;
    });

    if (totalQuantity === 0) {
        addCombatMessage(`No ${item.name} remaining in inventory!`);
        return;
    }

    const currentInventoryItem = inventory[inventoryIndex];
    const currentQuantity = currentInventoryItem.quantity;

    if (currentQuantity > 1) {
        // Reduce quantity for stacked items
        const newQuantity = currentQuantity - 1;
        currentInventoryItem.quantity = newQuantity;
        itemElement.dataset.quantity = newQuantity;

        const quantityElement = itemElement.querySelector('.item-quantity');
        if (quantityElement) {
            quantityElement.textContent = newQuantity;
        }
    } else {
        // Remove the item from inventory array but NOT from action bar
        inventory.splice(inventoryIndex, 1);
        if (itemElement.parentNode) {
            itemElement.parentNode.removeChild(itemElement);
        }
    }

    // Update action bar WITHOUT removing the image
    updateActionBarQuantities();
}

function calculateTemporaryBonuses() {
    const bonuses = {
        str: 0, con: 0, agi: 0, int: 0, spir: 0, cha: 0,
        armor: 0, damage: 0, healthRegen: 0, manaRegen: 0,
        moveSpeed: 0, crit: 0, spellDamage: 0, healing: 0,
        rangedDamage: 0, carryingCapacity: 0
    };

    const statMapping = {
        strength: 'str',
        constitution: 'con',
        agility: 'agi',
        intelligence: 'int',
        spirit: 'spir',
        charisma: 'cha'
    };

    console.log("Calculating temporary bonuses. Current active buffs:", characterState.activeBuffs);

    characterState.activeBuffs.forEach(buff => {
        if (buff.statChanges) {
            for (const [stat, value] of Object.entries(buff.statChanges)) {
                const mappedStat = statMapping[stat] || stat;
                if (bonuses.hasOwnProperty(mappedStat)) {
                    bonuses[mappedStat] += value;
                    console.log(`Added ${value} to ${mappedStat} from buff "${buff.name}"`);
                }
            }
        }
    });

    console.log("Calculated temporary bonuses:", bonuses);
    return bonuses;
}

// Update the applyStatChange function
function applyStatChange(stat, value) {
    if (characterState.totalStats.hasOwnProperty(stat)) {
        characterState.totalStats[stat] += value;
        console.log(`${capitalizeFirstLetter(stat)} modified by ${value}. Current ${capitalizeFirstLetter(stat)}: ${characterState.totalStats[stat]}`);
    } else if (characterState.derivedStats.hasOwnProperty(stat)) {
        characterState.derivedStats[stat] += value;
        console.log(`${capitalizeFirstLetter(stat)} modified by ${value}. Current ${capitalizeFirstLetter(stat)}: ${characterState.derivedStats[stat]}`);
    } else {
        console.warn(`Stat "${stat}" does not exist in totalStats or derivedStats.`);
    }
    
    updateStatDisplay(stat);
}





function applyTemporaryStatChange(stat, value, duration, buffName) {
    if (!characterState.temporaryBonuses.hasOwnProperty(stat)) {
        console.warn(`Stat "${stat}" does not exist in temporaryBonuses.`);
        return;
    }

    // Apply temporary bonus
    characterState.temporaryBonuses[stat] += value;
    console.log(`${capitalizeFirstLetter(stat)} temporarily modified by ${value}. Current Temporary ${capitalizeFirstLetter(stat)}: ${characterState.temporaryBonuses[stat]}`);

    // Recalculate character stats to include temporary bonuses
    updateCharacterStats();

    // Revert the temporary bonus after duration
    setTimeout(() => {
        characterState.temporaryBonuses[stat] -= value;
        console.log(`Temporary modification of ${stat} by ${value} from buff "${buffName}" has expired. Current Temporary ${capitalizeFirstLetter(stat)}: ${characterState.temporaryBonuses[stat]}`);
        updateCharacterStats();
    }, duration * 1000); // Convert seconds to milliseconds
}


// Update the addBuff function to handle missing durations
function addBuff(buff, item) {
    console.log("Adding buff:", buff);
    console.log("Item:", item);

    if (!buff) {
        console.error("Invalid buff data: buff is undefined");
        return;
    }

    // Get duration from either the buff or the item, default to 0 for instant effects
    const duration = buff.duration || item.duration || 0;
    console.log("Buff duration:", duration);

    // For instant effects (duration 0), just apply the stats and return
    if (duration === 0) {
        if (buff.statChanges) {
            for (const [stat, value] of Object.entries(buff.statChanges)) {
                applyStatChange(stat, value);
            }
        }
        return;
    }

    const now = Date.now();
    const endTime = now + duration * 1000;
    const existingBuffIndex = characterState.activeBuffs.findIndex(b => b.name === buff.name);
    
    if (existingBuffIndex !== -1) {
        // Update existing buff
        characterState.activeBuffs[existingBuffIndex].endTime = endTime;
        characterState.activeBuffs[existingBuffIndex].duration = duration;
        console.log(`Buff "${buff.name}" refreshed. New end time: ${new Date(endTime)}`);
    } else {
        // Add new buff
        const newBuff = {
            name: buff.name,
            description: buff.description,
            icon: buff.icon || item.image, // Use item image as fallback
            duration: duration,
            endTime: endTime,
            statChanges: buff.statChanges
        };
        characterState.activeBuffs.push(newBuff);
        console.log(`Buff "${buff.name}" added. End time: ${new Date(endTime)}`);

        // Apply buff effects
        if (newBuff.statChanges) {
            for (const [stat, value] of Object.entries(newBuff.statChanges)) {
                applyStatChange(stat, value);
            }
        }
    }

    // Recalculate and apply temporary bonuses
    characterState.temporaryBonuses = calculateTemporaryBonuses();
    updateCharacterStats();
    renderBuffs();
}





// Update the applyTemporaryBuffs function to better handle different item types
function applyTemporaryBuffs(item) {
    if (!item) {
        console.error('applyTemporaryBuffs: Invalid item');
        return;
    }

    // For items with explicit buffs, apply them directly
    if (item.buff) {
        addBuff(item.buff, item);
        return;
    }

    // For consumables without explicit buffs, create a temporary buff from their stats
    if (item.type === 'consumable') {
        const statChanges = { ...item.stats };
        
        // Remove immediate effect stats
        delete statChanges.currentHealth;
        delete statChanges.currentMana;

        // Only create a buff if there are remaining stat changes
        if (Object.keys(statChanges).length > 0) {
            const tempBuff = {
                name: `${item.name} Effect`,
                description: item.description,
                icon: item.image,
                duration: item.duration || 0,
                statChanges: statChanges
            };
            addBuff(tempBuff, item);
        }
    }
}





// Buff Rendering Function
function renderBuffs() {
    const buffIconsContainer = document.getElementById('buffIcons');
    buffIconsContainer.innerHTML = '';

    characterState.activeBuffs.forEach(buff => {
        const buffIcon = document.createElement('div');
        buffIcon.classList.add('buff-icon');
        buffIcon.style.backgroundImage = `url('${buff.icon}')`;
        buffIcon.dataset.buffName = buff.name;

        const progressBar = document.createElement('div');
        progressBar.classList.add('buff-progress');
        buffIcon.appendChild(progressBar);

        const durationElement = document.createElement('div');
        durationElement.classList.add('buff-duration');
        buffIcon.appendChild(durationElement);

        buffIcon.addEventListener('mouseenter', (e) => showBuffTooltip(buff, e));
        buffIcon.addEventListener('mouseleave', hideBuffTooltip);
        buffIcon.addEventListener('contextmenu', (e) => showBuffContextMenu(e, buff));

        buffIconsContainer.appendChild(buffIcon);
    });

    updateBuffDurationDisplays();
}

// Function to show the buff context menu
function showBuffContextMenu(event, buff) {
    event.preventDefault();
    const contextMenu = document.getElementById('buffContextMenu');
    if (!contextMenu) {
        createBuffContextMenu();
    }

    const buffContextMenu = document.getElementById('buffContextMenu');
    buffContextMenu.style.display = 'block';
    buffContextMenu.style.left = `${event.pageX}px`;
    buffContextMenu.style.top = `${event.pageY}px`;
    buffContextMenu.dataset.buffName = buff.name;

    // Close the menu when clicking outside
    document.addEventListener('click', closeBuffContextMenu);
}

// Function to create the buff context menu
function createBuffContextMenu() {
    const menu = document.createElement('div');
    menu.id = 'buffContextMenu';
    menu.style.position = 'absolute';
    menu.style.zIndex = '1000';
    menu.style.backgroundColor = '#f9f9f9';
    menu.style.border = '1px solid #ccc';
    menu.style.padding = '5px';
    menu.style.display = 'none';

    const removeOption = document.createElement('div');
    removeOption.textContent = 'Remove Buff';
    removeOption.style.cursor = 'pointer';
    removeOption.addEventListener('click', handleRemoveBuff);

    menu.appendChild(removeOption);
    document.body.appendChild(menu);
}

// Function to close the buff context menu
function closeBuffContextMenu() {
    const buffContextMenu = document.getElementById('buffContextMenu');
    if (buffContextMenu) {
        buffContextMenu.style.display = 'none';
    }
    document.removeEventListener('click', closeBuffContextMenu);
}

// Function to handle buff removal
function handleRemoveBuff() {
    const buffContextMenu = document.getElementById('buffContextMenu');
    const buffName = buffContextMenu.dataset.buffName;
    removeBuff(buffName);
    closeBuffContextMenu();
}

// Function to remove a buff
function removeBuff(buffName) {
    const buffIndex = characterState.activeBuffs.findIndex(buff => buff.name === buffName);
    if (buffIndex !== -1) {
        const buff = characterState.activeBuffs[buffIndex];
        // Remove buff effects
        for (const [stat, value] of Object.entries(buff.statChanges)) {
            applyStatChange(stat, -value); // Reverse the stat change
        }
        characterState.activeBuffs.splice(buffIndex, 1);
        console.log(`Buff "${buffName}" has been manually removed.`);

        // Recalculate temporary bonuses after removing the buff
        characterState.temporaryBonuses = calculateTemporaryBonuses();
        updateCharacterStats();
        renderBuffs();
    }
}

// Update the updateBuffDurations function
function updateBuffDurations() {
    const now = Date.now();
    let buffsChanged = false;

    characterState.activeBuffs = characterState.activeBuffs.filter(buff => {
        const isExpired = buff.endTime <= now;
        if (isExpired) {
            buffsChanged = true;
            // Remove buff effects
            for (const [stat, value] of Object.entries(buff.statChanges)) {
                applyStatChange(stat, -value); // Reverse the stat change
            }
            console.log(`Buff "${buff.name}" has expired. Effects removed.`);
        }
        return !isExpired;
    });

    if (buffsChanged) {
        // Recalculate temporary bonuses after removing expired buffs
        characterState.temporaryBonuses = calculateTemporaryBonuses();
        updateCharacterStats();
        renderBuffs();
    } else {
        // If no buffs changed, just update the displays
        updateBuffDurationDisplays();
    }
}



// Update the updateBuffDurationDisplays function
function updateBuffDurationDisplays() {
    const now = Date.now();
    const buffIcons = document.querySelectorAll('.buff-icon');

    buffIcons.forEach(buffIcon => {
        const buffName = buffIcon.dataset.buffName;
        const buff = characterState.activeBuffs.find(b => b.name === buffName);
        if (buff) {
            const remainingTime = Math.max(0, Math.floor((buff.endTime - now) / 1000));
            const progressBar = buffIcon.querySelector('.buff-progress');
            const durationElement = buffIcon.querySelector('.buff-duration');

            const progressPercentage = (remainingTime / buff.duration) * 100;
            progressBar.style.width = `${progressPercentage}%`;
            durationElement.textContent = formatTime(remainingTime);
        }
    });
}




// Helper function to format time
function formatTime(seconds) {
    if (seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}



// Function to Show Buff Tooltip
function showBuffTooltip(buff, event) {
    const buffTooltip = document.getElementById('buffTooltip');
    if (!buffTooltip) {
        console.error('Buff tooltip container not found!');
        return;
    }

    buffTooltip.innerHTML = `
        <div class="buff-tooltip-content">
            <h3>${buff.name}</h3>
            <p>${buff.description}</p>
        </div>
    `;
    buffTooltip.style.display = 'block';

    // Position the tooltip near the cursor
    const tooltipWidth = buffTooltip.offsetWidth;
    const tooltipHeight = buffTooltip.offsetHeight;
    let x = event.pageX + 15;
    let y = event.pageY + 15;

    // Prevent tooltip from going off-screen
    if (x + tooltipWidth > window.innerWidth) {
        x = event.pageX - tooltipWidth - 15;
    }
    if (y + tooltipHeight > window.innerHeight) {
        y = event.pageY - tooltipHeight - 15;
    }

    buffTooltip.style.left = `${x}px`;
    buffTooltip.style.top = `${y}px`;
}

// Function to Hide Buff Tooltip
function hideBuffTooltip() {
    const buffTooltip = document.getElementById('buffTooltip');
    if (buffTooltip) {
        buffTooltip.style.display = 'none';
    }
}



function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


function removeItemFromInventory(itemElement) {
    if (!itemElement) {
        console.error('removeItemFromInventory: Invalid itemElement');
        return;
    }

    const instanceId = itemElement.dataset.instanceId;
    const itemId = itemElement.dataset.itemId;
    console.log(`removeItemFromInventory: Attempting to remove item with instanceId ${instanceId}`);

    // Remove from inventory array
    const index = inventory.findIndex(item => item.instanceId === instanceId);
    if (index !== -1) {
        inventory.splice(index, 1);
        console.log(`removeItemFromInventory: Item with instanceId ${instanceId} removed from inventory array.`);
    }

    // Clear grid tiles
    const x = parseInt(itemElement.dataset.x);
    const y = parseInt(itemElement.dataset.y);
    const width = parseInt(itemElement.dataset.width);
    const height = parseInt(itemElement.dataset.height);

    const inventoryGrid = document.getElementById('inventoryGrid');
    if (inventoryGrid) {
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const tileX = x + j;
                const tileY = y + i;
                const tile = inventoryGrid.querySelector(`.inventory-tile[data-x="${tileX}"][data-y="${tileY}"]`);
                if (tile && tile.dataset.occupied === instanceId) {
                    delete tile.dataset.occupied;
                }
            }
        }
    }

    // Remove from DOM
    if (itemElement.parentNode) {
        itemElement.parentNode.removeChild(itemElement);
    }

    // Update action bar if item was a consumable
    if (itemElement.dataset.type === 'consumable') {
        const actionSlots = document.querySelectorAll(
            `.action-slot[data-action-type="consumable"][data-item-id="${itemId}"]`
        );
        if (actionSlots.length > 0) {
            updateActionBarQuantities();
        }
    }

    updateEncumbranceStatus();
}






function rotateItem(itemElement) {
    const currentRotation = parseInt(itemElement.dataset.rotation) || 0;
    const newRotation = (currentRotation + 90) % 180;

    const originalWidth = parseInt(itemElement.dataset.originalWidth);
    const originalHeight = parseInt(itemElement.dataset.originalHeight);
    const x = parseInt(itemElement.dataset.x);
    const y = parseInt(itemElement.dataset.y);

    // Find the img element
    const imgElement = itemElement.querySelector('.item-image');
    if (!imgElement) {
        console.error('rotateItem: Image element not found inside inventory item.');
        return;
    }

    // Set transform origins
    itemElement.style.transformOrigin = 'center center';
    imgElement.style.transformOrigin = 'center center';

    if (newRotation === 90) {
        itemElement.dataset.width = originalHeight;
        itemElement.dataset.height = originalWidth;
        itemElement.style.width = `${originalHeight * 42}px`;
        itemElement.style.height = `${originalWidth * 42}px`;
        
        // Calculate scale based on the largest dimension ratio
        const scaleX = Math.max(originalWidth / originalHeight, originalHeight / originalWidth) * 1.1;
        const scaleY = scaleX; // Keep aspect ratio by using same scale
        imgElement.style.transform = `rotate(${newRotation}deg) scale(${scaleX}, ${scaleY})`;
        imgElement.style.width = '100%';
        imgElement.style.height = '100%';
        imgElement.style.objectFit = 'contain'; // Use cover to ensure full coverage
    } else {
        itemElement.dataset.width = originalWidth;
        itemElement.dataset.height = originalHeight;
        itemElement.style.width = `${originalWidth * 42}px`;
        itemElement.style.height = `${originalHeight * 42}px`;
        imgElement.style.transform = 'none';
        imgElement.style.width = '100%';
        imgElement.style.height = '100%';
        imgElement.style.objectFit = 'fill'; // Use fill for normal state
    }

    // Update rotation in dataset
    itemElement.dataset.rotation = newRotation;

    removeItemFromGrid(itemElement);

    if (isSlotAvailable(x, y, { width: parseInt(itemElement.dataset.width), height: parseInt(itemElement.dataset.height) }, itemElement.dataset.instanceId)) {
        placeItemInGrid(itemElement, x, y);
    } else {
        const availableSlot = findAvailableSlot({ width: parseInt(itemElement.dataset.width), height: parseInt(itemElement.dataset.height) }, itemElement.dataset.instanceId);
        if (availableSlot) {
            placeItemInGrid(itemElement, availableSlot.x, availableSlot.y);
        } else {
            imgElement.style.transform = `rotate(${currentRotation}deg) scale(1, 1)`;
            itemElement.dataset.rotation = currentRotation;
            itemElement.dataset.width = originalWidth;
            itemElement.dataset.height = originalHeight;
            itemElement.style.width = `${originalWidth * 42}px`;
            itemElement.style.height = `${originalHeight * 42}px`;
            placeItemInGrid(itemElement, x, y);
            alert('Not enough space to rotate the item!');
            return;
        }
    }

    itemElement.style.animation = 'spawnItem 0.3s ease-in-out';
    setTimeout(() => {
        itemElement.style.animation = '';
    }, 300);

    updateEncumbranceStatus();
}



function determineSlotForItem(item) {
        // If the item has multiple possible slots, return the first one as the default.
        if (Array.isArray(item.slot)) {
            return item.slot[0];
        }
        
        // If the item has only one slot, return that slot.
        return item.slot;

}
    
function equipItem(item, itemElement) {
        console.log("Equipping item:", item);

    // Determine the slot for the item
    const slot = determineSlotForItem(item);

    // Delegate to equipItemToSlot to handle the equipping process
    equipItemToSlot(item, itemElement, slot);
        
        // Ensure characterState.equipment is initialized
        if (!characterState.equipment) {
            characterState.equipment = {};
        }
    
        // Remove item from inventory grid and DOM
        removeItemFromGrid(itemElement);
        const inventoryGrid = document.getElementById('inventoryGrid');
        if (inventoryGrid.contains(itemElement)) {
            inventoryGrid.removeChild(itemElement);
        }
    
        // Update UI with the equipped item
        const gearSlot = document.querySelector(`.gear-slot[data-slot="${slot}"]`);
        if (gearSlot) {
            const existingItem = gearSlot.querySelector('.inventory-item');
            if (existingItem) existingItem.remove();
            gearSlot.appendChild(itemElement);
    
            // Set item element styles and data
            itemElement.style.position = 'absolute';
            itemElement.style.width = '100%';
            itemElement.style.height = '100%';
            itemElement.style.left = '0';
            itemElement.style.top = '0';
            itemElement.style.transform = 'none';
            itemElement.dataset.slot = slot;
    
            // Reattach event listeners
            itemElement.addEventListener('contextmenu', handleEquippedItemContextMenu);
            itemElement.addEventListener('mousemove', (e) => showItemInfo(item, e));
            itemElement.addEventListener('mouseout', hideItemInfo);
        }
    
        console.log("Equipped item. Updated character state:", characterState);
    
        // Mark equipment bonuses as needing recalculation
        characterState.equipmentBonusesCalculated = false;


    
    }
    
    
    
    function unequipItem(itemElement, addToInventory = true) {
        if (!itemElement) {
            console.error('unequipItem: itemElement not found');
            return;
        }
    
        const itemId = parseInt(itemElement.dataset.itemId);
        const item = items.find(i => i.id === itemId);
    
        if (item) {
            // Remove item from gear slot
            const gearSlot = itemElement.parentElement;
            if (gearSlot && gearSlot.classList.contains('gear-slot')) {
                gearSlot.removeChild(itemElement);
            }
    
            // Add item back to inventory grid
            if (addToInventory) {
                // Reset item size to original dimensions
                const originalWidth = parseInt(itemElement.dataset.originalWidth);
                const originalHeight = parseInt(itemElement.dataset.originalHeight);
    
                // Reset item properties to match addItemToInventory pattern
                itemElement.style.position = 'absolute';
                itemElement.style.width = `${originalWidth * 42 - 2}px`;
                itemElement.style.height = `${originalHeight * 42 - 2}px`;
                itemElement.dataset.rotation = '0';
                itemElement.style.transform = 'none';
    
                // Reset the image element
                const imgElement = itemElement.querySelector('.item-image');
                if (imgElement) {
                    imgElement.style.width = '100%';
                    imgElement.style.height = '100%';
                    imgElement.style.objectFit = 'fill';
                    imgElement.style.position = 'absolute';
                    imgElement.style.top = '0';
                    imgElement.style.left = '0';
                    imgElement.style.transform = 'none';
                }
    
                // Reset dimensions in dataset
                itemElement.dataset.width = originalWidth;
                itemElement.dataset.height = originalHeight;
    
                // Find an available slot
                const itemSize = {
                    width: originalWidth,
                    height: originalHeight
                };
                
                const availableSlot = findAvailableSlot(itemSize, itemElement.dataset.instanceId);
                if (availableSlot) {
                    placeItemInGrid(itemElement, availableSlot.x, availableSlot.y);
                    const inventoryGrid = document.getElementById('inventoryGrid');
                    inventoryGrid.appendChild(itemElement);
                    makeItemDraggable(itemElement);
                } else {
                    alert('Not enough space in the inventory!');
                    return;
                }
            }
    
            // Get the slot the item was in
            const slot = itemElement.dataset.slot;
    
            // Remove the item from character equipment
            if (slot && characterState.equipment && characterState.equipment.hasOwnProperty(slot)) {
                characterState.equipment[slot] = null;
            }
    
            // Handle two-handed weapons
            if (item.twoHanded && slot === 'main-hand') {
                const offHandSlot = document.querySelector('.gear-slot[data-slot="off-hand"]');
                if (offHandSlot) {
                    offHandSlot.classList.remove('disabled');
                }
            }
    
            // Mark equipment bonuses as needing recalculation
            characterState.equipmentBonusesCalculated = false;
    
            calculateEquipmentBonuses();
            updateCharacterStats();
        } else {
            console.error('unequipItem: Item not found in items array');
        }
    }
    
    
    
    
    
    
    

    
    
    
    
    
    
    
    function equipItemToSlot(item, itemElement, slotName) {
        console.log('Attempting to equip item:', item, 'to slot:', slotName);
    
        // Ensure valid item object and slot
        if (!item || !item.id) {
            console.error('Invalid item:', item);
            return;
        }
    
        const slot = document.querySelector(`.gear-slot[data-slot="${slotName}"]`);
        if (!slot) {
            console.error('Slot not found:', slotName);
            return;
        }
    
        // Check if the slot is disabled
        if (slot.classList.contains('disabled')) {
            if (slotName === 'off-hand' && characterState.equipment['main-hand'] && characterState.equipment['main-hand'].twoHanded) {
                const twoHandedItem = characterState.equipment['main-hand'];
                console.log('A two-handed weapon is currently equipped:', twoHandedItem.name);
    
                const confirmUnequip = confirm(`Equipping "${item.name}" to the off-hand will unequip the two-handed weapon "${twoHandedItem.name}". Do you want to proceed?`);
                if (confirmUnequip) {
                    const mainHandSlot = document.querySelector('.gear-slot[data-slot="main-hand"]');
                    if (mainHandSlot) {
                        const twoHandedItemElement = mainHandSlot.querySelector('.inventory-item');
                        if (twoHandedItemElement) {
                            unequipItem(twoHandedItemElement, true);
                        }
                        mainHandSlot.classList.remove('disabled');
                    }
                    equipItemToSlot(item, itemElement, slotName); // Retry after unequipping
                    return;
                } else {
                    alert(`Cannot equip "${item.name}" to the off-hand without unequipping the two-handed weapon.`);
                    return;
                }
            } else {
                alert('Cannot equip item in this slot while it is disabled.');
                return;
            }
        }
    
        // Handle existing item in the slot
        const existingItemElement = slot.querySelector('.inventory-item');
        if (existingItemElement) {
            console.log(`Replacing existing item in slot "${slotName}" with "${item.name}".`);
            unequipItem(existingItemElement, true); // Unequip and return to inventory
        }
    
        // Remove item from inventory grid
        if (typeof removeItemFromGrid === 'function') {
            removeItemFromGrid(itemElement);
        } else {
            console.warn('removeItemFromGrid function is not defined. Skipping grid removal.');
        }
    
        // Reset rotation and dimensions to original state (if applicable)
        if (typeof resetItemElement === 'function') {
            resetItemElement(itemElement);
        } else {
            console.warn('resetItemElement function is not defined. Skipping reset.');
        }
    
        // Add the item to the equipment slot
        slot.appendChild(itemElement);
        itemElement.dataset.slot = slotName;
    
        // Reattach context menu and tooltip event listeners
        if (typeof reattachItemEventListeners === 'function') {
            reattachItemEventListeners(itemElement, item);
        } else {
            console.warn('reattachItemEventListeners function is not defined. Skipping reattachment.');
        }
    
        // Update equipment object
        characterState.equipment[slotName] = item;
    
        // Handle two-handed weapon logic
        if (item.twoHanded && slotName === 'main-hand') {
            console.log('Equipping two-handed weapon:', item.name);
            const offHandSlot = document.querySelector('.gear-slot[data-slot="off-hand"]');
            if (offHandSlot) {
                const offHandItem = offHandSlot.querySelector('.inventory-item');
                if (offHandItem) {
                    unequipItem(offHandItem, true);
                }
                offHandSlot.classList.add('disabled');
                characterState.equipment['off-hand'] = null;
            }
        } else if (slotName === 'main-hand') {
            const offHandSlot = document.querySelector('.gear-slot[data-slot="off-hand"]');
            if (offHandSlot) {
                offHandSlot.classList.remove('disabled');
            }
        }
    
        // Recalculate bonuses and update stats
        if (typeof calculateEquipmentBonuses === 'function') {
            characterState.equipmentBonusesCalculated = false;
            calculateEquipmentBonuses();
        } else {
            console.warn('calculateEquipmentBonuses function is not defined. Skipping bonus calculation.');
        }
    
        if (typeof updateCharacterStats === 'function') {
            updateCharacterStats();
        } else {
            console.warn('updateCharacterStats function is not defined. Skipping stats update.');
        }
    }
    
    
    // Helper: Reset item element properties
    function resetItemElement(itemElement) {
        const originalWidth = parseInt(itemElement.dataset.originalWidth);
        const originalHeight = parseInt(itemElement.dataset.originalHeight);
    
        itemElement.style.position = 'absolute';
        itemElement.style.width = '100%';
        itemElement.style.height = '100%';
        itemElement.style.left = '0';
        itemElement.style.top = '0';
        itemElement.style.transform = 'none';
        itemElement.dataset.rotation = '0';
        itemElement.dataset.width = originalWidth;
        itemElement.dataset.height = originalHeight;
    
        const imgElement = itemElement.querySelector('.item-image');
        if (imgElement) {
            imgElement.style.width = '100%';
            imgElement.style.height = '100%';
            imgElement.style.transform = 'none';
            imgElement.style.objectFit = 'cover';
        }
    }
    
    // Helper: Reattach context menu and tooltip listeners
    function reattachItemEventListeners(itemElement, item) {
        itemElement.removeEventListener('contextmenu', handleEquippedItemContextMenu);
        itemElement.removeEventListener('mousemove', (e) => showItemInfo(item, e));
        itemElement.removeEventListener('mouseout', hideItemInfo);
    
        itemElement.addEventListener('contextmenu', handleEquippedItemContextMenu);
        itemElement.addEventListener('mousemove', (e) => showItemInfo(item, e));
        itemElement.addEventListener('mouseout', hideItemInfo);
    }
    
    
    
    
    
    
    
    
    
    
    
    function showEquipOptions(item, itemElement, x, y) {
        const existingOptions = document.querySelector('.equip-options');
        if (existingOptions) existingOptions.remove();
    
        const optionsMenu = document.createElement('div');
        optionsMenu.className = 'equip-options context-menu';
        optionsMenu.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            background-color: #1a1a1a;
            border: 1px solid #333;
            border-radius: 4px;
            padding: 4px 0;
            min-width: 150px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 1001;
        `;
    
        let slots = [];
        if (item.type === 'weapon' && !item.twoHanded) {
            slots = ['main-hand', 'off-hand'];
        } else if (item.type === 'accessory' && (item.slot?.includes('ring1') || item.slot?.includes('ring'))) {
            slots = ['ring1', 'ring2'];
        } else if (Array.isArray(item.slot)) {
            slots = item.slot;
        }
    
        slots.forEach(slot => {
            const option = document.createElement('div');
            option.className = 'menu-item';
            option.textContent = slot.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
            option.style.cssText = `
                padding: 8px 16px;
                cursor: pointer;
                color: #fff;
                font-size: 14px;
            `;
    
            option.addEventListener('mouseenter', () => option.style.backgroundColor = '#333');
            option.addEventListener('mouseleave', () => option.style.backgroundColor = 'transparent');
    
            option.addEventListener('click', () => {
                const targetSlot = document.querySelector(`.gear-slot[data-slot="${slot}"]`);
                if (targetSlot) {
                    const existingItem = targetSlot.querySelector('.inventory-item');
                    if (existingItem) {
                        unequipItem(existingItem, true);
                    }
                }
    
                if (item.twoHanded && slot === 'main-hand') {
                    const offHandItem = document.querySelector('.gear-slot[data-slot="off-hand"] .inventory-item');
                    if (offHandItem) {
                        unequipItem(offHandItem, true);
                    }
                }
    
                equipItemToSlot(item, itemElement, slot);
                optionsMenu.remove();
                const contextMenu = document.getElementById('contextMenu');
                if (contextMenu) contextMenu.style.display = 'none';
    
                calculateEquipmentBonuses();
                updateCharacterStats();
            });
    
            optionsMenu.appendChild(option);
        });
    
        document.body.appendChild(optionsMenu);
    
        const rect = optionsMenu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            optionsMenu.style.left = `${window.innerWidth - rect.width - 10}px`;
        }
        if (rect.bottom > window.innerHeight) {
            optionsMenu.style.top = `${window.innerHeight - rect.height - 10}px`;
        }
    
        document.addEventListener('click', function closeMenu(e) {
            if (!optionsMenu.contains(e.target)) {
                optionsMenu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }
    
    


    



// Item Library //

function handleItemLibraryClick(e) {
    const itemElement = e.target.closest('.library-item');
    if (itemElement) {
        const itemId = parseInt(itemElement.dataset.itemId);
        const item = items.find(i => i.id === itemId);
        if (item) {
            addItemToInventory(item);
        }
    }
}   
function populateItemLibrary(searchQuery = '') {
    console.log('Items array:', items);
    const itemList = document.getElementById('itemList');
    itemList.innerHTML = '';

    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term !== '');

    items.forEach(item => {
        const searchableAttributes = [
            (item.name || '').toLowerCase(),
            (item.type || '').toLowerCase(),
            ...(Array.isArray(item.slot) ? item.slot.map(s => (s || '').toLowerCase()) : [(item.slot || '').toLowerCase()]),
            ...(item.stats ? Object.keys(item.stats).map(stat => (stat || '').toLowerCase()) : []),
            (item.description || '').toLowerCase(),
            item.twoHanded ? '2h' : ''
        ];

        const matches = searchTerms.every(term => 
            searchableAttributes.some(attr => attr.includes(term))
        );

        if (matches) {
            const itemElement = document.createElement('div');
            const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
            const rarity = (item.rarity && validRarities.includes(item.rarity.toLowerCase())) 
                        ? item.rarity.toLowerCase() 
                        : 'common';

            itemElement.classList.add('library-item', rarity);
            itemElement.dataset.itemId = item.id;
            itemElement.draggable = true;

            Object.assign(itemElement.dataset, {
                id: item.id,
                name: item.name || 'Unknown Item',
                type: item.type || 'other',
                rarity: rarity,
                slot: Array.isArray(item.slot) ? item.slot.join(',') : (item.slot || ''),
                size: JSON.stringify(item.size || { width: 1, height: 1 }),
                effects: JSON.stringify(item.stats || {}),
                value: item.value || 0,
                description: item.description || '',
                image: item.image || '/api/placeholder/400/320',
                twoHanded: item.twoHanded || false,
                stackable: item.stackable || false,
                stackCap: item.stackCap || 1,
                duration: item.duration || 0,
                buff: JSON.stringify(item.buff || {}),
                weaponType: item.weaponType || '',
                armorType: item.armorType || '',
                itemData: JSON.stringify({
                    ...item,
                    stats: item.stats || {},
                    effects: item.effects || {},
                    size: item.size || { width: 1, height: 1 },
                    rarity: rarity
                })
            });

            const img = document.createElement('img');
            img.src = item.image || '/api/placeholder/400/320';
            img.alt = item.name;
            img.classList.add('item-image');
            img.draggable = false;
            itemElement.appendChild(img);

            const nameSpan = document.createElement('span');
            nameSpan.textContent = item.name;
            nameSpan.classList.add('item-name');
            itemElement.appendChild(nameSpan);

            itemElement.addEventListener('dragstart', (e) => {
                e.stopPropagation();
                const transferData = {
                    itemId: parseInt(item.id),
                    isLibraryItem: true,
                    itemData: JSON.stringify({
                        ...item,
                        stats: item.stats || {},
                        effects: item.effects || {},
                        size: item.size || { width: 1, height: 1 },
                        rarity: rarity
                    })
                };
                e.dataTransfer.setData('text/plain', JSON.stringify(transferData));
                e.dataTransfer.effectAllowed = 'copy';
                e.target.style.opacity = '0.5';
            });

            itemElement.addEventListener('dragend', (e) => {
                e.target.style.opacity = '';
            });

            const showTooltipHandler = (e) => showItemInfo(itemElement, e);
            itemElement.addEventListener('mouseenter', (e) => showItemInfo(itemElement, e));
            itemElement.addEventListener('mousemove', updateTooltipPosition);
            itemElement.addEventListener('mouseleave', hideItemInfo);
            

            itemList.appendChild(itemElement);
        }
        if (!Array.isArray(items) || items.length === 0) {
            console.error('Items array is empty or not defined.');
            return;
        }
    });

    if (itemList.children.length === 0) {
        const noResultsElement = document.createElement('div');
        noResultsElement.classList.add('no-results');
        noResultsElement.textContent = 'No items found.';
        itemList.appendChild(noResultsElement);
    }
}


    function handleItemMouseMove(e) {
        const itemElement = e.target.closest('.inventory-item');
        if (itemElement) {
            const itemId = parseInt(itemElement.dataset.itemId);
            const item = items.find(i => i.id === itemId);
            if (item) {
                showItemInfo(item, e);
            }
        }
    }



    function toggleItemLibrary() {
        console.log('toggleItemLibrary called');
        const itemLibrary = document.getElementById('itemLibrary');
        const itemLibraryButton = document.getElementById('itemLibraryButton');
    
        if (!itemLibrary) {
            console.error('Item Library element not found');
            return;
        }
    
        // Close other popups
        document.querySelectorAll('.popup').forEach(popup => {
            if (popup.id !== 'itemLibrary') {
                popup.style.display = 'none';
                popup.classList.remove('visible');
            }
        });
    
        // Toggle visibility - check both display and visible class
        const isVisible = itemLibrary.style.display === 'block' || itemLibrary.classList.contains('visible');
        if (isVisible) {
            itemLibrary.style.display = 'none';
            itemLibrary.classList.remove('visible');
        } else {
            itemLibrary.style.display = 'block';
            itemLibrary.classList.add('visible');
    
            // Ensure the item library has position fixed
            const computedStyle = getComputedStyle(itemLibrary);
            if (computedStyle.position !== 'absolute' && computedStyle.position !== 'fixed') {
                itemLibrary.style.position = 'fixed';
            }
    
            // Initialize data-x and data-y
            const rect = itemLibrary.getBoundingClientRect();
            const left = rect.left;
            const top = rect.top;
    
            itemLibrary.dataset.x = left;
            itemLibrary.dataset.y = top;
    
            // Set left and top styles if not already set
            if (!itemLibrary.style.left) {
                itemLibrary.style.left = `${left}px`;
            }
            if (!itemLibrary.style.top) {
                itemLibrary.style.top = `${top}px`;
            }
        }
    
        // Update button state
        if (itemLibraryButton) {
            itemLibraryButton.classList.toggle('active-button', !isVisible);
        }
    }
    
    

function clearInventory() {
        if (confirm('Are you sure you want to clear your inventory? This action cannot be undone.')) {
            const inventoryGrid = document.getElementById('inventoryGrid');
            const inventoryItems = inventoryGrid.querySelectorAll('.inventory-item');
            
            inventoryItems.forEach(item => {
                removeItemFromInventory(item);
            });

            // Clear all occupied data from inventory tiles
            const inventoryTiles = inventoryGrid.querySelectorAll('.inventory-tile');
            inventoryTiles.forEach(tile => {
                tile.dataset.occupied = '';
            });

            console.log('Inventory cleared');
        }
}

// Drag & Drop //
document.querySelectorAll('.inventory-item').forEach(item => {
    item.addEventListener('dragstart', (e) => {
    isDraggingItem = true; // Set flag when starting to drag an item
    e.stopPropagation(); // Prevent window dragging
    });
    
    item.addEventListener('dragend', () => {
    isDraggingItem = false; // Reset flag after drag ends
    });
});
function makeItemDraggable(itemElement) {
    itemElement.draggable = true;

    // Remove existing listeners to prevent duplication
    itemElement.removeEventListener('dragstart', dragStart);
    itemElement.removeEventListener('drag', handleInventoryDrag);
    itemElement.removeEventListener('dragend', dragEnd);

    // Attach event listeners
    itemElement.addEventListener('dragstart', dragStart);
    itemElement.addEventListener('drag', handleInventoryDrag);
    itemElement.addEventListener('dragend', dragEnd);
}

function handleInventoryDrag(e) {
    e.preventDefault();
    const inventoryGrid = document.getElementById('inventoryGrid');
    const gridOverlay = document.getElementById('grid-overlay');
    
    // Handle drag over grid overlay
    if (e.target.closest('#grid-overlay')) {
        removeHighlight();
        const rect = gridOverlay.getBoundingClientRect();
        const scale = characterState.scale || 1;
        const gridScale = characterState.gridScale || 40;
        
        const gridX = Math.floor((e.clientX - rect.left) / (gridScale * scale));
        const gridY = Math.floor((e.clientY - rect.top) / (gridScale * scale));
        
        const highlight = document.createElement('div');
        highlight.classList.add('tile-highlight');
        highlight.style.left = `${gridX * gridScale}px`;
        highlight.style.top = `${gridY * gridScale}px`;
        highlight.style.width = `${gridScale}px`;
        highlight.style.height = `${gridScale}px`;
        gridOverlay.appendChild(highlight);
        return;
    }

    // Original inventory drag logic
    if (!inventoryGrid) return;
    
    const rect = inventoryGrid.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const x = Math.floor(mouseX / 42);
    const y = Math.floor(mouseY / 42);
    
    const draggedItem = e.target;
    const rotation = parseInt(draggedItem.dataset.rotation) || 0;
    const originalWidth = parseInt(draggedItem.dataset.originalWidth);
    const originalHeight = parseInt(draggedItem.dataset.originalHeight);
    const itemSize = rotation === 0 ? { width: originalWidth, height: originalHeight } : { width: originalHeight, height: originalWidth };

    if (isSlotAvailable(x, y, itemSize, draggedItem.dataset.instanceId)) {
        highlightDropZone(x, y, itemSize);
    } else {
        removeHighlight();
    }
}
function dragStart(e) {
    e.stopPropagation();

    const itemElement = e.target.closest('.inventory-item');
    if (!itemElement) return;

    const itemId = parseInt(itemElement.dataset.itemId);
    const instanceId = itemElement.dataset.instanceId;
    const itemData = itemElement.dataset.itemData;

    // Create data object similar to library items but with inventory flag
    const transferData = {
        itemId: itemId,
        instanceId: instanceId,
        itemData: itemData,
        fromInventory: true,
        isLibraryItem: false
    };

    e.dataTransfer.setData('text/plain', JSON.stringify(transferData));
    e.target.style.opacity = '0.5';
    createDragImage(e);

    // Store source location if from gear slot
    const gearSlot = itemElement.closest('.gear-slot');
    if (gearSlot) {
        itemElement.dataset.fromGearSlot = gearSlot.dataset.slot;
    }
}



  
function createDragImage(e) {
    const item = e.target;
    const dragImage = item.cloneNode(true);
    dragImage.id = 'dragImage';
    
    // Get the original item dimensions
    const originalWidth = parseInt(item.dataset.originalWidth);
    const originalHeight = parseInt(item.dataset.originalHeight);
    const tileSize = 40; // Base tile size
    const sizeMultiplier = 2; // Increase this value to make the image larger
    
    // Calculate scaled dimensions while maintaining aspect ratio
    const baseScale = Math.min(tileSize / (originalWidth * tileSize), tileSize / (originalHeight * tileSize));
    const scale = baseScale * sizeMultiplier; // Apply size multiplier
    const scaledWidth = originalWidth * tileSize * scale;
    const scaledHeight = originalHeight * tileSize * scale;
    
    // Style the drag image
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px'; // Position off-screen
    dragImage.style.left = '-1000px';
    dragImage.style.width = `${scaledWidth}px`;
    dragImage.style.height = `${scaledHeight}px`;
    dragImage.style.opacity = '0.7';
    dragImage.style.pointerEvents = 'none';
    dragImage.style.border = 'none';
    dragImage.style.backgroundColor = 'transparent';
    dragImage.style.transform = 'none';
    
    // Style the item image inside the drag image
    const imgElement = dragImage.querySelector('.item-image');
    if (imgElement) {
        imgElement.style.width = '100%';
        imgElement.style.height = '100%';
        imgElement.style.transform = 'none';
        imgElement.style.objectFit = 'contain';
    }

    // Remove quantity badge
    const quantityElement = dragImage.querySelector('.item-quantity');
    if (quantityElement) {
        quantityElement.remove();
    }

    document.body.appendChild(dragImage);
    
    // Center the drag image under the cursor
    const offsetX = scaledWidth / 2;
    const offsetY = scaledHeight / 2;
    e.dataTransfer.setDragImage(dragImage, offsetX, offsetY);
    
    // Clean up
    requestAnimationFrame(() => {
        dragImage.remove();
    });
}


    function updateDraggedItemRotation(draggedItem, rotation) {
    // Update the CSS transform for the dragged item
    draggedItem.style.transform = `rotate(${rotation}deg)`;

    // Ensure correct dataset rotation
    draggedItem.dataset.rotation = rotation;

    // Adjust item dimensions if needed
    const width = parseInt(draggedItem.dataset.width);
    const height = parseInt(draggedItem.dataset.height);

    if (rotation % 180 === 0) {
        draggedItem.style.width = `${width * 42}px`;
        draggedItem.style.height = `${height * 42}px`;
    } else {
        draggedItem.style.width = `${height * 42}px`;
        draggedItem.style.height = `${width * 42}px`;
    }
    }
    function highlightDropZone(x, y, itemSize) {
        removeHighlight(); // Clear any existing highlights
        const inventoryGrid = document.getElementById('inventoryGrid');
        const tileSize = 40; // Tile width and height in pixels
        const gapSize = 2; // Gap between tiles
    
        for (let i = 0; i < itemSize.height; i++) {
            for (let j = 0; j < itemSize.width; j++) {
                const tileX = x + j;
                const tileY = y + i;
    
                // Ensure the tile is within grid bounds
                if (tileX < 0 || tileY < 0) continue;
                const tile = inventoryGrid.querySelector(`.inventory-tile[data-x="${tileX}"][data-y="${tileY}"]`);
                if (tile) {
                    const highlight = document.createElement('div');
                    highlight.classList.add('tile-highlight');
                    highlight.style.left = `${tileX * (tileSize + gapSize)}px`;
                    highlight.style.top = `${tileY * (tileSize + gapSize)}px`;
                    highlight.style.width = `${tileSize}px`;
                    highlight.style.height = `${tileSize}px`;
                    inventoryGrid.appendChild(highlight);
                }
            }
        }
    }
    
    
        function dragOver(e) {
    e.preventDefault();
        }    
        function findAvailableSlot(itemSize, currentItemId = null) {
    const inventoryGrid = document.getElementById('inventoryGrid');
    const cols = parseInt(inventoryGrid.dataset.cols);
    const rows = parseInt(inventoryGrid.dataset.rows);

    for (let y = 0; y <= rows - itemSize.height; y++) {
        for (let x = 0; x <= cols - itemSize.width; x++) {
            if (isSlotAvailable(x, y, itemSize, currentItemId)) {
                return { x, y };
            }
        }
    }

    return null;
        }
        function isSlotAvailable(x, y, itemSize, currentInstanceId = null) {
            const inventoryGrid = document.getElementById('inventoryGrid');
            const cols = parseInt(inventoryGrid.dataset.cols);
            const rows = parseInt(inventoryGrid.dataset.rows);
            const { width, height } = itemSize;
        
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < width; j++) {
                    const tileX = x + j;
                    const tileY = y + i;
                    if (tileX >= cols || tileY >= rows) {
                        return false; // Out of bounds
                    }
                    const tile = inventoryGrid.querySelector(`.inventory-tile[data-x="${tileX}"][data-y="${tileY}"]`);
                    if (!tile) {
                        return false; // Tile doesn't exist
                    }
                    const occupiedBy = tile.dataset.occupied;
                    if (occupiedBy && occupiedBy !== currentInstanceId) {
                        return false; // Tile is occupied by another item
                    }
                }
            }
            return true; // All tiles are available
        }
        
        function dragEnd(e) {
            e.preventDefault();
            e.target.style.opacity = '';
            removeDragImage();
            removeHighlight();
        }
        
        function removeDragImage() {
            const dragImage = document.getElementById('dragImage');
            if (dragImage) dragImage.remove();
        }
                    function removeItemFromGrid(itemElement) {
                    const x = parseInt(itemElement.dataset.x);
                    const y = parseInt(itemElement.dataset.y);
                    const rotation = parseInt(itemElement.dataset.rotation) || 0;
                    const originalWidth = parseInt(itemElement.dataset.originalWidth);
                    const originalHeight = parseInt(itemElement.dataset.originalHeight);
                
                    // Calculate item size based on rotation
                    const itemSize = rotation === 0 ? { width: originalWidth, height: originalHeight } : { width: originalHeight, height: originalWidth };
                
                    for (let i = 0; i < itemSize.height; i++) {
                        for (let j = 0; j < itemSize.width; j++) {
                            const tile = document.querySelector(`.inventory-tile[data-x="${x + j}"][data-y="${y + i}"]`);
                            if (tile && tile.dataset.occupied === itemElement.dataset.instanceId) {
                                delete tile.dataset.occupied;
                            }
                        }
                    }
                    }
                    function removeHighlight() {
                        const highlights = document.querySelectorAll('.tile-highlight');
                        highlights.forEach(h => h.remove());
                    }
                    
                    function drop(e) {
                        e.preventDefault(); // Prevent default browser behavior
                    
                        const gridOverlay = document.getElementById('grid-overlay');
                        const inventoryGrid = document.getElementById('inventoryGrid');
                    
                        // Debug Logging
                        console.log('Drop event triggered.');
                        console.log('Drop target:', e.target);
                        console.log('Closest grid overlay:', e.target.closest('#grid-overlay'));
                    
                        try {
                            // Get transfer data and try to parse it
                            const transferData = e.dataTransfer.getData('text/plain');
                            let parsedData;
                            try {
                                parsedData = JSON.parse(transferData);
                                console.log('Parsed transfer data:', parsedData);
                            } catch {
                                // If parsing fails, assume it's a simple instanceId string
                                parsedData = { instanceId: transferData.trim() };
                                console.log('Using simple instanceId:', parsedData);
                            }
                    
                            // Handle grid overlay drops
                            if (e.target === gridOverlay || e.target.closest('#grid-overlay')) {
                                e.stopPropagation();
                    
                                // Handle library item drops
                                if (parsedData.isLibraryItem) {
                                    console.log('Handling library item drop:', parsedData);
                                    const itemId = parsedData.itemId;
                                    const itemData = items.find(i => i.id === itemId);
                                    if (!itemData) {
                                        console.error('Library item not found:', itemId);
                                        return;
                                    }
                    
                                    // Calculate grid position
                                    const rect = gridOverlay.getBoundingClientRect();
                                    const scale = characterState.scale || 1;
                                    const gridScale = characterState.gridScale || 40;
                                    const gridX = Math.floor((e.clientX - rect.left) / (gridScale * scale));
                                    const gridY = Math.floor((e.clientY - rect.top) / (gridScale * scale));
                    
                                    console.log(`Creating loot orb at position: (${gridX}, ${gridY})`);
                    
                                    const fakeToken = document.createElement('div');
                                    fakeToken.dataset.gridX = gridX;
                                    fakeToken.dataset.gridY = gridY;
                    
                                    createLootOrb(
                                        {
                                            ...itemData,
                                            rarity: itemData.rarity || 'common'
                                        },
                                        fakeToken
                                    );
                    
                                    addLootMessage('Player', [itemData], 'create');
                                    removeHighlight();
                                    return;
                                }
                    
                                // Handle inventory item drops
                                if (parsedData.instanceId) {
                                    const draggedItem = document.querySelector(`.inventory-item[data-instance-id="${parsedData.instanceId}"]`);
                                    console.log('Dragged inventory item:', draggedItem);
                    
                                    if (draggedItem) {
                                        const confirmed = confirm('Are you sure you want to drop this item?');
                                        if (!confirmed) {
                                            console.log('User canceled the drop.');
                                            return;
                                        }
                    
                                        let itemData;
                                        try {
                                            // Handle both generator and inventory items
                                            if (parsedData.fromGenerator && parsedData.itemData) {
                                                itemData = JSON.parse(parsedData.itemData);
                                            } else {
                                                itemData = JSON.parse(draggedItem.dataset.itemData);
                                            }
                                        } catch (error) {
                                            console.error('Error parsing item data:', error);
                                            alert('Failed to retrieve item data. Drop aborted.');
                                            return;
                                        }
                    
                                        const rect = gridOverlay.getBoundingClientRect();
                                        const scale = characterState.scale || 1;
                                        const gridScale = characterState.gridScale || 40;
                                        const gridX = Math.floor((e.clientX - rect.left) / (gridScale * scale));
                                        const gridY = Math.floor((e.clientY - rect.top) / (gridScale * scale));
                    
                                        const fakeToken = document.createElement('div');
                                        fakeToken.dataset.gridX = gridX;
                                        fakeToken.dataset.gridY = gridY;
                    
                                        try {
                                            createLootOrb(
                                                {
                                                    ...itemData,
                                                    rarity: itemData.rarity || 'common'
                                                },
                                                fakeToken
                                            );
                                            console.log('Loot orb created successfully.');
                                        } catch (error) {
                                            console.error('Error creating loot orb:', error);
                                            alert('Failed to create loot orb.');
                                            return;
                                        }
                    
                                        try {
                                            removeItemFromInventory(draggedItem);
                                            console.log('Item removed from inventory.');
                                        } catch (error) {
                                            console.error('Error removing item from inventory:', error);
                                            alert('Failed to remove item from inventory.');
                                        }
                    
                                        try {
                                            addLootMessage('Player', [itemData], 'create');
                                            console.log('Loot message added.');
                                        } catch (error) {
                                            console.error('Error adding loot message:', error);
                                        }
                    
                                        removeHighlight();
                                        updateEncumbranceStatus();
                                        return;
                                    }
                                    return;
                                }
                            }
                    
                            // Handle inventory grid drops
                            const draggedItem = document.querySelector(`.inventory-item[data-instance-id="${parsedData.instanceId}"]`);
                            const targetItem = e.target.closest('.inventory-item');
                    
                            if (draggedItem) {
                                let draggedItemData;
                                try {
                                    if (parsedData.fromGenerator && parsedData.itemData) {
                                        draggedItemData = JSON.parse(parsedData.itemData);
                                    } else {
                                        const itemId = parseInt(draggedItem.dataset.itemId);
                                        draggedItemData = window.items.find(i => i.id === itemId);
                                    }
                                } catch (error) {
                                    console.error('Error getting dragged item data:', error);
                                    return;
                                }
                    
                                const rotation = parseInt(draggedItem.dataset.rotation) || 0;
                                const width = parseInt(draggedItem.dataset.width);
                                const height = parseInt(draggedItem.dataset.height);
                                const itemSize = { width, height };
                    
                                const rect = inventoryGrid.getBoundingClientRect();
                                const mouseX = e.clientX - rect.left;
                                const mouseY = e.clientY - rect.top;
                                const x = Math.floor(mouseX / 42);
                                const y = Math.floor(mouseY / 42);
                    
                                console.log(`Calculated inventory grid position: (${x}, ${y})`);
                    
                                if (targetItem && targetItem !== draggedItem) {
                                    // Handle stacking and swapping
                                    const targetItemId = parseInt(targetItem.dataset.itemId);
                                    const targetItemData = window.items.find(i => i.id === targetItemId);
                    
                                    if (draggedItemData.id === targetItemData.id && draggedItemData.stackable) {
                                        // Stack items if they are the same type and stackable
                                        const draggedQuantity = parseInt(draggedItem.dataset.quantity) || 1;
                                        const targetQuantity = parseInt(targetItem.dataset.quantity) || 1;
                                        const totalQuantity = draggedQuantity + targetQuantity;
                                        const maxStack = draggedItemData.stackCap || 5;
                    
                                        console.log(`Attempting to stack items. Dragged Quantity: ${draggedQuantity}, Target Quantity: ${targetQuantity}, Total: ${totalQuantity}, Max Stack: ${maxStack}`);
                    
                                        if (totalQuantity <= maxStack) {
                                            targetItem.dataset.quantity = totalQuantity.toString();
                                            const targetQuantityElement = targetItem.querySelector('.item-quantity');
                                            if (targetQuantityElement) {
                                                targetQuantityElement.textContent = totalQuantity.toString();
                                            }
                                            removeItemFromInventory(draggedItem);
                                            console.log('Items stacked successfully.');
                                        } else {
                                            targetItem.dataset.quantity = maxStack.toString();
                                            const targetQuantityElement = targetItem.querySelector('.item-quantity');
                                            if (targetQuantityElement) {
                                                targetQuantityElement.textContent = maxStack.toString();
                                            }
                                            draggedItem.dataset.quantity = (totalQuantity - maxStack).toString();
                                            const draggedQuantityElement = draggedItem.querySelector('.item-quantity');
                                            if (draggedQuantityElement) {
                                                draggedQuantityElement.textContent = (totalQuantity - maxStack).toString();
                                            }
                                            placeItemInGrid(draggedItem, parseInt(draggedItem.dataset.x), parseInt(draggedItem.dataset.y));
                                            console.log('Items stacked partially due to max stack limit. Remaining quantity kept in original position.');
                                        }
                                    } else {
                                        // Swap items if they are different
                                        const draggedX = parseInt(draggedItem.dataset.x);
                                        const draggedY = parseInt(draggedItem.dataset.y);
                                        const targetX = parseInt(targetItem.dataset.x);
                                        const targetY = parseInt(targetItem.dataset.y);
                    
                                        console.log(`Attempting to swap items between (${draggedX}, ${draggedY}) and (${targetX}, ${targetY})`);
                    
                                        removeItemFromGrid(draggedItem);
                                        removeItemFromGrid(targetItem);
                    
                                        if (
                                            isSlotAvailable(targetX, targetY, itemSize, draggedItem.dataset.instanceId) &&
                                            isSlotAvailable(draggedX, draggedY, { width: parseInt(targetItem.dataset.width), height: parseInt(targetItem.dataset.height) }, targetItem.dataset.instanceId)
                                        ) {
                                            placeItemInGrid(draggedItem, targetX, targetY);
                                            placeItemInGrid(targetItem, draggedX, draggedY);
                                            console.log('Items swapped successfully.');
                                        } else {
                                            // Revert to original positions if swap not possible
                                            placeItemInGrid(draggedItem, draggedX, draggedY);
                                            placeItemInGrid(targetItem, targetX, targetY);
                                            alert('Cannot swap items due to space constraints.');
                                            console.warn('Item swap failed due to space constraints.');
                                        }
                                    }
                                } else {
                                    // Handle moving item to a new slot within inventory
                                    if (isSlotAvailable(x, y, itemSize, draggedItem.dataset.instanceId)) {
                                        removeItemFromGrid(draggedItem);
                                        placeItemInGrid(draggedItem, x, y);
                                        console.log('Item moved to new slot successfully.');
                                    } else {
                                        // If no valid slot, revert back to original position
                                        const originalX = parseInt(draggedItem.dataset.x);
                                        const originalY = parseInt(draggedItem.dataset.y);
                                        placeItemInGrid(draggedItem, originalX, originalY);
                                        alert('No valid slot available for the item placement.');
                                        console.warn('Item placement failed due to no available slot.');
                                    }
                                }
                    
                                // Cleanup after drop
                                removeHighlight();
                                updateEncumbranceStatus();
                            }
                        } catch (error) {
                            console.error('Error in drop handler:', error);
                            removeHighlight();
                            updateEncumbranceStatus();
                        }
                    }
                    
                    
                    
                    function placeItemInGrid(itemElement, x, y) {
                        const width = parseInt(itemElement.dataset.width);
                        const height = parseInt(itemElement.dataset.height);
                        const tileSize = 40;
                        const gapSize = 2;
                        const totalSize = tileSize + gapSize;
                    
                        // Position the item
                        itemElement.style.position = 'absolute';
                        itemElement.style.left = `${x * totalSize}px`;
                        itemElement.style.top = `${y * totalSize}px`;
                    
                        // Update position data
                        itemElement.dataset.x = x;
                        itemElement.dataset.y = y;
                    
                        // Clear any previous occupation by this item
                        const inventoryGrid = document.getElementById('inventoryGrid');
                        inventoryGrid.querySelectorAll('.inventory-tile').forEach(tile => {
                            if (tile.dataset.occupied === itemElement.dataset.instanceId) {
                                delete tile.dataset.occupied;
                            }
                        });
                    
                        // Mark new tiles as occupied
                        for (let i = 0; i < height; i++) {
                            for (let j = 0; j < width; j++) {
                                const tile = inventoryGrid.querySelector(`.inventory-tile[data-x="${x + j}"][data-y="${y + i}"]`);
                                if (tile) {
                                    tile.dataset.occupied = itemElement.dataset.instanceId;
                                }
                            }
                        }
                    }


const inventoryObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
                if (node.classList?.contains('inventory-item') && 
                    node.dataset?.type === 'consumable') {
                    initializeConsumableDragging();
                }
            });
        }
    });
});

// Start observing the inventory grid
const inventoryGrid = document.getElementById('inventoryGrid');
if (inventoryGrid) {
    inventoryObserver.observe(inventoryGrid, { 
        childList: true,
        subtree: true 
    });
}

function handleGridDrop(e) {
    e.preventDefault();
    removeHighlight();
 
    try {
        const dataTransferContent = e.dataTransfer.getData('text/plain');
        console.log('Data received on drop:', dataTransferContent);
        const transferData = JSON.parse(dataTransferContent);
 
        const rect = e.currentTarget.getBoundingClientRect();
        const scale = characterState.scale || 1;
        const gridScale = characterState.gridScale || 40;
        const gridX = Math.floor((e.clientX - rect.left) / (gridScale * scale));
        const gridY = Math.floor((e.clientY - rect.top) / (gridScale * scale));
 
        if (transferData.isLibraryItem) {
            const itemData = items.find(i => i.id === transferData.itemId);
            if (!itemData) {
                console.error('Library item not found:', transferData.itemId);
                return;
            }
 
            const completeItemData = {
                ...itemData,
                id: itemData.id || `item-${Date.now()}`,
                instanceId: `instance-${Date.now()}`,
                name: itemData.name || 'Unknown Item',
                description: itemData.description || '',
                rarity: itemData.rarity || 'common',
                type: itemData.type || '',
                slot: Array.isArray(itemData.slot) ? itemData.slot : (itemData.slot || '').split(',').filter(Boolean),
                weaponCategory: itemData.weaponCategory || '',
                weaponType: itemData.weaponType || '',
                weaponSubtype: itemData.weaponSubtype || '',
                armorType: itemData.armorType || '',
                armorMaterial: itemData.armorMaterial || '',
                damageDice: itemData.damageDice || '',
                stats: itemData.stats || {},
                effects: itemData.effects || itemData.stats || {},
                valueGold: parseInt(itemData.valueGold) || 0,
                valueSilver: parseInt(itemData.valueSilver) || 0,
                valueCopper: parseInt(itemData.valueCopper) || 0,
                image: itemData.image || '/api/placeholder/400/320',
                size: itemData.size || { width: 1, height: 1 },
                duration: parseInt(itemData.duration) || 0,
                stackable: Boolean(itemData.stackable),
                stackCap: parseInt(itemData.stackCap) || 5,
                offHanded: Boolean(itemData.offHanded),
                twoHanded: Boolean(itemData.twoHanded),
                level: parseInt(itemData.level) || 1,
                requiredLevel: parseInt(itemData.requiredLevel) || 1
            };
 
            createLootOrb(completeItemData, null, e);
            addLootMessage('Player', [itemData], 'create');
 
        } else if (transferData.fromInventory) {
            const draggedItem = document.querySelector(`.inventory-item[data-instance-id="${transferData.instanceId}"]`);
            if (!draggedItem) return;
 
            const confirmed = confirm('Are you sure you want to drop this item?');
            if (!confirmed) return;
 
            const completeItemData = {
                id: draggedItem.dataset.itemId || `item-${Date.now()}`,
                instanceId: draggedItem.dataset.instanceId || `instance-${Date.now()}`,
                name: draggedItem.dataset.name || 'Unknown Item',
                description: draggedItem.dataset.description || '',
                rarity: draggedItem.dataset.rarity || 'common',
                type: draggedItem.dataset.type || '',
                slot: (draggedItem.dataset.slot || '').split(',').filter(Boolean),
                weaponCategory: draggedItem.dataset.weaponCategory || '',
                weaponType: draggedItem.dataset.weaponType || '',
                weaponSubtype: draggedItem.dataset.weaponSubtype || '', 
                armorType: draggedItem.dataset.armorType || '',
                armorMaterial: draggedItem.dataset.armorMaterial || '',
                damageDice: draggedItem.dataset.damageDice || '',
                effects: JSON.parse(draggedItem.dataset.effects || '{}'),
                stats: JSON.parse(draggedItem.dataset.effects || '{}'),
                valueGold: parseInt(draggedItem.dataset.valueGold) || 0,
                valueSilver: parseInt(draggedItem.dataset.valueSilver) || 0,
                valueCopper: parseInt(draggedItem.dataset.valueCopper) || 0,
                image: draggedItem.dataset.image || '/api/placeholder/400/320',
                size: JSON.parse(draggedItem.dataset.size || '{"width":1,"height":1}'),
                duration: parseInt(draggedItem.dataset.duration) || 0,
                stackable: draggedItem.dataset.stackable === 'true',
                stackCap: parseInt(draggedItem.dataset.stackCap) || 5,
                offHanded: draggedItem.dataset.offHanded === 'true',
                twoHanded: draggedItem.dataset.twoHanded === 'true',
                level: parseInt(draggedItem.dataset.level) || 1,
                requiredLevel: parseInt(draggedItem.dataset.requiredLevel) || 1
            };
 
            createLootOrb(completeItemData, null, e);
            removeItemFromInventory(draggedItem);
            addLootMessage('Player', [completeItemData], 'create');
            updateEncumbranceStatus();
        }
 
    } catch (error) {
        console.error('Error in handleGridDrop:', error);
    }
 }




function checkItemExists(instanceId) {
        return inventory.some(item => item.instanceId.toString() === instanceId);
    }

    function checkActionBarItems() {
        const actionSlots = document.querySelectorAll('.action-slot[data-action-type="consumable"]');
        actionSlots.forEach(slot => {
            const spellId = slot.dataset.spellId;
            if (spellId && spellId.startsWith('consumable-')) {
                const instanceId = spellId.replace('consumable-', '');
                if (!checkItemExists(instanceId)) {
                    // Remove from action bar
                    slot.innerHTML = `<img src="path/to/empty-slot.png" alt="Empty Slot">`;
                    delete slot.dataset.actionType;
                    delete slot.dataset.spellId;
                    delete slot.dataset.actionName;
                }
            }
        });
    }
    
    // Add periodic check for cleanup
    setInterval(checkActionBarItems, 1000);

// Example loot function
function lootCurrency(currencyLoot) {
    addCurrency('gold', currencyLoot.gold || 0);
    addCurrency('silver', currencyLoot.silver || 0);
    addCurrency('copper', currencyLoot.copper || 0);
}

// Example purchase function
function purchaseItem(itemCost) {
    // itemCost is an object like { gold: 1, silver: 50, copper: 75 }
    const totalCopperCost = (itemCost.gold || 0) * 10000 + (itemCost.silver || 0) * 100 + (itemCost.copper || 0);

    const playerTotalCopper = characterState.currency.gold * 10000 +
                              characterState.currency.silver * 100 +
                              characterState.currency.copper;

    if (playerTotalCopper >= totalCopperCost) {
        // Spend the currency
        spendCurrency('gold', itemCost.gold || 0);
        spendCurrency('silver', itemCost.silver || 0);
        spendCurrency('copper', itemCost.copper || 0);

        // Add item to inventory
        addItemToInventory(purchasedItem);
    } else {
        alert('Not enough currency to purchase this item.');
    }
}

function promptCurrencyAmountToDrop() {
    const totalGold = characterState.currency.gold;
    const totalSilver = characterState.currency.silver;
    const totalCopper = characterState.currency.copper;

    const promptText = `Enter the amount of currency to drop (e.g., "2g 20s 15c"). You have ${totalGold}g ${totalSilver}s ${totalCopper}c.`;
    const input = prompt(promptText);

    if (input) {
        const amountToDrop = parseCurrencyInput(input);
        if (amountToDrop) {
            const canDrop = checkIfCanDropCurrency(amountToDrop);
            if (canDrop) {
                // Spend the currency
                spendCurrency('gold', amountToDrop.gold || 0);
                spendCurrency('silver', amountToDrop.silver || 0);
                spendCurrency('copper', amountToDrop.copper || 0);
                renderCurrency();

                // Start a drag operation with the currency item
                const currencyItem = {
                    id: `currency-${Date.now()}`,
                    name: 'Coins',
                    type: 'currency',
                    amount: {
                        gold: gold,
                        silver: silver,
                        copper: copper
                    },
                    description: 'A pile of coins.', // Added description
                    image: 'images/icons/currency-bag.png',
                    rarity: 'common',
                    size: { width: 1, height: 1 }
                };

                startCurrencyDrag(currencyItem);
            } else {
                alert('You do not have enough currency to drop that amount.');
            }
        } else {
            alert('Invalid input. Please enter the amount in the format "2g 20s 15c".');
        }
    }
}

function startCurrencyDrag(currencyItem) {
    const dragImage = document.createElement('img');
    dragImage.src = currencyItem.image;
    dragImage.style.width = '40px';
    dragImage.style.height = '40px';
    dragImage.style.position = 'absolute';
    dragImage.style.pointerEvents = 'none';
    dragImage.style.zIndex = '1000';
    document.body.appendChild(dragImage);

    const onMouseMove = (e) => {
        dragImage.style.left = `${e.pageX - 20}px`;
        dragImage.style.top = `${e.pageY - 20}px`;
    };

    const onMouseUp = (e) => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        dragImage.remove();

        // Determine drop location
        const gridOverlay = document.getElementById('grid-overlay');
        const rect = gridOverlay.getBoundingClientRect();
        const scale = characterState.scale || 1;
        const gridScale = characterState.gridScale || 40;
        const gridX = Math.floor((e.clientX - rect.left) / (gridScale * scale));
        const gridY = Math.floor((e.clientY - rect.top) / (gridScale * scale));

        const fakeToken = document.createElement('div');
        fakeToken.dataset.gridX = gridX;
        fakeToken.dataset.gridY = gridY;

        createLootOrb(
            {
                ...currencyItem
            },
            fakeToken
        );

        addLootMessage('Player', [currencyItem], 'create');
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

    
// Initialize when document loads
document.addEventListener('DOMContentLoaded', () => {
    initializeConsumableDragging();

    // Observe inventory changes to update draggable items
    const inventoryObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            const addedNodes = Array.from(mutation.addedNodes);
            const consumables = addedNodes.filter(node => 
                node.classList?.contains('inventory-item') && 
                node.dataset?.type === 'consumable'
            );
            
            if (consumables.length > 0) {
                initializeConsumableDragging();
            }
        }
    });

    const inventoryGrid = document.getElementById('inventoryGrid');
    if (inventoryGrid) {
        inventoryObserver.observe(inventoryGrid, { 
            childList: true, 
            subtree: true 
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const itemLibraryButton = document.getElementById('itemLibraryButton');
    if (itemLibraryButton) {
        itemLibraryButton.addEventListener('click', () => {
            toggleItemLibrary();
        });
    }
});

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    generateInventoryGrid();
    populateItemLibrary();
    initializeCharacterStats();
    updateCharacterStats();
    createBuffContextMenu();
    renderCurrency();
    
   
    setInterval(updateBuffDurations, 1000);
    
    document.getElementById('itemSearch').addEventListener('input', function(e) {
        const searchQuery = e.target.value;
        populateItemLibrary(searchQuery);
    });

    // Initialize inventory array if needed
    inventory = characterState.inventory || []; // Optional: if integrating with characterState

    // Update inventory UI based on the initial inventory array
    inventory.forEach(item => {
        addItemToInventory(item);
    });

    // Calculate baseStats
    const baseStats = {
        con: parseInt(document.getElementById('conValue').value) || 10,
        str: parseInt(document.getElementById('strValue').value) || 10,
        agi: parseInt(document.getElementById('agiValue').value) || 10,
        int: parseInt(document.getElementById('intValue').value) || 10,
        spir: parseInt(document.getElementById('spirValue').value) || 10,
        cha: parseInt(document.getElementById('chaValue').value) || 10,
    };

    // Calculate equipmentBonuses
    const equipmentBonuses = calculateEquipmentBonuses();

    // Calculate totalStats
    const totalStats = {};
    for (const stat in baseStats) {
        totalStats[stat] = baseStats[stat] + (equipmentBonuses[stat] || 0);
    }

    // Now you can use totalStats
    updateStatModifiers(totalStats); // Pass totalStats as an argument
    updateDerivedStats(currentEncumbranceStatus, totalStats, equipmentBonuses);
    updateHealthBar(); // Call these functions after updating stats or when using items
    updateManaBar();

    const inventoryGrid = document.getElementById('inventoryGrid');
    inventoryGrid.addEventListener('dragover', dragOver);
    inventoryGrid.addEventListener('drop', drop);
    inventoryGrid.addEventListener('contextmenu', handleInventoryContextMenu);

    document.getElementById('clearInventoryButton').addEventListener('click', clearInventory);

    document.getElementById('itemLibraryButton').addEventListener('click', toggleItemLibrary);
    document.getElementById('itemList').addEventListener('click', handleItemLibraryClick);

    document.getElementById('contextMenu').addEventListener('click', handleContextMenuAction);

    // Add grid overlay event listeners
    const gridOverlay = document.getElementById('grid-overlay');
    if (gridOverlay) {
        gridOverlay.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            
            // Calculate grid position for highlight
            const rect = gridOverlay.getBoundingClientRect();
            const scale = characterState.scale || 1;
            const gridScale = characterState.gridScale || 40;
            const gridX = Math.floor((e.clientX - rect.left) / (gridScale * scale));
            const gridY = Math.floor((e.clientY - rect.top) / (gridScale * scale));

            // Show highlight
            removeHighlight();
            const highlight = document.createElement('div');
            highlight.classList.add('tile-highlight');
            highlight.style.left = `${gridX * gridScale}px`;
            highlight.style.top = `${gridY * gridScale}px`;
            highlight.style.width = `${gridScale}px`;
            highlight.style.height = `${gridScale}px`;
            gridOverlay.appendChild(highlight);
        });

        gridOverlay.addEventListener('dragleave', removeHighlight);
        gridOverlay.addEventListener('drop', handleGridDrop);
    }

    // Add the event listener for the Generate Currency button
// Add the event listener for the Generate Currency button
const generateCurrencyButton = document.getElementById('generateCurrencyButton');
if (generateCurrencyButton) {
    generateCurrencyButton.addEventListener('click', function() {
        const gold = parseInt(document.getElementById('currencyGold').value) || 0;
        const silver = parseInt(document.getElementById('currencySilver').value) || 0;
        const copper = parseInt(document.getElementById('currencyCopper').value) || 0;

        if (gold === 0 && silver === 0 && copper === 0) {
            alert('Please enter an amount of currency to create.');
            return;
        }

// Example of adding a description to a currency item
const currencyItem = {
    id: `currency-${Date.now()}`,
    name: 'Coins',
    type: 'currency',
    amount: {
        gold: gold,
        silver: silver,
        copper: copper
    },
    description: 'A pile of coins.', // Added description
    image: 'images/icons/currency-bag.png',
    rarity: 'common',
    size: { width: 1, height: 1 }
};


        // Start a drag operation with the currency item
        startCurrencyDrag(currencyItem);
    });
}



});



document.addEventListener('DOMContentLoaded', () => {
    const itemLibrary = document.getElementById('itemLibrary');
    let isLibraryVisible = false;

    // Handle item library visibility
    const toggleItemLibrary = () => {
        isLibraryVisible = !isLibraryVisible;
        if (itemLibrary) {
            itemLibrary.style.display = isLibraryVisible ? 'block' : 'none';
            
            // Close other popups when opening item library
            if (isLibraryVisible) {
                document.querySelectorAll('.popup').forEach(popup => {
                    if (popup !== itemLibrary) {
                        popup.style.display = 'none';
                    }
                });
            }
        }
    };

    // Handle bag button clicks
    document.querySelector('.nav-button[title="Bag"]')?.addEventListener('click', () => {
        const inventoryPopup = document.getElementById('inventoryPopup');
        if (inventoryPopup) {
            if (inventoryPopup.style.display === 'block') {
                inventoryPopup.style.display = 'none';
                document.querySelector('.nav-button[title="Bag"]')?.classList.remove('active-button');
                // Reset item library state when closing inventory
                isLibraryVisible = false;
                if (itemLibrary) {
                    itemLibrary.style.display = 'none';
                }
            } else {
                document.querySelectorAll('.popup').forEach(popup => {
                    popup.style.display = 'none';
                });
                document.querySelectorAll('.nav-button').forEach(btn => {
                    btn.classList.remove('active-button');
                });
                inventoryPopup.style.display = 'block';
                document.querySelector('.nav-button[title="Bag"]')?.classList.add('active-button');
            }
        }
    });

    // Handle item library button clicks
    document.getElementById('itemLibraryButton')?.addEventListener('click', () => {
        toggleItemLibrary();
    });

    // Add keyboard shortcut for item library
    document.addEventListener('keydown', (e) => {
        if (e.code === 'KeyI' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
            if (!document.activeElement.matches('input, textarea, [contenteditable]')) {
                e.preventDefault();
                toggleItemLibrary();
            }
        }
    });
});


