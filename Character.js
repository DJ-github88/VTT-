function debounce(func, delay) {
    let debounceTimer;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
}

const debouncedCalculateBonuses = debounce(calculateEquipmentBonuses, 100);

const RARITY_COLORS = {
    common: {
        border: '#9d9d9d',
        text: '#9d9d9d',
        glow: 'rgba(157, 157, 157, 0.2)',
        orbColor: 'rgba(157, 157, 157, 0.7)'
    },
    uncommon: {
        border: '#1eff00',
        text: '#1eff00',
        glow: 'rgba(30, 255, 0, 0.2)',
        orbColor: 'rgba(30, 255, 0, 0.7)'
    },
    rare: {
        border: '#0070dd',
        text: '#0070dd',
        glow: 'rgba(0, 112, 221, 0.2)',
        orbColor: 'rgba(0, 112, 221, 0.7)'
    },
    epic: {
        border: '#a335ee',
        text: '#a335ee',
        glow: 'rgba(163, 53, 238, 0.2)',
        orbColor: 'rgba(163, 53, 238, 0.7)'
    },
    legendary: {
        border: '#ff8000',
        text: '#ff8000',
        glow: 'rgba(255, 128, 0, 0.2)',
        orbColor: 'rgba(255, 128, 0, 0.7)'
    }
};

function calculateEquipmentBonuses() {
    // Initialize bonuses
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

    console.log("Calculating equipment bonuses. Current equipment:", characterState.equipment);

    if (characterState.equipment) {
        for (const slot in characterState.equipment) {
            const item = characterState.equipment[slot];
            if (item && item.stats) {
                for (const stat in item.stats) {
                    const mappedStat = statMapping[stat] || stat;
                    if (bonuses.hasOwnProperty(mappedStat)) {
                        bonuses[mappedStat] += item.stats[stat];
                        console.log(`Added ${item.stats[stat]} to ${mappedStat} from item in slot ${slot}`);
                    }
                }
            }
        }
    }

    console.log("Calculated equipment bonuses:", bonuses);
    return bonuses;
}

function startGif(element) {
    const img = element.querySelector('img');
    if (img) {
        img.src = element.dataset.gifSrc;
    }
}
document.querySelectorAll('.derived-stat, .stat').forEach(stat => {
    const img = stat.querySelector('.derived-stat-gif, .stat-gif');
    const iconElement = stat.querySelector('.derived-stat-icon, .stat-icon');
    const staticSrc = iconElement.getAttribute('data-static-src');
    const gifSrc = iconElement.getAttribute('data-gif-src');

    stat.addEventListener('mouseover', function() {
        if (img) img.src = gifSrc;
    });

    stat.addEventListener('mouseout', function() {
        if (img) img.src = staticSrc;
    });
    });
function stopGif(element) {
    const img = element.querySelector('img');
    if (img) {
        img.src = element.dataset.staticSrc;
    }
}

