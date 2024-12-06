// Base Menu //
document.addEventListener('DOMContentLoaded', () => {
    initializeContextMenu();
});

function initializeContextMenu() {
    // Create context menu if it doesn't exist
    let contextMenu = document.getElementById('contextMenu');
    if (!contextMenu) {
        contextMenu = document.createElement('div');
        contextMenu.id = 'contextMenu';
        contextMenu.className = 'context-menu';
        document.body.appendChild(contextMenu);
    }

    // Add global click listener to hide menu
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#contextMenu') && 
            !e.target.closest('.inventory-item') && 
            !e.target.closest('.equip-options')) {
            hideContextMenu();
            const equipOptions = document.querySelector('.equip-options');
            if (equipOptions) {
                equipOptions.remove();
            }
        }
    });
}


function showContextMenu(item, x, y, isEquipped = false, itemElement, token = null) {
    // Ensure context menu exists
    let contextMenu = document.getElementById('contextMenu');
    if (!contextMenu) {
        initializeContextMenu();
        contextMenu = document.getElementById('contextMenu');
    }

    hideContextMenu(); // Close any existing context menu
    const quantity = itemElement ? parseInt(itemElement.dataset.quantity || '0') : 0;

    // Check if item is valid
    if (!item || !item.id) {
        console.warn('Item is invalid or undefined, falling back to dataset:', itemElement.dataset);
        item = JSON.parse(itemElement.dataset.itemData || '{}');
    }
    if (!item.id) {
        console.error('Item ID is still missing after fallback:', item);
        return; // Abort context menu creation for invalid items
    }
    

    // Context menu content based on item properties
    if (item.id === 'token') {
        contextMenu.innerHTML = `
            <div class="context-menu-item" data-action="target">Target</div>
            <div class="context-menu-item" data-action="remove">Remove</div>
            <div class="context-menu-item" data-action="inspect">Inspect</div>
        `;
    } else {
        contextMenu.innerHTML = `
            ${isEquipped ? '<div class="context-menu-item" data-action="unequip">Unequip</div>' : 
              (item.type !== 'consumable' ? '<div class="context-menu-item" data-action="equip">Equip</div>' : '')}
            ${item.type === 'consumable' && !isEquipped ? '<div class="context-menu-item" data-action="use">Use</div>' : ''}
            ${item.stackable && quantity > 1 && !isEquipped ? '<div class="context-menu-item" data-action="split">Split</div>' : ''}
            <div class="context-menu-item" data-action="rotate">Rotate</div>
            <div class="context-menu-item" data-action="remove">Remove</div>
        `;
    }

    // Style and position the context menu
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.dataset.itemId = item.id;
    contextMenu.dataset.instanceId = itemElement ? itemElement.dataset.instanceId : '';
    contextMenu.dataset.isEquipped = isEquipped;

    // Remove and re-add event listeners to prevent duplicates
    const menuItems = contextMenu.querySelectorAll('.context-menu-item');
    menuItems.forEach(menuItem => {
        menuItem.replaceWith(menuItem.cloneNode(true));
    });

    // Add new event listeners
    contextMenu.querySelectorAll('.context-menu-item').forEach(menuItem => {
        menuItem.addEventListener('click', (event) => handleContextMenuAction(event, token));
    });
}


