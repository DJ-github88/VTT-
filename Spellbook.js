// spellbook.js

window.spellData = {
    general: {
        name: 'General',
        spells: {
            attack: {
                name: 'Attack',
                icon: '⚔️',
                description: 'A basic attack that deals physical damage based on Strength.',
                image: 'https://i.ibb.co/m9PZt7F/Attack.webp',
                apCost: 2,
                manaCost: 0,
                healthCost: 0,
                type: 'physical',
                range: 3,
                damage: '1d8',
                statModifier: 'strength',
                bonusDamage: 'damage',
                execute: function(source, target) {
                    const baseDamage = rollDice(this.damage);
                    const strengthMod = Math.floor((characterState.totalStats.str - 10) / 2);
                    const weaponDamage = characterState.derivedStats.damage || 0;
                    const totalDamage = baseDamage.total + strengthMod + weaponDamage;
                    
                    applyDamage(target, totalDamage);
                    addCombatMessage(`${source.dataset.name} attacks for ${totalDamage} damage! (${baseDamage.total} + ${strengthMod} STR + ${weaponDamage} wpn)`);
                    return true;
                }
            }
        }
    },
    suffering: {
        name: 'Suffering',
        spells: {
            bloodSiphon: {
                name: 'Blood Siphon',
                icon: '🩸',
                description: 'Drains life from target and heals you.',
                image: 'https://i.ibb.co/VtfyPDM/Siphon-Blood.webp',
                apCost: 2,
                manaCost: 15,
                healthCost: 5,
                type: 'spell',
                range: 3,
                damage: '2d6',
                statModifier: 'intelligence',
                bonusDamage: 'spellDamage',
                execute: function(source, target) {
                    const baseDamage = rollDice(this.damage);
                    const intMod = Math.floor((characterState.totalStats.int - 10) / 2);
                    const spellDamage = characterState.derivedStats.spellDamage || 0;
                    const totalDamage = baseDamage.total + intMod + spellDamage;

                    // Apply damage and healing
                    applyDamage(target, totalDamage);
                    window.heal(Math.floor(totalDamage / 2), source);

                    addCombatMessage(`${source.dataset.name} siphons ${totalDamage} life from ${target.dataset.name}!`);
                    updateTokenVisuals(source);
                    updateTokenVisuals(target);
                    return true;
                }
            },
            bloodPact: {
                name: 'Blood Pact',
                icon: '💉',
                description: 'Sacrifice health for increased power.',
                image: 'https://i.ibb.co/2jhDDKJ/Blood-Pact.webp',
                apCost: 2,
                manaCost: 0,
                healthCost: 20,
                type: 'buff',
                range: 0,
                execute: function(source) {
                    const buff = {
                        name: "Blood Pact",
                        description: "Increased damage and spell damage at the cost of health",
                        duration: 2000,
                        icon: this.icon,
                        statChanges: {
                            damage: 4,
                            spellDamage: 4,
                            healthRegen: -2
                        }
                    };

                    addBuff(buff, source);
                    addCombatMessage(`${source.dataset.name} enters a blood pact!`);
                    updateTokenVisuals(source);
                    return true;
                }
            }
        }
    },
    vengeance: {
        name: 'Vengeance',
        spells: {
            righteousFury: {
                name: 'Righteous Fury',
                icon: '⚡',
                description: 'Channel your pain into power. Damage increases based on missing health.',
                apCost: 2,
                manaCost: 20,
                healthCost: 0,
                type: 'spell',
                range: 2,
                damage: '2d8',
                statModifier: 'spirit',
                execute: function(source, target) {
                    const currentHealth = parseInt(source.dataset.currentHealth);
                    const maxHealth = parseInt(source.dataset.maxHealth);
                    const missingHealthPercent = 1 - (currentHealth / maxHealth);
                    
                    const baseDamage = rollDice(this.damage);
                    const spiritMod = Math.floor((characterState.totalStats.spir - 10) / 2);
                    const vengeanceBonus = Math.floor(missingHealthPercent * 20);
                    const totalDamage = baseDamage.total + spiritMod + vengeanceBonus;
                    
                    applyDamage(target, totalDamage);
                    addCombatMessage(`${source.dataset.name}'s righteous fury deals ${totalDamage} damage! (+${vengeanceBonus} from missing health)`);
                    updateTokenVisuals(source);
                    updateTokenVisuals(target);
                    return true;
                }
            },
            avengingShield: {
                name: 'Avenging Shield',
                icon: '🛡️',
                description: 'A protective barrier that returns damage to attackers.',
                apCost: 2,
                manaCost: 25,
                healthCost: 0,
                type: 'buff',
                range: 0,
                execute: function(source) {
                    const buff = {
                        name: "Avenging Shield",
                        description: "Returns damage to attackers and increases armor",
                        duration: 15,
                        icon: this.icon,
                        statChanges: {
                            armor: 5,
                            damage: 2
                        }
                    };
                    
                    addBuff(buff, source);
                    addCombatMessage(`${source.dataset.name} is surrounded by an avenging shield!`);
                    updateTokenVisuals(source);
                    return true;
                }
            }
        }
    },
    sacred: {
        name: 'Sacred',
        spells: {
            divineSmite: {
                name: 'Divine Smite',
                icon: '✨',
                description: 'A holy attack that deals bonus Spirit-based damage.',
                apCost: 2,
                manaCost: 15,
                healthCost: 0,
                type: 'spell',
                range: 4,
                damage: '2d8',
                statModifier: 'spirit',
                bonusDamage: 'spellDamage',
                execute: function(source, target) {
                    const baseDamage = rollDice(this.damage);
                    const spiritMod = Math.floor((characterState.totalStats.spir - 10) / 2);
                    const spellDamage = characterState.derivedStats.spellDamage || 0;
                    const totalDamage = baseDamage.total + spiritMod + spellDamage;
                    
                    applyDamage(target, totalDamage);
                    addCombatMessage(`${source.dataset.name} smites for ${totalDamage} holy damage!`);
                    updateTokenVisuals(source);
                    updateTokenVisuals(target);
                    return true;
                }
            },
            blessedHealing: {
                name: 'Blessed Healing',
                icon: '💖',
                description: 'Heals target based on Spirit and healing power.',
                apCost: 2,
                manaCost: 20,
                healthCost: 0,
                type: 'heal',
                range: 4,
                healing: '2d8',
                statModifier: 'spirit',
                bonusHealing: 'healing',
                execute: function(source, target) {
                    const baseHealing = rollDice(this.healing);
                    const spiritMod = Math.floor((characterState.totalStats.spir - 10) / 2);
                    const healingPower = characterState.derivedStats.healing || 0;
                    const totalHealing = baseHealing.total + spiritMod + healingPower;

                    window.heal(totalHealing, target);
                    addCombatMessage(`${source.dataset.name} heals ${target.dataset.name} for ${totalHealing}!`);
                    updateTokenVisuals(source);
                    updateTokenVisuals(target);
                    return true;
                }
            }
        }
    }
};