function updateCharacterStats() {
    console.log("Starting updateCharacterStats");

    // Recalculate equipment bonuses if not already done
    if (!characterState.equipmentBonusesCalculated) {
        characterState.equipmentBonuses = calculateEquipmentBonuses();
        characterState.equipmentBonusesCalculated = true;
    }

    // Recalculate temporary bonuses
    characterState.temporaryBonuses = calculateTemporaryBonuses();

    // Get base stats from the UI
    const baseStats = {};
    const stats = ['con', 'str', 'agi', 'int', 'spir', 'cha'];

    stats.forEach(stat => {
        const valueElement = document.getElementById(`${stat}Value`);
        if (valueElement) {
            const value = parseInt(valueElement.textContent.trim());
            baseStats[stat] = isNaN(value) ? 10 : value;
        } else {
            console.error(`Could not find element for ${stat}Value`);
            baseStats[stat] = 10; // Default value
        }
    });

    // Store base stats in character state
    characterState.baseStats = { ...baseStats };

    // Calculate total stats (base stats + equipment bonuses + temporary bonuses)
    characterState.totalStats = { ...baseStats };

    for (const stat in characterState.baseStats) {
        characterState.totalStats[stat] = characterState.baseStats[stat] +
            (characterState.equipmentBonuses[stat] || 0) +
            (characterState.temporaryBonuses[stat] || 0);
    }

    console.log("Total stats:", characterState.totalStats);

    // Update derived stats based on the new total stats
    updateDerivedStats(characterState.totalStats, characterState.equipmentBonuses, characterState.encumbranceStatus);

    // Update UI elements to reflect the new stat values
    for (const stat in characterState.totalStats) {
        updateStatDisplay(stat);
    }

    // Check if Strength has changed
    if (characterState.totalStats.str !== characterState.previousStrength) {
        console.log("Strength has changed, regenerating inventory grid");
        characterState.previousStrength = characterState.totalStats.str;
        regenerateInventoryGrid();
    }

    // **Modified Condition: Use characterState.currentTarget instead of undefined 'token'**
    if (characterState.currentTarget) {
        updateTargetInfo(characterState.currentTarget);
    }

    console.log("Finished updateCharacterStats");
}

    
function updateStatModifiers(totalStats) {
    const stats = ['con', 'str', 'agi', 'int', 'spir', 'cha'];

    // Update modifiers in character state and UI
    stats.forEach(stat => {
        const statValue = characterState.totalStats[stat];
        const modifier = Math.floor((statValue - 10) / 2);
        characterState[`${stat}Modifier`] = modifier;  // Store in character state for consistency

        // Update the UI to reflect the modifier
        const modifierSpan = document.getElementById(`${stat}Modifier`);
        const modifierText = (modifier >= 0 ? '+' : '') + modifier;
        if (modifierSpan) {
            modifierSpan.textContent = modifierText;
        }
    });

    // Log modifiers for debugging
    console.log("Updated Stat Modifiers:", {
        conModifier: characterState.conModifier,
        strModifier: characterState.strModifier,
        agiModifier: characterState.agiModifier,
        intModifier: characterState.intModifier,
        spirModifier: characterState.spirModifier,
        chaModifier: characterState.chaModifier,
    });

    // Update skills and other derived elements as needed
    updateSkillModifiers();
    updateEncumbranceStatus(); // Ensure totalStats is available here
}


function calculateDerivedStats(totalStats, equipmentBonuses = {}, encumbranceStatus = 'normal') {
    // Create a new object to hold derived stats
    let derivedStats = {
        maxHealth: totalStats.con * 5 + (equipmentBonuses.con || 0) + (characterState.temporaryBonuses.con || 0),
        maxMana: totalStats.int * 5 + (equipmentBonuses.int || 0) + (characterState.temporaryBonuses.int || 0),
        healthRegen: Math.floor(totalStats.con / 2) + (equipmentBonuses.healthRegen || 0) + (characterState.temporaryBonuses.healthRegen || 0),
        manaRegen: Math.floor(((totalStats.int / 2) + (totalStats.spir / 2)) / 2) + (equipmentBonuses.manaRegen || 0) + (characterState.temporaryBonuses.manaRegen || 0),
        rangedDamage: Math.floor(totalStats.agi / 2) + (equipmentBonuses.rangedDamage || 0) + (characterState.temporaryBonuses.rangedDamage || 0),
        damage: Math.floor(totalStats.str / 2) + (equipmentBonuses.damage || 0) + (characterState.temporaryBonuses.damage || 0),
        spellDamage: Math.floor(totalStats.int / 2) + (equipmentBonuses.spellDamage || 0) + (characterState.temporaryBonuses.spellDamage || 0),
        healing: Math.floor(totalStats.spir / 2) + (equipmentBonuses.healing || 0) + (characterState.temporaryBonuses.healing || 0),
        armor: Math.floor(totalStats.agi / 2) + (equipmentBonuses.armor || 0) + (characterState.temporaryBonuses.armor || 0),
        crit: Math.floor(totalStats.agi / 5) + (equipmentBonuses.crit || 0) + (characterState.temporaryBonuses.crit || 0),
        moveSpeed: 30 + (equipmentBonuses.moveSpeed || 0) + (characterState.temporaryBonuses.moveSpeed || 0),
        carryingCapacity: totalStats.str * 15 + (equipmentBonuses.carryingCapacity || 0) + (characterState.temporaryBonuses.carryingCapacity || 0)
    };

    // Apply encumbrance penalties if applicable
    if (encumbranceStatus === 'encumbered') {
        derivedStats.moveSpeed -= 10;
        derivedStats.armor -= 2;
    } else if (encumbranceStatus === 'overencumbered') {
        derivedStats.moveSpeed -= 20;
        derivedStats.armor -= 5;
    }

    // Ensure stats are not negative
    derivedStats.armor = Math.max(0, derivedStats.armor);
    derivedStats.moveSpeed = Math.max(0, derivedStats.moveSpeed);

    return derivedStats;
}