function handleContextMenuAction(e, token) {
    if (!e.target.classList.contains('context-menu-item')) return;

    e.preventDefault();
    e.stopPropagation();

    const action = e.target.dataset.action;
    const contextMenu = e.target.closest('.context-menu');
    const itemId = parseInt(contextMenu?.dataset.itemId);
    const instanceId = contextMenu?.dataset.instanceId;
    const isEquipped = contextMenu?.dataset.isEquipped === 'true';

    let itemElement;
    if (action !== 'addToken' && action !== 'inspect' && action !== 'target') {
        itemElement = isEquipped ? 
            document.querySelector(`.gear-slot .inventory-item[data-instance-id="${instanceId}"]`) :
            document.querySelector(`.inventory-grid .inventory-item[data-instance-id="${instanceId}"]`);

        if (!itemElement && ['equip', 'unequip', 'use', 'split', 'rotate', 'remove'].includes(action)) {
            console.error('handleContextMenuAction: itemElement not found for action:', action);
            hideContextMenu();
            return;
        }
    }

    let item = items.find(i => i.id === itemId) || {};
    if (!item.id && itemElement) {
    try {
        item = JSON.parse(itemElement.dataset.itemData || '{}');
    } catch (error) {
        console.error('Failed to parse item data for context menu:', error);
        return;
    }
}

    if (!item && itemElement) {
        try {
            const itemData = JSON.parse(itemElement.dataset.itemData || '{}');
            const type = itemElement.dataset.type;
            let slots;

            if (itemElement.dataset.slot) {
                slots = itemElement.dataset.slot.split(',');
            } else {
                switch(type) {
                    case 'weapon': 
                        slots = ['main-hand']; 
                        break;
                    case 'armor':
                        // Get specific armor type from dataset
                        const armorType = itemElement.dataset.armorType?.toLowerCase();
                        switch(armorType) {
                            case 'head': slots = ['head']; break;
                            case 'legs': slots = ['legs']; break;
                            case 'chest': slots = ['chest']; break;
                            case 'feet': slots = ['feet']; break;
                            case 'hands': slots = ['hands']; break;
                            case 'shoulders': slots = ['shoulders']; break;
                            case 'waist': slots = ['waist']; break;
                            case 'wrists': slots = ['wrists']; break;
                            default: slots = ['chest'];
                        }
                        break;
                    case 'accessory': 
                        slots = ['ring1']; 
                        break;
                    case 'shield':
                        slots = ['off-hand'];
                        break;
                    default: 
                        slots = [];
                }
            }

            item = {
                ...itemData,
                id: itemId,
                name: itemElement.dataset.name,
                type: type,
                slot: slots,
                stats: JSON.parse(itemElement.dataset.effects || '{}'),
                stackable: itemElement.dataset.stackable === 'true',
                rarity: itemElement.dataset.rarity,
                image: itemElement.dataset.image,
                description: itemElement.dataset.description,
                size: {
                    width: parseInt(itemElement.dataset.width),
                    height: parseInt(itemElement.dataset.height)
                },
                duration: parseInt(itemElement.dataset.duration) || 0,
                twoHanded: itemElement.dataset.twoHanded === 'true',
                stackCap: parseInt(itemElement.dataset.stackCap) || 5,
                buff: itemElement.dataset.buff ? JSON.parse(itemElement.dataset.buff) : null
            };

            console.log('Constructed item:', item);
        } catch (error) {
            console.error('Failed to parse item data:', error);
            return;
        }
    }

    switch (action) {
        case 'target':
            if (token) { 
                targetToken(token);
            } else {
                console.warn('handleContextMenuAction: No token selected to target.');
            }
            break;

        case 'remove':
            if (token && token.classList.contains('player-token')) { 
                token.remove();
            } else if (isEquipped) {
                unequipItem(itemElement, false);
            } else if (itemElement) {
                removeItemFromInventory(itemElement);
                const index = inventory.findIndex(item => 
                    item.instanceId && item.instanceId.toString() === instanceId
                );
                if (index !== -1) {
                    inventory.splice(index, 1);
                }
                console.log('Item removed from inventory:', instanceId);
            }
            break;

            case 'equip':
                console.log('Equipping item:', item);
                if (Array.isArray(item?.slot) && item.slot.length > 1) {
                    // Show equip options menu for items with multiple slots
                    showEquipOptions(item, itemElement, e.pageX, e.pageY);
                    return;
                } else if (item && item.slot?.length) {
                    equipItemToSlot(item, itemElement, item.slot[0]);
                    calculateEquipmentBonuses();
                    updateCharacterStats();
                }
                break;
            

        case 'unequip':
            if (itemElement) {
                unequipItem(itemElement);
                calculateEquipmentBonuses();
                updateCharacterStats();
            }
            break;

        case 'use':
            if (item && itemElement) {
                useItem(item, itemElement);
                if (item.type === 'consumable') {
                    if (item.duration && item.stats) {
                        const buff = {
                            name: item.name,
                            description: item.description,
                            duration: item.duration,
                            icon: item.image,
                            statChanges: { ...item.stats }
                        };
                        delete buff.statChanges.currentHealth;
                        delete buff.statChanges.currentMana;
                        if (Object.keys(buff.statChanges).length > 0) {
                            addBuff(buff, item);
                        }
                    }
                }
            }
            break;

        case 'split':
            if (item && itemElement) {
                splitItem(item, itemElement);
            }
            break;

        case 'rotate':
            if (itemElement) {
                rotateItem(itemElement);
            }
            break;

        case 'addToken':
            const characterBouble = document.getElementById('characterBouble');
            if (!characterBouble) {
                console.error('characterBouble element not found.');
                break;
            }

            const playerTokenData = {
                name: characterState.name || 'Unknown',
                maxHealth: characterState.derivedStats.maxHealth || 100,
                currentHealth: characterState.derivedStats.currentHealth || 100,
                maxMana: characterState.derivedStats.maxMana || 100,
                currentMana: characterState.derivedStats.currentMana || 100,
                portraitUrl: characterBouble.src,
                isPlayer: true,
                constitution: characterState.totalStats.con || 10,
                strength: characterState.totalStats.str || 10,
                agility: characterState.totalStats.agi || 10,
                intelligence: characterState.totalStats.int || 10,
                spirit: characterState.totalStats.spir || 10,
                charisma: characterState.totalStats.cha || 10
            };
            holdTokenOnMouse(playerTokenData.portraitUrl, characterState.lastMouseX, characterState.lastMouseY, playerTokenData);
            break;

        case 'inspect':
            if (token) {
                const isCreature = token.dataset.name && 
                                 creatureLibrary.some(creature => creature.name === token.dataset.name);
                if (isCreature) {
                    openCreatureSheet(token);
                } else {
                    openAndUpdateCharacterSheet(token);
                }
            } else {
                const tempToken = document.createElement('div');
                tempToken.className = 'token player-token';
                tempToken.dataset.name = characterState.name;
                tempToken.dataset.currentHealth = characterState.derivedStats.currentHealth;
                tempToken.dataset.maxHealth = characterState.derivedStats.maxHealth;
                tempToken.dataset.currentMana = characterState.derivedStats.currentMana;
                tempToken.dataset.maxMana = characterState.derivedStats.maxMana;
                tempToken.dataset.constitution = characterState.totalStats.con;
                tempToken.dataset.strength = characterState.totalStats.str;
                tempToken.dataset.agility = characterState.totalStats.agi;
                tempToken.dataset.intelligence = characterState.totalStats.int;
                tempToken.dataset.spirit = characterState.totalStats.spir;
                tempToken.dataset.charisma = characterState.totalStats.cha;
                tempToken.dataset.portraitUrl = document.getElementById('characterBouble')?.src;
                
                openAndUpdateCharacterSheet(tempToken);
            }
            break;

        case 'addNote':
            if (token) {
                showNotePopup(token);
            }
            break;
    }

    if (!(action === 'equip' && Array.isArray(item?.slot) && item.slot.length > 1)) {
        hideContextMenu();
    }
}