class Spellbook {
    constructor() {
        this.spellData = spellData;
        this.selectedTab = 'general';
        this.init();

    }

    init() {
        this.renderTabs();
        this.renderSpells();
        this.bindEvents();
    }


    renderTabs() {
        const tabsContainer = document.querySelector('.spellbook-tabs');
        if (!tabsContainer) {
            console.error('Spellbook tabs container not found!');
            return;
        }
        
        tabsContainer.innerHTML = '';
    
        Object.keys(this.spellData).forEach(tabKey => {
            const tabData = this.spellData[tabKey];
            const tabButton = document.createElement('div');
            tabButton.className = 'spellbook-tab';
            if (tabKey === this.selectedTab) {
                tabButton.classList.add('active');
            }
            tabButton.dataset.tab = tabKey;
            tabButton.textContent = tabData.name;
            tabsContainer.appendChild(tabButton);
    
            // Create content container if it doesn't exist
            let contentElement = document.getElementById(`${tabKey}Spells`);
            if (!contentElement) {
                contentElement = document.createElement('div');
                contentElement.id = `${tabKey}Spells`;
                contentElement.className = 'spellbook-content';
                document.querySelector('.spellbook-container')?.appendChild(contentElement);
            }
        });
    }

    renderSpells() {
        const spellbookContainer = document.querySelector('.spellbook-container');
        if (!spellbookContainer) {
            console.error('Spellbook container not found!');
            return;
        }
    
        Object.keys(this.spellData).forEach(tabKey => {
            const tabData = this.spellData[tabKey];
            let contentElement = document.getElementById(`${tabKey}Spells`);
            
            // Create content element if it doesn't exist
            if (!contentElement) {
                contentElement = document.createElement('div');
                contentElement.id = `${tabKey}Spells`;
                contentElement.className = 'spellbook-content';
                document.querySelector('.spellbook-container').appendChild(contentElement);
            }
    
            contentElement.innerHTML = '';
    
            Object.entries(tabData.spells).forEach(([spellId, spell]) => {
                const spellIcon = document.createElement('div');
                spellIcon.className = 'spell-icon';
                spellIcon.draggable = true;
                
                if (spell.image) {
                    spellIcon.style.backgroundImage = `url(${spell.image})`;
                } else {
                    spellIcon.textContent = spell.icon;
                }
                
                // Set all the data attributes
                Object.entries({
                    spellId: spellId,
                    name: spell.name,
                    description: spell.description,
                    apCost: spell.apCost,
                    manaCost: spell.manaCost,
                    healthCost: spell.healthCost,
                    type: spell.type,
                    range: spell.range || 0,
                    damage: spell.damage || '',
                    healing: spell.healing || '',
                    icon: spell.icon
                }).forEach(([key, value]) => {
                    spellIcon.dataset[key] = value;
                });
                
                contentElement.appendChild(spellIcon);
                this.addDragListeners(spellIcon, spell);
                
                spellIcon.addEventListener('click', () => {
                    const playerToken = document.querySelector('.token.player-token');
                    if (playerToken) this.castSpell(spellId, playerToken);
                });
            });
        });
    
        this.updateTabVisibility();
    }