// Function to update derived stats and UI
function updateDerivedStats(totalStats, equipmentBonuses = {}, encumbranceStatus = 'normal') {
    // Store previous max and current values
    const previousMaxHealth = characterState.derivedStats.maxHealth;
    const previousMaxMana = characterState.derivedStats.maxMana;
    const previousCurrentHealth = characterState.derivedStats.currentHealth;
    const previousCurrentMana = characterState.derivedStats.currentMana;

    // Calculate the new derived stats using a clean slate
    const newDerivedStats = calculateDerivedStats(totalStats, equipmentBonuses, encumbranceStatus);

    // Calculate new currentHealth and currentMana based on the ratio of old to new max values
    const healthRatio = previousMaxHealth > 0 ? previousCurrentHealth / previousMaxHealth : 1;
    const manaRatio = previousMaxMana > 0 ? previousCurrentMana / previousMaxMana : 1;

    // Update currentHealth and currentMana proportionally
    newDerivedStats.currentHealth = Math.floor(newDerivedStats.maxHealth * healthRatio);
    newDerivedStats.currentMana = Math.floor(newDerivedStats.maxMana * manaRatio);

    // Ensure currentHealth and currentMana do not exceed new max values
    newDerivedStats.currentHealth = Math.min(newDerivedStats.currentHealth, newDerivedStats.maxHealth);
    newDerivedStats.currentMana = Math.min(newDerivedStats.currentMana, newDerivedStats.maxMana);

    // Assign the calculated derived stats to the character state
    characterState.derivedStats = newDerivedStats;

    // Log the updated derived stats for debugging
    console.log("Updated Derived Stats:", characterState.derivedStats);

    // Directly update health and mana bars
    updateHealthBar();
    updateManaBar();

    // Update the UI for derived stats
    updateDerivedStatsUI();
}