// Function to hide the context menu
function hideContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    if (contextMenu) {
        contextMenu.style.display = 'none';
    }
}

// Inventory Context Menu Handler
// Update handleInventoryContextMenu to properly handle slots
function handleInventoryContextMenu(e) {
    e.preventDefault();
    const itemElement = e.target.closest('.inventory-item');
    if (!itemElement) return;

    // Remove any existing context menus
    document.querySelectorAll('.context-menu').forEach(menu => menu.remove());

    const itemId = parseInt(itemElement.dataset.itemId);
    let item;

    // Check if item is from standard items.js
    if (!isNaN(itemId)) {
        item = items.find(i => i.id === itemId);
    }

    // If not found in items.js, build item object from dataset
    if (!item) {
        // Get type and other properties first
        const type = itemElement.dataset.type;
        const armorType = itemElement.dataset.armorType;
        const twoHanded = itemElement.dataset.twoHanded === 'true';
        const offHanded = itemElement.dataset.offHanded === 'true';

        // Determine slots based on item type and properties
        let slots;
        if (type === 'weapon') {
            if (twoHanded) {
                slots = ['main-hand'];
            } else if (offHanded) {
                slots = ['off-hand'];
            } else {
                slots = ['main-hand', 'off-hand']; // One-handed weapon can go in either hand
            }
        } else if (type === 'armor' && armorType === 'shield') {
            slots = ['off-hand'];
        } else if (type === 'accessory' && itemElement.dataset.slot?.includes('ring')) {
            slots = ['ring1', 'ring2'];
        } else if (itemElement.dataset.slot) {
            slots = itemElement.dataset.slot.split(',');
        }

        item = {
            id: itemElement.dataset.itemId,
            name: itemElement.dataset.name,
            type: type,
            slot: slots,
            stats: JSON.parse(itemElement.dataset.effects || '{}'),
            stackable: itemElement.dataset.stackable === 'true',
            stackCap: parseInt(itemElement.dataset.stackCap) || 5,
            duration: parseInt(itemElement.dataset.duration) || 0,
            rarity: itemElement.dataset.rarity,
            image: itemElement.dataset.image,
            description: itemElement.dataset.description,
            twoHanded: twoHanded,
            offHanded: offHanded,
            armorType: armorType
        };
    }

    const x = e.pageX;
    const y = e.pageY;
    showContextMenu(item, x, y, false, itemElement);
}


function closeContextMenuOutside(e) {
    const contextMenu = document.getElementById('contextMenu');
    const equipMenu = document.querySelector('.equip-options');

    if (
        !contextMenu.contains(e.target) && 
        !equipMenu?.contains(e.target) &&
        !e.target.closest('.context-menu') &&
        !e.target.closest('.equip-options')
    ) {
        hideContextMenu();
        if (equipMenu) {
            document.body.removeChild(equipMenu);
        }
    }
}

// Equip Context Menu Handler (if applicable)
function handleEquippedItemContextMenu(e) {
    e.preventDefault();
    const itemElement = e.currentTarget; // Use e.currentTarget to ensure you're getting the correct element
    const itemId = parseInt(itemElement.dataset.itemId);
    const item = items.find(i => i.id === itemId);
    if (item) {
        showContextMenu(item, e.pageX, e.pageY, true, itemElement);
    }
}