    addDragListeners(spellIcon, spell) {
        spellIcon.addEventListener('dragstart', (e) => {
            spellIcon.classList.add('dragging');
            // Include the spell's image in the transfer data
            e.dataTransfer.setData('text/plain', JSON.stringify({
                id: spellIcon.dataset.spellId,
                name: spell.name,
                icon: spell.icon,
                image: spell.image, // Add this
                description: spell.description,
                apCost: spell.apCost,
                manaCost: spell.manaCost,
                healthCost: spell.healthCost,
                type: spell.type,
                range: spell.range || 0,
                damage: spell.damage || '',
                healing: spell.healing || ''
            }));
            e.dataTransfer.effectAllowed = 'copy';
        });
    
        spellIcon.addEventListener('dragend', () => {
            spellIcon.classList.remove('dragging');
        });
    }




    
    
    // Helper method to format effect descriptions
    formatEffectDescription(effect) {
        switch (effect.type) {
            case 'stun':
                return `Stuns target for ${effect.duration} turns`;
            case 'dot':
                return `Deals ${effect.damage} ${effect.damageType} damage over ${effect.duration} turns`;
            case 'debuff':
                return `Reduces ${effect.stat} by ${Math.abs(effect.amount)} for ${effect.duration} turns`;
            case 'pull':
                return `Pulls target ${effect.distance} spaces closer`;
            default:
                return `${effect.type} effect`;
        }
    }

    clearActionSlot(slot) {
        const img = slot.querySelector('img');
        if (img) {
            img.src = 'https://example.com/empty-slot.png';
            img.alt = 'Empty Slot';
        }
        
        // Clear stored spell data
        ['spellId', 'spellName', 'description', 'apCost', 'manaCost', 'healthCost'].forEach(attr => {
            delete slot.dataset[attr];
        });
    }

    switchTab(tabKey) {
        this.selectedTab = tabKey;

        // Update active tab
        document.querySelectorAll('.spellbook-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabKey);
        });

        this.updateTabVisibility();
    }

    updateTabVisibility() {
        document.querySelectorAll('.spellbook-content').forEach(content => {
            content.classList.toggle('active', content.id === `${this.selectedTab}Spells`);
        });
    }

    findSpell(spellId) {
        for (const tab of Object.values(this.spellData)) {
            if (tab.spells[spellId]) {
                return tab.spells[spellId];
            }
        }
        return null;
    }

    addSpell(spell) {
        // Initialize consumables category if needed
        if (!this.spellData.consumables) {
            this.spellData.consumables = {
                name: 'Consumables',
                spells: {}
            };
        }
        // Add the spell
        this.spellData.consumables.spells[spell.id] = spell;
    }

    getSpell(spellId) {
        // Check consumables first
        if (spellId.startsWith('consumable-')) {
            return this.spellData.consumables?.spells[spellId];
        }
        // Then check other spell categories
        return this.findSpell(spellId);
    }

    castSpell(spellId, source) {
        const spell = this.findSpell(spellId);
        if (!spell) return;

        // Check combat state
        if (!window.combatState || !window.combatState.isInCombat) {
            addCombatMessage("Must be in combat to use abilities!");
            return;
        }

        // Validate turn
        const currentTurn = window.combatState.currentRoundCombatants[window.combatState.currentTurnIndex];
        if (!currentTurn || currentTurn.element !== source) {
            addCombatMessage("Cannot use abilities outside your turn!");
            return;
        }

        // Handle different spell types
        if (spell.type === 'buff' || spell.range === 0) {
            if (this.validateAndSpendResources(source, spell)) {
                spell.execute(source, source);
            }
        } else {
            window.startAbilityTargeting(spell.name, {
                name: spell.name,
                type: spell.type,
                apCost: spell.apCost,
                range: spell.range,
                execute: (src, tgt) => {
                    if (this.validateAndSpendResources(src, spell)) {
                        return spell.execute(src, tgt);
                    }
                    return false;
                }
            }, source);
        }
    }
    
    validateAndSpendResources(source, spell) {
        const currentMana = parseInt(source.dataset.currentMana);
        const currentAP = parseInt(source.dataset.actionPoints);
        const currentHealth = parseInt(source.dataset.currentHealth);
    
        // Check AP
        if (currentAP < spell.apCost) {
            addCombatMessage("Not enough action points!");
            return false;
        }
    
        // Check Mana
        if (spell.manaCost && currentMana < spell.manaCost) {
            addCombatMessage("Not enough mana!");
            return false;
        }
    
        // Check Health
        if (spell.healthCost && currentHealth <= spell.healthCost) {
            addCombatMessage("Not enough health!");
            return false;
        }
    
        // Spend resources
        const newAP = currentAP - spell.apCost;
        const newMana = spell.manaCost ? currentMana - spell.manaCost : currentMana;
        const newHealth = spell.healthCost ? currentHealth - spell.healthCost : currentHealth;
    
        // Update token
        source.dataset.actionPoints = newAP;
        source.dataset.currentMana = newMana;
        source.dataset.currentHealth = newHealth;
    
        // Update character state and HUD if it's the player
        if (source.classList.contains('player-token')) {
            // Update character state
            if (!characterState.combat) characterState.combat = {};
            characterState.combat.actionPoints = newAP;
            characterState.derivedStats.currentMana = newMana;
            characterState.derivedStats.currentHealth = newHealth;
    
            // Update HUD
            updateAPBar(newAP);
            updateManaBar();
            updateHealthBar();
        }
    
        // Update visuals
        updateTokenVisuals(source);
        return true;
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.spellbook-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });
    }
}