function updateDerivedStatsUI() {
    // Update derived stats display in the UI
    const derivedStatsMap = {
        healthRegen: characterState.derivedStats.healthRegen,
        manaRegen: characterState.derivedStats.manaRegen,
        rangedDamage: characterState.derivedStats.rangedDamage,
        damage: characterState.derivedStats.damage,
        spellDamage: characterState.derivedStats.spellDamage,
        healing: characterState.derivedStats.healing,
        armor: characterState.derivedStats.armor,
        crit: characterState.derivedStats.crit + '%',
        moveSpeed: characterState.derivedStats.moveSpeed,
    };

    // Update the UI for all derived stats
    for (const [key, value] of Object.entries(derivedStatsMap)) {
        const statElement = document.getElementById(key);
        if (statElement) {
            const span = statElement.querySelector('span');
            if (span) {
                span.textContent = value;
            }
        }
    }
}



  
// Skills // 
function updateSkillModifiers() {
    const skillItems = document.querySelectorAll('.skill-item');

    skillItems.forEach(skillItem => {
        const stat = skillItem.dataset.stat;

        // Ensure stat exists in totalStats
        if (!characterState.totalStats.hasOwnProperty(stat)) {
            console.error(`updateSkillModifiers: Stat ${stat} not found in characterState.totalStats`);
            return;
        }

        // Get the modifier for the associated stat from characterState
        const statModifier = Math.floor((characterState.totalStats[stat] - 10) / 2);

        // Calculate proficiency level based on filled orbs
        const orbs = skillItem.querySelectorAll('.skill-orb');
        let proficiencyLevel = 0;
        orbs.forEach(orb => {
            if (orb.classList.contains('filled')) {
                proficiencyLevel += 1;
            }
        });

        // Assuming each proficiency level adds 1 to the skill modifier
        const skillModifier = statModifier + proficiencyLevel;

        // Update skill modifier display
        const skillModifierSpan = skillItem.querySelector('.skill-modifier');
        if (skillModifierSpan) {
            skillModifierSpan.textContent = (skillModifier >= 0 ? '+' : '') + skillModifier;
        } else {
            console.error('updateSkillModifiers: Skill modifier element not found');
        }
    });
}



// Gear Slots //

function handleGearSlotDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}
function showItemInfo(itemElement, event) {
    console.log('showItemInfo called with itemElement:', itemElement);

    const itemInfo = document.getElementById('itemInfo');
    if (!itemInfo) {
        console.error('ItemInfo element not found!');
        return;
    }

    // Determine if the item has a dataset (i.e., it's an HTML element)
    const isDataset = itemElement.dataset !== undefined;
    console.log('isDataset:', isDataset);
    if (isDataset) {
        console.log('itemElement.dataset:', itemElement.dataset);
    } else {
        console.log('item object:', itemElement);
    }

    // Helper function to safely retrieve item properties
    function getItemProperty(propName, defaultValue = '') {
        let value;
        if (isDataset) {
            // Handle nested dataset structure
            if (itemElement.dataset) {
                value = itemElement.dataset[propName];
            } else if (itemElement.dataset?.dataset) {
                value = itemElement.dataset.dataset[propName];
            }
        } else if (itemElement.dataset) {
            value = itemElement.dataset[propName];
        } else {
            value = itemElement[propName];
        }
    
        // Parse JSON strings if the value looks like JSON
        if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
            try {
                return JSON.parse(value);
            } catch (e) {
                console.warn(`Failed to parse JSON for ${propName}:`, value);
            }
        }
    
        return value === undefined || value === null || value === '' || value === 'undefined' 
            ? defaultValue 
            : value;
    }

    // Extract item properties with proper data type conversions
    const rarity = getItemProperty('rarity', 'common').toLowerCase();

    // Reset classes and set new rarity class
    itemInfo.className = 'item-tooltip'; // Reset classes
    itemInfo.classList.add(rarity);
    itemInfo.classList.add('visible'); // Make tooltip visible

    const itemName = getItemProperty('name', 'Unknown Item');
    const itemType = getItemProperty('type', '').toLowerCase();
    const itemDescription = getItemProperty('description', '');
    const itemValueGold = getItemProperty('valueGold', '0');
    const itemValueSilver = getItemProperty('valueSilver', '0');
    const itemValueCopper = getItemProperty('valueCopper', '0');
    const itemDamageDice = getItemProperty('damageDice', '');
    const itemWeaponType = getItemProperty('weaponType', '');
    const itemWeaponSubtype = getItemProperty('weaponSubtype', '');
    const itemArmorMaterial = getItemProperty('armorMaterial', '');
    const itemArmorType = getItemProperty('armorType', '');
    const itemAccessoryType = getItemProperty('accessoryType', '');
    const itemSlot = getItemProperty('slot', '');
    const itemDurationStr = getItemProperty('duration', getItemProperty('consumableDuration', '0'));
    const itemDuration = parseInt(itemDurationStr, 10) || 0;
    const itemEffectsStr = getItemProperty('effects', '{}');

    // Construct the tooltip HTML
    let tooltipHTML = `<div class="item-name">${itemName}</div>`;
    
    // Add type information based on the item type
    if (itemType === 'weapon' && itemWeaponType) {
        tooltipHTML += `<div class="item-type">${capitalize(itemWeaponSubtype)} - ${capitalize(itemWeaponType)}</div>`;
        if (itemDamageDice) {
            tooltipHTML += `<div class="item-damage">Damage: ${itemDamageDice}</div>`;
        }
    } else if (itemType === 'armor' && itemArmorType) {
        tooltipHTML += `<div class="item-type">${capitalize(itemArmorType)} ${itemArmorMaterial ? `(${capitalize(itemArmorMaterial)})` : ''}</div>`;
    } else if (itemType === 'accessory' && itemAccessoryType) {
        tooltipHTML += `<div class="item-type">${capitalize(itemAccessoryType)}</div>`;
    } else if (itemType) {
        tooltipHTML += `<div class="item-type">${capitalize(itemType)}</div>`;
    }

    if (itemSlot) {
        tooltipHTML += `<div class="item-slot">Slot: ${capitalize(itemSlot)}</div>`;
    }

    if (itemDescription) {
        tooltipHTML += `<div class="item-description">${itemDescription}</div>`;
    }

    // Convert value strings to numbers and handle invalid inputs
    const gold = parseInt(itemValueGold) || 0;
    const silver = parseInt(itemValueSilver) || 0;
    const copper = parseInt(itemValueCopper) || 0;

    // Add value information if any exists
    if (gold > 0 || silver > 0 || copper > 0) {
        tooltipHTML += '<div class="item-value">Value: ';
        if (gold > 0) tooltipHTML += `${gold}g `;
        if (silver > 0) tooltipHTML += `${silver}s `;
        if (copper > 0) tooltipHTML += `${copper}c`;
        tooltipHTML += '</div>';
    }

    // Add duration for consumables
    if (itemDuration > 0) {
        tooltipHTML += `<div class="item-duration">Duration: ${itemDuration} seconds</div>`;
    }


    let itemEffects;
    try {
        itemEffects = typeof itemEffectsStr === 'object' ? 
            itemEffectsStr : 
            JSON.parse(itemEffectsStr);
        
        if (itemEffects && Object.keys(itemEffects).length > 0) {
            tooltipHTML += '<div class="item-effects">Effects:';
            for (const [effect, value] of Object.entries(itemEffects)) {
                tooltipHTML += `<br>${capitalize(effect)}: ${value}`;
            }
            tooltipHTML += '</div>';
        }
    } catch (e) {
        console.warn('Failed to parse effects:', e);
    }

    itemInfo.innerHTML = tooltipHTML;

    // Helper Functions
    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function formatStatName(statKey) {
        const statNames = {
            str: 'Strength',
            agi: 'Agility',
            con: 'Constitution',
            int: 'Intellect',
            spir: 'Spirit',
            cha: 'Charisma',
            damage: 'Physical Melee Damage',
            spellDamage: 'Spell Damage',
            rangedDamage: 'Physical Ranged Damage',
            armor: 'Armor',
            moveSpeed: 'Movement Speed',
            healthRegen: 'Health Regeneration',
            manaRegen: 'Mana Regeneration',
            restoreHealth: 'Health Restore',
            restoreMana: 'Mana Restore',
            healingPower: 'Healing Power',
            critChance: 'Crit Chance',
            increaseMaxHealth: 'Increase Max Health',
            increaseMaxMana: 'Increase Max Mana',
            carryingCapacity: 'Increased Encumbrance'
        };
        return statNames[statKey] || capitalize(statKey);
    }

    function formatDerivedStatDescription(statKey, value) {
        const descriptions = {
            spellDamage: `Increases spell damage done by spells and effects by ${value}.`,
            manaRegen: `Restores ${value} mana at the start of your turn.`,
            healthRegen: `Restores ${value} health at the start of your turn.`,
            damage: `Increases your physical melee damage by ${value}.`,
            rangedDamage: `Increases your physical ranged damage by ${value}.`,
            armor: `Increases armor by ${value}.`,
            critChance: `Increases your critical strike chance by ${value}%.`,
            healingPower: `Increases healing power by ${value}.`,
            moveSpeed: `Increases your movement speed by ${value}.`,
            increaseMaxHealth: `Increases your maximum health by ${value}.`,
            increaseMaxMana: `Increases your maximum mana by ${value}.`,
            restoreHealth: `Restores ${value} health.`,
            restoreMana: `Restores ${value} mana.`,
            carryingCapacity: `Increases your carrying capacity by ${value}.`
        };
        return descriptions[statKey] || `${formatStatName(statKey)} +${value}`;
    }

    function formatDuration(seconds) {
        seconds = parseInt(seconds, 10);
        const h = Math.floor(seconds / 3600);
        seconds -= h * 3600;
        const m = Math.floor(seconds / 60);
        seconds -= m * 60;
        const s = seconds;

        let durationStr = '';
        if (h > 0) durationStr += `${h}h `;
        if (m > 0) durationStr += `${m}m `;
        if (s > 0 || durationStr === '') durationStr += `${s}s`;
        return durationStr.trim();
    }

    function formatItemValue() {
        const gold = parseInt(itemValueGold, 10) || 0;
        const silver = parseInt(itemValueSilver, 10) || 0;
        const copper = parseInt(itemValueCopper, 10) || 0;

        const parts = [];
        if (gold > 0) parts.push(`<span class="coin gold">${gold}g</span>`);
        if (silver > 0) parts.push(`<span class="coin silver">${silver}s</span>`);
        if (copper > 0 || parts.length === 0) parts.push(`<span class="coin copper">${copper}c</span>`);

        return parts.join(' ');
    }

    // Function to build Slot and Type line with proper alignment
    function buildSlotTypeLine(displayType, slot) {
        return `
            <div class="item-slot-type">
                ${slot ? `<span class="item-slot">${capitalize(slot)}</span>` : '<span></span>'}
                ${displayType ? `<span class="item-type">${displayType}</span>` : ''}
            </div>
        `;
    }

    // Function to build the Effects section
    function buildEffectsSection(effects, type, duration) {
        const baseStatKeys = ['str', 'agi', 'con', 'int', 'spir', 'cha'];
        const statsToExclude = [];

        // Exclude 'armor' from derived stats if it's already displayed
        if ((type === 'armor' || type === 'shield') && effects.armor) {
            statsToExclude.push('armor');
        }

        const baseStats = [];
        const derivedStats = [];

        // Separate base stats and derived stats
        for (const [key, value] of Object.entries(effects)) {
            if (value !== 0 && !statsToExclude.includes(key)) {
                if (baseStatKeys.includes(key)) {
                    baseStats.push({ key, value });
                } else {
                    derivedStats.push({ key, value });
                }
            }
        }

        let effectsHTML = '';

        // Render Base Stats first
        if (baseStats.length > 0) {
            baseStats.forEach(stat => {
                const formattedValue = stat.value > 0 ? `+${stat.value}` : stat.value;
                effectsHTML += `
                    <div class="stat-line base-stat">
                        ${formattedValue} ${formatStatName(stat.key)}
                    </div>
                `;
            });
        }

        // Determine prefix based on item type and duration
        let displayPrefix = '';
        if (type === 'consumable') {
            if (duration > 0) {
                displayPrefix = `On Use for ${formatDuration(duration)}:`;
            } else {
                displayPrefix = 'On Use:';
            }
        } else {
            displayPrefix = 'On Equip:';
        }

        // Render Derived Stats under prefix
        if (derivedStats.length > 0) {
            effectsHTML += `
                <div class="effects-line">
                    <span class="effects-prefix">${displayPrefix}</span>
            `;
            derivedStats.forEach(stat => {
                let description = formatDerivedStatDescription(stat.key, stat.value);
                effectsHTML += `
                    <div class="effect-description">
                        ${description}
                    </div>
                `;
            });
            effectsHTML += `</div>`;
        }

        return effectsHTML;
    }

    // Function to build the entire tooltip content
    function buildTooltipContent() {
        let content = '';

        // Item Name
        content += `
            <div class="item-name">
                ${itemName}
            </div>
        `;

        // Determine displayType and itemSlotDisplay
        let displayType = '';
        let itemSlotDisplay = '';

        if (itemType === 'weapon') {
            displayType = capitalize(itemWeaponSubtype || itemWeaponType || 'Weapon');
            itemSlotDisplay = capitalize(itemSlot || '');
        } else if (itemType === 'armor') {
            displayType = capitalize(itemArmorMaterial || 'Armor');
            itemSlotDisplay = capitalize(itemSlot || '');
        } else if (itemType === 'shield') {
            displayType = capitalize(itemArmorType || 'Shield');
            itemSlotDisplay = 'Off-Hand';
        } else if (itemType === 'accessory') {
            displayType = capitalize(itemAccessoryType || 'Accessory');
            itemSlotDisplay = capitalize(itemSlot || '');
        } else {
            displayType = capitalize(itemType);
            itemSlotDisplay = capitalize(itemSlot || '');
        }

        // Slot and Type Line
        content += buildSlotTypeLine(displayType, itemSlotDisplay);

        // Damage Dice for weapons
        if (itemType === 'weapon' && itemDamageDice) {
            content += `
                <div class="item-damage">
                    ${itemDamageDice} Damage
                </div>
            `;
        }

        // Armor Value for armor and shields
        if ((itemType === 'armor' || itemType === 'shield') && itemEffects.armor) {
            content += `
                <div class="item-armor">
                    ${itemEffects.armor} Armor
                </div>
            `;
        }

        // Base Stats and Derived Stats
        content += buildEffectsSection(itemEffects, itemType, itemDuration);

        // Description
        if (itemDescription) {
            content += `
                <div class="item-description">
                    "${itemDescription}"
                </div>
            `;
        }

        // Sell Price
        if ((itemValueGold || itemValueSilver || itemValueCopper) && itemType !== 'currency') {
            content += `
                <div class="item-sell-price">
                    Sell Price: ${formatItemValue()}
                </div>
            `;
        }

        return content;
    }

    // Build the tooltip content
    const tooltipContent = buildTooltipContent();

    // Set the tooltip HTML
    itemInfo.innerHTML = tooltipContent;

    // Position the tooltip based on the event
    itemInfo.style.display = 'block';
    positionTooltip(event);

    // Function to position the tooltip near the cursor, avoiding overflow
    function positionTooltip(event) {
        const tooltipRect = itemInfo.getBoundingClientRect();
        let left = event.clientX + 15;
        let top = event.clientY + 15;

        // Adjust position if tooltip goes beyond the viewport
        if (left + tooltipRect.width > window.innerWidth) {
            left = event.clientX - tooltipRect.width - 15;
        }

        if (top + tooltipRect.height > window.innerHeight) {
            top = event.clientY - tooltipRect.height - 15;
        }

        // Apply the position
        itemInfo.style.left = `${left + window.scrollX}px`;
        itemInfo.style.top = `${top + window.scrollY}px`;
    }
}