const tooltipSystem = {
    init() {
        console.log('Initializing tooltip system...');
        
        // Create permanent container and tooltip
        this.container = createPermanentTooltipContainer();
        
        document.addEventListener('mousemove', (e) => {
            // Only target spell icons in spellbook and action slots
            const target = e.target.closest('.spellbook-content .spell-icon, .action-slot');
            if (target) {
                const tooltipData = this.getTooltipData(target);
                if (tooltipData) {
                    this.renderTooltip(e, tooltipData);
                }
            } else {
                this.hideTooltip();
            }
        });
    },

    showTooltip(event, tooltipData) {
        const tooltip = document.getElementById('spellTooltip');
        if (!tooltip) return;

        // Build tooltip content
        let statsHTML = '';
        if (tooltipData.type === 'Consumable') {
            statsHTML = this.getConsumableStatsHTML(tooltipData);
        } else {
            statsHTML = this.getSpellStatsHTML(tooltipData);
        }

        tooltip.innerHTML = `
            <div class="tooltip-header">
                <span class="ability-icon">${tooltipData.icon || ''}</span>
                <span class="ability-name">${tooltipData.name || 'Unknown'}</span>
                <span class="ability-type">${tooltipData.type || ''}</span>
            </div>
            <div class="ability-description">${tooltipData.description || ''}</div>
            ${statsHTML}
        `;

        // Position the tooltip
        const padding = 15;
        let x = event.clientX + padding;
        let y = event.clientY + padding;

        // Adjust if tooltip would go off screen
        const rect = tooltip.getBoundingClientRect();
        if (x + rect.width > window.innerWidth) {
            x = event.clientX - rect.width - padding;
        }
        if (y + rect.height > window.innerHeight) {
            y = event.clientY - rect.height - padding;
        }

        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
        tooltip.style.display = 'block';
    },

    getTooltipData(element) {
        // For action bar slots
        if (element.classList.contains('action-slot')) {
            if (!element.dataset.actionType) return null;

            const data = {
                name: element.dataset.name,
                icon: element.dataset.icon,
                description: element.dataset.description,
                type: element.dataset.type || 'Spell',
                apCost: parseInt(element.dataset.apCost) || 0,
                manaCost: parseInt(element.dataset.manaCost) || 0,
                healthCost: parseInt(element.dataset.healthCost) || 0,
                range: parseInt(element.dataset.range) || 0,
                damage: element.dataset.damage || '',
                healing: element.dataset.healing || ''
            };

            if (element.dataset.actionType === 'consumable') {
                return {
                    ...data,
                    type: 'Consumable',
                    effects: element.dataset.effects ? JSON.parse(element.dataset.effects) : []
                };
            }

            return data;
        }

        // For spellbook spells
        if (element.classList.contains('spell-icon')) {
            return {
                name: element.dataset.name,
                icon: element.dataset.icon,
                description: element.dataset.description,
                type: element.dataset.type || 'Spell',
                apCost: parseInt(element.dataset.apCost) || 0,
                manaCost: parseInt(element.dataset.manaCost) || 0,
                healthCost: parseInt(element.dataset.healthCost) || 0,
                range: parseInt(element.dataset.range) || 0,
                damage: element.dataset.damage || '',
                healing: element.dataset.healing || ''
            };
        }

        // For inventory items
        if (element.classList.contains('inventory-item')) {
            try {
                const itemData = element.dataset.itemData ? JSON.parse(element.dataset.itemData) : null;
                if (itemData) {
                    return {
                        name: itemData.name,
                        icon: itemData.icon || '📦',
                        description: itemData.description || '',
                        type: itemData.type || 'Item',
                        effects: itemData.effects || [],
                        stats: itemData.stats || {}
                    };
                }
            } catch (error) {
                console.error('Error parsing item data:', error);
                return null;
            }
        }

        return null;
    },
    hideTooltip() {
        const tooltip = document.getElementById('spellTooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    },

    renderTooltip(event, data) {
        console.log('Rendering tooltip with data:', data);
        
        let tooltip = document.getElementById('spellTooltip');
        if (!tooltip) {
            console.log('Creating new tooltip element');
            tooltip = document.createElement('div');
            tooltip.id = 'spellTooltip';
            tooltip.style.position = 'fixed'; // Change to fixed positioning
            tooltip.style.zIndex = '9999';    // Ensure high z-index
            tooltip.style.backgroundColor = 'rgba(20, 20, 20, 0.95)';
            tooltip.style.border = '1px solid #6b2929';
            tooltip.style.padding = '12px';
            tooltip.style.borderRadius = '4px';
            tooltip.style.color = '#ffffff';
            tooltip.style.pointerEvents = 'none';
            tooltip.style.minWidth = '200px';
            tooltip.style.maxWidth = '300px';
            tooltip.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3), 0 0 15px rgba(107, 41, 41, 0.2)';
            document.body.appendChild(tooltip);
        }

        // Build the tooltip HTML based on the data type
        let statsHTML = '';
        if (data.type === 'Consumable') {
            statsHTML = this.getConsumableStatsHTML(data);
        } else {
            statsHTML = this.getSpellStatsHTML(data);
        }

        tooltip.innerHTML = `
            <div class="tooltip-header" style="display: flex; align-items: center; gap: 8px; padding-bottom: 8px; margin-bottom: 8px; border-bottom: 1px solid #6b2929;">
                <span class="ability-icon">${data.icon || ''}</span>
                <span class="ability-name" style="color: #ffd700; font-weight: bold;">${data.name || 'Unknown'}</span>
                <span class="ability-type" style="color: #8b8b8b; font-size: 0.9em;">${data.type || ''}</span>
            </div>
            <div class="ability-description" style="color: #d4d4d4; margin-bottom: 8px;">${data.description || ''}</div>
            ${statsHTML}
        `;

        // Position the tooltip
        this.positionTooltip(tooltip, event);
        tooltip.style.display = 'block';
    },

    positionTooltip(tooltip, event) {
        if (!tooltip) return;
        
        const padding = 15;
    
        // First, ensure the tooltip is visible so we can get its dimensions
        tooltip.style.display = 'block';
    
        const rect = tooltip.getBoundingClientRect();
        let x = event.clientX + padding;
        let y = event.clientY + padding;
    
        // Ensure tooltip stays within viewport
        if (x + rect.width > window.innerWidth) {
            x = event.clientX - rect.width - padding;
        }
        if (y + rect.height > window.innerHeight) {
            y = event.clientY - rect.height - padding;
        }
    
        // Set the position directly
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
    
        tooltip.style.visibility = 'visible';
    },
    

    getSpellStatsHTML(data) {
        return `
            <div class="ability-stats">
                ${data.damage ? `<div class="stat">Damage: ${data.damage}</div>` : ''}
                ${data.healing ? `<div class="stat">Healing: ${data.healing}</div>` : ''}
                ${data.range ? `<div class="stat">Range: ${data.range}</div>` : ''}
                ${data.apCost ? `<div class="stat ap">AP Cost: ${data.apCost}</div>` : ''}
                ${data.manaCost ? `<div class="stat mana">Mana Cost: ${data.manaCost}</div>` : ''}
                ${data.healthCost ? `<div class="stat health">Health Cost: ${data.healthCost}</div>` : ''}
            </div>
        `;
    },

    getConsumableStatsHTML(data) {
        if (!data) return '';
        
        let effects = [];
        try {
            if (typeof data.effects === 'string') {
                effects = JSON.parse(data.effects);
            } else if (Array.isArray(data.effects)) {
                effects = data.effects;
            } else if (typeof data.effects === 'object') {
                effects = Object.entries(data.effects).map(([stat, value]) => ({
                    type: stat,
                    value: value
                }));
            }
        } catch (error) {
            console.error('Error parsing effects:', error);
            effects = [];
        }
    
        return `
            <div class="item-effects">
                ${effects.map(effect => `
                    <div class="effect">
                        ${this.formatEffect(effect)}
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    formatEffect(effect) {
        if (!effect) return '';
        if (typeof effect === 'object') {
            const { type, value } = effect;
            switch(type) {
                case 'currentHealth':
                    return `Restores ${value} Health`;
                case 'currentMana':
                    return `Restores ${value} Mana`;
                default:
                    return `${type}: ${value}`;
            }
        }
        return String(effect);
    },
};

const createPermanentTooltipContainer = () => {
    // Remove any existing container
    const existingContainer = document.getElementById('permanent-tooltip-container');
    if (existingContainer) {
        existingContainer.remove();
    }

    // Create a new container that will exist outside the spellbook
    const container = document.createElement('div');
    container.id = 'permanent-tooltip-container';
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
    `;
    document.body.appendChild(container);

    // Create the tooltip element inside the container
    const tooltip = document.createElement('div');
    tooltip.id = 'spellTooltip';
    tooltip.style.display = 'none';
    container.appendChild(tooltip);

    return container;
};



function initializeActionBar() {
    const actionSlots = document.querySelectorAll('.action-slot');
    actionSlots.forEach((slot, index) => {
        const keyNumber = (index + 1) % 10;
        slot.dataset.keycode = `Digit${keyNumber === 0 ? '0' : keyNumber}`;
        
        // Clear existing content and add hotkey
        slot.innerHTML = '';
        const hotkeyDiv = document.createElement('div');
        hotkeyDiv.className = 'hotkey';
        hotkeyDiv.textContent = keyNumber === 0 ? '0' : keyNumber;
        slot.appendChild(hotkeyDiv);
    });
}

function initializeActionBarDropZones() {
    const actionSlots = document.querySelectorAll('.action-slot');
    actionSlots.forEach(slot => {
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            slot.classList.add('drag-hover');
        });

        slot.addEventListener('dragleave', () => {
            slot.classList.remove('drag-hover');
        });

        slot.addEventListener('drop', handleActionBarDrop);
    });
}

function handleActionBarDrop(e) {
    e.preventDefault();
    const slot = e.currentTarget;
    slot.classList.remove('drag-hover');

    try {
        const consumableData = e.dataTransfer.getData('application/json');
        if (consumableData) {
            const itemData = JSON.parse(consumableData);
            if (itemData.type === 'consumable') {
                // Clear existing content while preserving hotkey
                const hotkeyDiv = slot.querySelector('.hotkey');
                slot.innerHTML = '';
                if (hotkeyDiv) {
                    slot.appendChild(hotkeyDiv);
                }
                
                // Get item element and its complete data
                const itemElement = document.querySelector(
                    `.inventory-item[data-instance-id="${itemData.instanceId}"]`
                );
                
                if (!itemElement) {
                    console.error('Could not find source item element');
                    return;
                }
            
                const fullItemData = JSON.parse(itemElement.dataset.itemData);
                
                // Set up slot data and appearance
                slot.dataset.actionType = 'consumable';
                slot.dataset.instanceId = itemData.instanceId;
                slot.dataset.itemId = fullItemData.id.toString();
                slot.dataset.spellId = `consumable-${itemData.instanceId}`;
                slot.dataset.name = itemData.name;
                slot.dataset.description = itemData.description;
                slot.dataset.effects = itemData.effects;
                slot.dataset.icon = itemData.icon;
            
                // Handle image properly
                if (fullItemData.image) {
                    slot.style.backgroundImage = `url('${fullItemData.image}')`;
                }
            
                // Add quantity display with total across all stacks
                let totalQuantity = 0;
                const sameTypeStacks = document.querySelectorAll(
                    `.inventory-item[data-item-id="${fullItemData.id}"]`
                );
                sameTypeStacks.forEach(stack => {
                    totalQuantity += parseInt(stack.dataset.quantity) || 0;
                });
            
                const quantityDiv = document.createElement('div');
                quantityDiv.className = 'action-slot-quantity';
                quantityDiv.textContent = totalQuantity;
                slot.appendChild(quantityDiv);
                
                // Maintain hotkey display
                maintainHotkeyDisplay(slot);
                
                // Set initial opacity
                slot.style.opacity = totalQuantity > 0 ? '1' : '0.5';
                
                updateActionBarQuantities();
                return;
            }
        }

        // Handle spells
        const spellData = e.dataTransfer.getData('text/plain');
        if (spellData) {
            const data = JSON.parse(spellData);
            setupSpellSlot(slot, data);
        }
    } catch (error) {
        console.error('Error in handleActionBarDrop:', error);
    }
}

function clearActionSlot(slot) {
    // Preserve hotkey
    const hotkeyDiv = slot.querySelector('.hotkey');
    const hotkeyText = hotkeyDiv ? hotkeyDiv.textContent : '';
    
    // Clear slot content
    slot.innerHTML = '';
    
    // Restore hotkey if it existed
    if (hotkeyText) {
        const newHotkeyDiv = document.createElement('div');
        newHotkeyDiv.className = 'hotkey';
        newHotkeyDiv.textContent = hotkeyText;
        slot.appendChild(newHotkeyDiv);
    }
    
    // Clear data attributes except keycode
    Object.keys(slot.dataset).forEach(key => {
        if (key !== 'keycode') {
            delete slot.dataset[key];
        }
    });
    
    // Clear styles
    slot.style.backgroundImage = '';
    slot.style.opacity = '1';
}

function setupConsumableSlot(slot, data) {
    // Clear slot while preserving hotkey
    const hotkey = slot.querySelector('.hotkey');
    slot.innerHTML = '';

    // Important: Store itemId instead of instanceId for consumables
    Object.assign(slot.dataset, {
        actionType: 'consumable',
        itemId: data.itemId,
        name: data.name,
        description: data.description,
        effects: data.effects,
        icon: data.icon
    });

    // Create and set image
    const img = document.createElement('img');
    img.src = data.image;
    img.alt = data.name;
    img.draggable = false;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    img.style.position = 'absolute';
    img.style.top = '0';
    img.style.left = '0';
    slot.appendChild(img);

    // Create quantity display
    const quantityDisplay = document.createElement('div');
    quantityDisplay.className = 'action-slot-quantity';
    slot.appendChild(quantityDisplay);

    // Restore hotkey
    if (hotkey) {
        slot.appendChild(hotkey);
    }

    updateActionBarQuantities();
}

function setupConsumableSlot(slot, data) {
    // Clear slot while preserving hotkey
    const hotkey = slot.querySelector('.hotkey');
    slot.innerHTML = '';

    // Important: Store itemId instead of instanceId for consumables
    Object.assign(slot.dataset, {
        actionType: 'consumable',
        itemId: data.itemId,
        name: data.name,
        description: data.description,
        effects: data.effects,
        icon: data.icon
    });

    // Create and set image
    const img = document.createElement('img');
    img.src = data.image;
    img.alt = data.name;
    img.draggable = false;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    img.style.position = 'absolute';
    img.style.top = '0';
    img.style.left = '0';
    slot.appendChild(img);

    // Create quantity display
    const quantityDisplay = document.createElement('div');
    quantityDisplay.className = 'action-slot-quantity';
    slot.appendChild(quantityDisplay);

    // Restore hotkey
    if (hotkey) {
        slot.appendChild(hotkey);
    }

    updateActionBarQuantities();
}



// New helper functions
function getTotalQuantityForItem(itemId) {
    let totalQuantity = 0;
    const inventoryStacks = document.querySelectorAll(
        `.inventory-item[data-item-id="${itemId}"]`
    );
    
    inventoryStacks.forEach(stack => {
        totalQuantity += parseInt(stack.dataset.quantity) || 0;
    });
    
    return totalQuantity;
}

function consumeOneItem(itemId) {
    // Find all stacks of this item, sorted by quantity ascending
    const stacks = Array.from(document.querySelectorAll(
        `.inventory-item[data-item-id="${itemId}"]`
    )).sort((a, b) => {
        return (parseInt(a.dataset.quantity) || 0) - (parseInt(b.dataset.quantity) || 0);
    });

    // Use from the smallest stack first
    if (stacks.length > 0) {
        const stack = stacks[0];
        const inventoryItem = inventory.find(item => 
            item.instanceId.toString() === stack.dataset.instanceId
        );
        
        if (inventoryItem) {
            const currentQuantity = inventoryItem.quantity;
            
            if (currentQuantity > 1) {
                // Reduce stack
                inventoryItem.quantity = currentQuantity - 1;
                stack.dataset.quantity = currentQuantity - 1;
                const quantityElement = stack.querySelector('.item-quantity');
                if (quantityElement) {
                    quantityElement.textContent = currentQuantity - 1;
                }
            } else {
                // Remove empty stack
                inventory = inventory.filter(item => item.instanceId !== inventoryItem.instanceId);
                if (stack.parentNode) {
                    stack.parentNode.removeChild(stack);
                }
            }
        }
    }
}

function updateActionBarQuantities() {
    const actionSlots = document.querySelectorAll('.action-slot[data-action-type="consumable"]');
    
    actionSlots.forEach(slot => {
        if (!slot.dataset.itemId) return;

        const totalQuantity = getTotalQuantityForItem(slot.dataset.itemId);
        
        // Update quantity display
        let quantityDisplay = slot.querySelector('.action-slot-quantity');
        if (!quantityDisplay) {
            quantityDisplay = document.createElement('div');
            quantityDisplay.className = 'action-slot-quantity';
            slot.appendChild(quantityDisplay);
        }
        
        quantityDisplay.textContent = totalQuantity;

        // Update slot state but keep the image
        if (totalQuantity === 0) {
            slot.classList.add('empty');
            const img = slot.querySelector('img');
            if (img) {
                img.style.opacity = '0.5';
            }
        } else {
            slot.classList.remove('empty');
            const img = slot.querySelector('img');
            if (img) {
                img.style.opacity = '1';
            }
        }
    });
}



function setupSpellSlot(slot, spellData) {
    const spell = window.spellbook?.findSpell(spellData.id);
    if (!spell) return;

    // Ensure slot has a keycode
    if (!slot.dataset.keycode) {
        const slots = Array.from(document.querySelectorAll('.action-slot'));
        const index = slots.indexOf(slot);
        const keyNumber = (index + 1) % 10;
        slot.dataset.keycode = `Digit${keyNumber === 0 ? '0' : keyNumber}`;
    }

    // Set data attributes
    slot.dataset.actionType = 'spell';
    slot.dataset.spellId = spellData.id;
    slot.dataset.name = spell.name;
    slot.dataset.description = spell.description;
    slot.dataset.apCost = spell.apCost;
    slot.dataset.manaCost = spell.manaCost || 0;
    slot.dataset.healthCost = spell.healthCost || 0;
    slot.dataset.type = spell.type;
    slot.dataset.range = spell.range || 0;
    slot.dataset.icon = spell.icon;

    // Clear existing content
    const hotkeyDiv = slot.querySelector('.hotkey');
    slot.innerHTML = '';
    if (hotkeyDiv) {
        slot.appendChild(hotkeyDiv);
    }

    // Update or create the img element
    const img = document.createElement('img');
    img.src = spell.image || 'https://example.com/default-spell-image.png';
    img.alt = spell.name;
    slot.appendChild(img);

    // Maintain hotkey display
    maintainHotkeyDisplay(slot);

    // Setup click handler
    setupSpellClickHandler(slot, spellData.id);
}

function maintainHotkeyDisplay(slot) {
    // Ensure slot has a keycode
    if (!slot.dataset.keycode) {
        const slots = Array.from(document.querySelectorAll('.action-slot'));
        const index = slots.indexOf(slot);
        const keyNumber = (index + 1) % 10;
        slot.dataset.keycode = `Digit${keyNumber === 0 ? '0' : keyNumber}`;
    }
    
    const keyNumber = slot.dataset.keycode.replace('Digit', '');
    let hotkeyDiv = slot.querySelector('.hotkey');
    if (!hotkeyDiv) {
        hotkeyDiv = document.createElement('div');
        hotkeyDiv.className = 'hotkey';
        slot.appendChild(hotkeyDiv);
    }
    hotkeyDiv.textContent = keyNumber;
}


function initializeConsumableDragging() {
    const consumables = document.querySelectorAll('.inventory-item[data-type="consumable"]');
    
    consumables.forEach(consumable => {
        consumable.setAttribute('draggable', 'true');
        
        consumable.addEventListener('dragstart', (e) => {
            e.stopPropagation();
            
            // Get full item data
            const fullItemData = JSON.parse(consumable.dataset.itemData);
            
            const itemData = {
                instanceId: consumable.dataset.instanceId,
                itemId: fullItemData.id,
                name: consumable.dataset.name,
                type: 'consumable',
                description: consumable.dataset.description,
                image: fullItemData.image, // Use the direct image URL from item data
                effects: consumable.dataset.effects || '[]',
                icon: consumable.dataset.icon || '📦'
            };

            e.dataTransfer.setData('application/json', JSON.stringify(itemData));
            e.dataTransfer.effectAllowed = 'copy';
        });
    });
}

function setupConsumableClickHandler(slot, instanceId) {
    slot.onclick = () => {
        const itemElement = document.querySelector(`.inventory-item[data-instance-id="${instanceId}"]`);
        const playerToken = document.querySelector('.token.player-token');
        if (playerToken && itemElement) {
            useItem(JSON.parse(itemElement.dataset.itemData), itemElement);
        }
    };
}

function setupSpellClickHandler(slot, spellId) {
    slot.onclick = () => {
        const playerToken = document.querySelector('.token.player-token');
        if (playerToken && window.spellbook) {
            window.spellbook.castSpell(spellId, playerToken);
        }
    };
}

function formatStatName(stat) {
    const statNames = {
        'strength': 'Strength',
        'intelligence': 'Intelligence',
        'spirit': 'Spirit',
        'agility': 'Agility'
    };
    return statNames[stat] || stat;
}

function findSpellById(spellId) {
    for (const category in window.spellData) {
        if (window.spellData[category].spells[spellId]) {
            return window.spellData[category].spells[spellId];
        }
    }
    return null;
}



// Initialize everything
document.addEventListener('DOMContentLoaded', () => {

    tooltipSystem.init();
    
    initializeActionBarDropZones();
    window.spellbook = new Spellbook();
    initializeConsumableDragging();

    
});


document.addEventListener('drop', (e) => {
    const actionSlot = e.target.closest('.action-slot');
    if (!actionSlot && document.querySelector('.action-slot.dragging')) {
        const draggingSlot = document.querySelector('.action-slot.dragging');
        clearActionSlot(draggingSlot);
        updateActionBarQuantities();
    }
});