function hideItemInfo() {
    const itemInfo = document.getElementById('itemInfo');
    if (itemInfo) {
        itemInfo.style.display = 'none';
    }
}








function handleGearSlotDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}



function handleGearSlotDrop(e) {
e.preventDefault();
e.currentTarget.classList.remove('drag-over');
const instanceId = e.dataTransfer.getData('text/plain');
const itemElement = document.querySelector(`.inventory-item[data-instance-id="${instanceId}"]`);
const itemId = parseInt(itemElement.dataset.itemId);
const item = items.find(i => i.id === itemId);

if (e.currentTarget.classList.contains('disabled')) {
alert('Cannot equip item in this slot while it is disabled.');
return;
}

if (item && (
(Array.isArray(item.slot) && item.slot.includes(e.currentTarget.dataset.slot)) ||
item.slot === e.currentTarget.dataset.slot
)) {
    equipItemToSlot(item, itemElement, e.currentTarget.dataset.slot);
} else {
alert('This item cannot be equipped in this slot.');
}
}




    const gearSlots = document.querySelectorAll('.gear-slot');
    const gearSlotInfo = document.querySelector('.gear-slot-info');
    const characterSheetContainer = document.getElementById('characterSheetPopup'); // Assuming this is your popup container
    
    gearSlots.forEach(slot => {
        slot.addEventListener('mouseenter', function (e) {
            const itemElement = slot.querySelector('.inventory-item');
            if (!itemElement) {
                gearSlotInfo.style.display = 'block';
                gearSlotInfo.textContent = slot.dataset.info;
                updateTooltipPosition(e);
            }
        });
    
        slot.addEventListener('mousemove', function (e) {
            const itemElement = slot.querySelector('.inventory-item');
            if (!itemElement) {
                updateTooltipPosition(e);
            }
        }); // Close mousemove event listener properly
    
        slot.addEventListener('mouseleave', function () {
            gearSlotInfo.style.display = 'none';
        }); // Close mouseleave event listener properly
    }); // Close the forEach properly
    
    
    function updateTooltipPosition(e) {
        const tooltip = document.getElementById('itemInfo');
        if (!tooltip) return;
    
        const tooltipRect = tooltip.getBoundingClientRect();
        let left = e.clientX + 15;
        let top = e.clientY + 15;
    
        // Adjust if tooltip goes beyond window bounds
        if (left + tooltipRect.width > window.innerWidth) {
            left = e.clientX - tooltipRect.width - 15;
        }
        if (top + tooltipRect.height > window.innerHeight) {
            top = e.clientY - tooltipRect.height - 15;
        }
    
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }
    
    
    
    
    
// Right-click context menu for gear slots
const slots = document.querySelectorAll('.gear-slot'); // Assuming gear slots have the class 'gear-slot'

slots.forEach(slot => {
    slot.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        const itemElement = slot.querySelector('.inventory-item');
        if (itemElement) {
            const itemId = parseInt(itemElement.dataset.itemId);
            const item = items.find(i => i.id === itemId);
            const x = e.pageX;
            const y = e.pageY;
            showContextMenu(item, x, y, true, itemElement); // Pass isEquipped = true
        }
    });
});



// Event listeners for skill orbs
const skillItems = document.querySelectorAll('.skill-item');
skillItems.forEach(skillItem => {
    const orbs = skillItem.querySelectorAll('.skill-orb');
    orbs.forEach((orb, index) => {
        orb.addEventListener('click', () => {
            // Toggle the filled state
            orb.classList.toggle('filled');
            // Remove filled class from higher orbs
            orbs.forEach((o, i) => {
                if (i > index) {
                    o.classList.remove('filled');
                }
            });
            updateSkillModifiers();
        });
    });
});

            // Make gear slots droppable
            gearSlots.forEach(slot => {
                slot.addEventListener('dragover', handleGearSlotDragOver);
                slot.addEventListener('dragleave', handleGearSlotDragLeave);
                slot.addEventListener('drop', handleGearSlotDrop);
            });


